<script setup lang="ts">
  import { useAppNavigation } from '@/modules/main/composables/useAppNavigation'

  defineProps<{
    collapsed: boolean
  }>()

  const { navLinks } = useAppNavigation()
</script>

<template>
  <div class="nav">
    <div
      v-for="link in navLinks"
      :key="link.id"
      class="nav__item"
    >
      <NuxtLink
        class="nav__link"
        :to="link.to"
        :aria-label="link.title"
      >
        <Icon
          v-if="link.icon"
          :name="link.icon"
        />

        <span
          class="nav__title"
          :class="{ 'nav__title--collapsed': collapsed }"
        >
          {{ link.title }}
        </span>
      </NuxtLink>

      <div
        v-if="link.child?.length && !collapsed"
        class="nav__children"
      >
        <NuxtLink
          v-for="child in link.child"
          :key="child.id"
          class="nav__child-link"
          :to="child.to"
        >
          {{ child.title }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .nav__item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .nav__link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1);
    border-radius: var(--radius-xl);
    color: var(--text);
    font-size: var(--text-14);
    transition:
      color,
      background-color var(--duration-base) ease;

    &:hover {
      background-color: var(--bg-elevated);
    }

    &.router-link-active {
      background-color: var(--bg-elevated);
      color: var(--brand-primary);
    }
  }

  .nav__title {
    max-width: 100%;
    overflow: hidden;
    opacity: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition:
      opacity,
      max-width var(--duration-base) ease;
  }

  .nav__title--collapsed {
    max-width: 0;
    opacity: 0;
  }

  .nav__children {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding-left: var(--space-8);
  }

  .nav__child-link {
    padding: var(--space-1) var(--space-2);
    overflow: hidden;
    border-radius: var(--radius-xl);
    color: var(--text);
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all var(--duration-base) ease;

    &:hover,
    &.router-link-exact-active {
      background-color: var(--bg-elevated);
      color: var(--brand-primary);
    }
  }

  .nav__child-link--inactive {
    opacity: 0.5;
    color: var(--text);
    cursor: not-allowed;
  }
</style>
