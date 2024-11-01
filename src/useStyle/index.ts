import type { PermissiveTarget } from '../types'
import { tryOnMounted, tryOnUnmounted } from '@vueuse/core'
import { ref, unref } from 'vue'

interface Transform {
  translateX: number
  translateY: number
  translateZ: number
  scaleX: number
  scaleY: number
}

export interface UseStyleReturn {
  transform: Transform
}

function parseTransform(value: string) {
  const translate3dMatch = /translate3d\(([^)]+)\)/.exec(value)
  const scaleXMatch = /scaleX\(([\d.]+)\)/.exec(value)
  const scaleYMatch = /scaleY\(([\d.]+)\)/.exec(value)

  const [x, y, z] = translate3dMatch
    ? translate3dMatch[1].split(',').map(val => Number.parseFloat(val))
    : [0, 0, 0]

  return {
    translateX: x,
    translateY: y,
    translateZ: z,
    scaleX: scaleXMatch ? Number.parseFloat(scaleXMatch[1]) : 1,
    scaleY: scaleYMatch ? Number.parseFloat(scaleYMatch[1]) : 1,
  }
}

export function useStyle(target: PermissiveTarget) {
  let observer: MutationObserver

  const transform = ref<Partial<Transform>>({})

  tryOnMounted(() => {
    observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        const { style } = m.target as HTMLElement
        transform.value = parseTransform(style.transform ?? '')
      })
    })

    const elt = unref(target)

    if (!elt)
      return

    observer.observe(elt as Node, {
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
