<script setup lang="ts">
  import BaseBadge from '@/common/ui/BaseBadge.vue'
  import BaseButton from '@/common/ui/BaseButton.vue'
</script>

<template>
  <section class="hero">
    <div class="hero__block">
      <BaseBadge variant="outline">Smarter meal planning</BaseBadge>

      <h2 class="hero__title">
        Plan once.
        <span>Eat better</span>
        all week.
      </h2>

      <p class="hero__description">
        Build a week of meals, keep your budget on track, and reduce waste with
        auto-generated grocery lists.
      </p>

      <div class="hero__controls">
        <BaseButton @click="navigateTo({ name: 'login' })">
          Start Planning
        </BaseButton>

        <BaseButton
          variant="outline"
          :disabled="true"
        >
          See how it works
        </BaseButton>
      </div>
    </div>

    <img
      class="hero__img"
      src="/images/photo2.jpg"
      alt=""
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
  .hero {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .hero__block {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .hero__title {
    font-size: var(--text-32);
    line-height: 1.5;
  }

  .hero__description {
    font-size: var(--text-18);
    line-height: 1.5;
  }

  .hero__controls {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--space-4);
  }

  .hero__img {
    width: 100%;
    max-width: 480px;
    height: auto;
    border-radius: var(--radius-lg);
  }

  @media (--desktop) {
    .hero {
      flex-direction: row;
      justify-content: space-between;
    }

    .hero__block {
      flex-direction: column;
      align-items: start;
      justify-content: center;
      padding: var(--space-4);
      gap: var(--space-8);
    }

    .hero__controls {
      flex-direction: row;
      justify-content: start;
      column-gap: var(--space-8);
    }

    .hero__title {
      font-size: var(--text-48);
      line-height: 1.5;
      text-align: left;
    }

    .hero__description {
      font-size: var(--text-24);
      line-height: 2;
      text-align: left;
    }
  }
</style>
