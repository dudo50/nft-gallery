<template>
  <div
    class="border text-xs justify-center py-1 my-2 flex items-center w-[66px] h-[22px]"
    :class="getInteractionColor(interaction, { distinguishBuyAndSell })"
  >
    {{ interactionName }}
  </div>
</template>

<script setup lang="ts">
import { getInteractionColor } from './common'

withDefaults(
  defineProps<{
    interaction: string
    interactionName: string
    distinguishBuyAndSell?: boolean
  }>(),
  {
    distinguishBuyAndSell: false,
  },
)
</script>
