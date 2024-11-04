import type { PermissiveTarget } from '../types'
import { tryOnMounted, tryOnUnmounted } from '@vueuse/core'
import { destr } from 'destr'
import { computed, ref, unref } from 'vue'

type Transform = Record<string, string | number | (string | number)[]>

export interface UseStyleOptions {
  lazy?: boolean
  immediate?: boolean
}

export interface UseStyleReturn {
  transform: Transform
}

const TRANSFORM_RE = /(\w+)\(([-\s,.%\w]+)\)/g

function useTransform(target: PermissiveTarget) {
  return computed(() => {
    const transform: Transform = { scaleX: 1, scaleY: 1 }

    const elt = unref(target) as HTMLElement | undefined

    if (!elt) {
      return transform
    }

    const value = (elt.style.transform ?? '').trim()

    const matches = value.matchAll(TRANSFORM_RE)
    for (const match of matches) {
      const [_, f, a] = match
      const args = a.split(',').map(i => destr<string | number>(i.trim()))
      transform[f] = args.length > 1 ? args : args[0]
    }

    return transform
  })
}

export function useStyle(target: PermissiveTarget, options: UseStyleOptions = {}) {
  let observer: MutationObserver

  const elt = computed(() => unref(target) as HTMLElement | undefined)
  const transform = ref<Partial<Transform>>({})

  if (elt.value)
    transform.value = useTransform(elt).value

  tryOnMounted(() => {
    if (options.lazy)
      return

    observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        transform.value = useTransform(m.target as HTMLElement).value
      })
    })

    if (!elt.value)
      return

    observer.observe(elt.value as Node, {
      attributes: true,
      attributeFilter: ['style'],
    })
  })

  tryOnUnmounted(() => {
    observer?.disconnect()
  })

  return {
    transform,
  }
}
