<template>
  <div>
    <NeoCollapse
      :open="isOpen"
      :position="position"
      aria-id="contentIdForA11y1"
      :class="{ 'select-none': !isSelectable }"
    >
      <template #trigger="props">
        <a
          aria-controls="contentIdForA11y1"
          class="mb-2"
        >
          <NeoIcon
            class="collapse-icon"
            :icon="!props.open ? 'eye' : 'eye-slash'"
          />
          <span class="pl-1">{{ $t(!props.open ? visible : hidden) }}</span>
        </a>
      </template>
      <slot class="mt-2" />
    </NeoCollapse>
  </div>
</template>

<script lang="ts" setup>
import { NeoCollapse, NeoIcon } from '@kodadot1/brick'

const cprops = withDefaults(
  defineProps<{
    visible: string
    hidden: string
    bottom?: boolean
    isSelectable?: boolean
    defaultOpen?: boolean
  }>(),
  {
    visible: 'Show',
    hidden: 'Hide',
    bottom: false,
    isSelectable: false,
    defaultOpen: false,
  },
)
const isOpen = ref(cprops.defaultOpen)
const position = computed(() => (cprops.bottom ? 'bottom' : 'top'))
</script>
