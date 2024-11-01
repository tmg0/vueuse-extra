import type { MaybeRefOrGetter } from '@vueuse/core'

export type PermissiveTarget = MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>
