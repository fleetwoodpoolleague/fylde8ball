<script setup lang="ts">
import { computed } from 'vue'
import { ballForSlug } from '../utils/ballColor'

const props = withDefaults(
  defineProps<{
    /** Tournament slug — picks a stable ball colour/number */
    slug?: string
    /** Explicit CSS colour, overrides the slug-derived one */
    color?: string
    size?: string
    /** Show the ball number in a white circle (needs a slug) */
    numbered?: boolean
  }>(),
  { size: '2.5rem', numbered: false },
)

const ball = computed(() => (props.slug ? ballForSlug(props.slug) : null))
const fill = computed(() => props.color ?? ball.value?.color ?? 'var(--color-ball-black)')
</script>

<template>
  <span
    class="ball-badge shrink-0"
    :style="{ '--ball-fill': fill, width: size, height: size }"
    aria-hidden="true"
  >
    <span v-if="numbered && ball" class="ball-number">{{ ball.number }}</span>
  </span>
</template>

<style scoped>
.ball-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0) 30%),
    var(--ball-fill);
  box-shadow:
    inset -2px -3px 5px rgba(0, 0, 0, 0.35),
    0 1px 2px rgba(0, 0, 0, 0.25);
}

.ball-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52%;
  height: 52%;
  border-radius: 50%;
  background: #fff;
  color: #1c1c1c;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
}
</style>
