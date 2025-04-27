<template>
  <div
    class="w-50 h-50  cursor-pointer"
    :style="guess.style"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <img
      v-if="guess.avatar"
      :src="guess.avatar"
      class="w-full h-full rounded-full hover:scale-125 transition-transform duration-1000 ease-in-out border-2"
      :class="{ 'opacity-80 border-gray-400': !isRevealed, 'opacity-100 ': isRevealed, 'border-blue-400': guess.gender === 'boy' && isRevealed,
      'border-pink-400': guess.gender === 'girl' && isRevealed, }"
    />
    <div
      v-else
      class="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-2xl text-white"
      :class="{ 'opacity-80': !isRevealed, 'opacity-100': isRevealed }"
    >
      {{ guess.name }}
    </div>
    <span
      v-if="!isRevealed"
      class="absolute top-6/7 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-black bg-gray-100 opacity-50 font-bold"
    >{{ guess.name }}</span>
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