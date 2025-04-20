<template>
  <div
    class="w-20 h-20 group"
    :class="{ 'hover:scale-125': isRevealed }"
    :style="guess.style"
  >
    <img
      v-if="guess.avatar"
      :src="guess.avatar"
      class="w-full h-full rounded-full object-cover"
      :class="{ 'opacity-50': !isRevealed, 'opacity-100': isRevealed }"
    />
    <div
      v-else
      class="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-2xl text-white"
      :class="{ 'opacity-50': !isRevealed, 'opacity-100': isRevealed }"
    >
      {{ guess.name }}
    </div>
    <span
      v-if="!isRevealed"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-black"
    >?</span>
    <div
      v-if="isRevealed"
      class="invisible group-hover:visible bg-black/80 text-white p-2 text-2xl rounded absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
    >
      {{ guess.name }}: {{ guess.reason }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GenderAvatar',
  props: {
    guess: {
      type: Object,
      required: true,
    },
    isRevealed: {
      type: Boolean,
      required: true,
    },
  },
};
</script>