<script setup lang="ts">
  import type { MealSlot } from '@/modules/weeks/types'

  import BaseButton from '@/common/ui/BaseButton.vue'

  defineProps<{ mealSlot: MealSlot }>()
</script>

<template>
  <div
    class="slot"
    :class="{ 'slot--filled': !!mealSlot.recipe }"
  >
    <div class="slot__bg">
      <img
        v-if="mealSlot.recipe?.image_url"
        class="slot__bg-image"
        :src="mealSlot.recipe?.image_url"
        alt=""
        loading="lazy"
      />
    </div>

    <div class="slot__content">
      <BaseButton>{{ mealSlot.meal_type }}</BaseButton>

      <template v-if="mealSlot.recipe">
        <div class="slot__portion">
          <span class="slot__portion-control">
            <Icon name="lucide:minus" />
          </span>
          1
          <span class="slot__portion-control">
            <Icon name="lucide:plus" />
          </span>
        </div>

        <BaseButton
          v-if="mealSlot.recipe"
          variant="outline"
        >
          {{ mealSlot.recipe?.name }}
        </BaseButton>
      </template>

      <div
        v-else
        class="slot__assign"
      >
        <Icon
          name="lucide:plus"
          :size="14"
        />
        Assign a recipe
      </div>
    </div>
  </div>
</template>

<style scoped>
  .slot {
    display: grid;
    position: relative;
    grid-template-areas: 1 / 1;
    height: 8rem;
    overflow: hidden;
    transition: all var(--duration-base) ease;
    border: 1px dotted var(--brand-primary);
    border-radius: var(--radius-xl);
    cursor: pointer;

    &:hover {
      background-color: color-mix(in oklab, var(--brand-primary) 25%, white);
    }
  }

  .slot--filled {
    border: 1px solid var(--brand-primary);
  }

  .slot__bg {
    position: absolute;
    z-index: 0;
    grid-area: 1 / 1;
    transition: all var(--duration-base) ease;
    inset: 0;

    .slot__bg-image {
      display: block;
      width: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform var(--duration-base) ease;
    }

    &::after {
      content: '';
      position: absolute;
      z-index: 0;
      background: rgb(255 255 255 / 50%);
      pointer-events: none;
      inset: 0;
      backdrop-filter: blur(3px);
    }
  }

  .slot:hover .slot__bg img {
    transform: scale(1.1);
  }

  .slot__content {
    display: flex;
    position: relative;
    grid-area: 1 / 1;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2);

    .slot__portion {
      z-index: 10;
    }

    .slot__portion-control {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);

      &:hover {
        background-color: color-mix(
          in oklab,
          var(--brand-primary) 25%,
          rgb(255 255 255)
        );
      }
    }

    .slot__assign {
      display: flex;
      align-items: center;
      font-size: var(--text-12);
    }
  }
</style>
