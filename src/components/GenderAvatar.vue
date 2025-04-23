<template>
  <div
    class="w-30 h-30 group transition-transform duration-200"
    :class="{ 'hover:scale-125': isRevealed,
      'border-2 rounded-full border-blue-400': guess.gender === 'boy' && isRevealed,
      'border-2 rounded-full border-pink-400': guess.gender === 'girl' && isRevealed,
     }"
    :style="guess.style"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
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
  methods: {
    handleMouseOver() {
      if (this.isRevealed) {
        this.$emit('hover', this.guess);
      }
    },
    handleMouseLeave() {
      if (this.isRevealed) {
        this.$emit('leave');
      }
    },
  },
};
</script>