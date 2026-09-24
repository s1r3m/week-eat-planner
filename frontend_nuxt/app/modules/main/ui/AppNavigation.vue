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
          :class="{ collapsed }"
        >
          {{ link.title }}
        </span>
      </NuxtLink>

      <div
        v-if="link.child?.length && !collapsed"
        class="nav__children"
      >
        <template
          v-for="child in link.child"
          :key="child.id"
        >
          <span
            v-if="child.inactive"
            class="nav__child-link nav__child-link--inactive"
          >
            {{ child.title }}
          </span>

          <NuxtLink
            v-else
            class="nav__child-link"
            :to="child.to"
          >
            {{ child.title }}
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nav {
    display: flex;
    flex-direction: column;
    padding: var(--space-md);
    gap: var(--space-md);
  }

  .nav__item {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .nav__link {
    display: flex;
    align-items: center;
    padding: var(--space-xs);
    transition: all 0.3s ease;
    border-radius: var(--radius-xl);
    color: var(--color-on-surface-variant);
    font-size: var(--font-size-body);
    gap: var(--space-md);

    &:hover {
      background-color: var(--color-surface-variant);
    }

    &.router-link-active {
      background-color: var(--color-surface-variant);
      color: var(--color-primary);
    }
  }

  .nav__title {
    max-width: 100%;
    overflow: hidden;
    transition: all 0.3s ease;
    opacity: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .collapsed {
    max-width: 0;
    opacity: 0;
  }

  .nav__children {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding-left: var(--space-xl);
  }

  .nav__child-link {
    padding: var(--space-xs) var(--space-sm);
    overflow: hidden;
    transition: all 0.3s ease;
    border-radius: var(--radius-xl);
    color: var(--color-on-surface-variant);
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      background-color: var(--color-surface-variant);
      color: var(--color-primary);
    }

    &.router-link-exact-active {
      background-color: var(--color-surface-variant);
      color: var(--color-primary);
    }
  }

  .nav__child-link--inactive {
    opacity: 0.5;
    color: var(--color-on-surface-variant);
    cursor: not-allowed;
  }
</style>
