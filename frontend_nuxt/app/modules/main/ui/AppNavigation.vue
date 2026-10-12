<script setup lang="ts">
  import { useAppNavigation } from '@/modules/main/composables/useAppNavigation'
  import BaseButton from '~/common/ui/BaseButton.vue'

  defineProps<{
    collapsed?: boolean
  }>()

  defineEmits<{
    navigate: []
  }>()

  const { navLinks } = useAppNavigation()
</script>

<template>
  <ul class="nav">
    <li
      v-for="link in navLinks"
      :key="link.id"
      class="nav__item"
    >
      <NuxtLink
        class="nav__link"
        :to="link.to"
        @click="$emit('navigate')"
      >
        <Icon
          v-if="link.icon"
          :name="link.icon"
          :size="24"
        />

        <span
          class="nav__title"
          :class="{ 'nav__title--collapsed': collapsed }"
        >
          {{ link.title }}
        </span>

        <BaseButton
          v-if="link.child && !collapsed"
          class="nav__link-collapse-btn"
          :class="{ 'nav__item-toggle--collapsed': collapsed }"
          variant="icon"
          @click.stop=""
        >
          <Icon
            :name="collapsed ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :size="24"
          />
        </BaseButton>
      </NuxtLink>

      <ul
        v-if="link.child?.length && !collapsed"
        class="nav__children"
      >
        <li
          v-for="child in link.child"
          :key="child.id"
          class="nav__child-link"
        >
          <NuxtLink
            class="nav__link"
            :to="child.to"
            @click="$emit('navigate')"
          >
            {{ child.title }}
          </NuxtLink>
        </li>
      </ul>
    </li>
  </ul>
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
    gap: var(--space-2);
  }

  .nav__item-toggle {
    max-width: 100%;
    transition:
      opacity,
      max-width var(--duration-base) ease;
  }

  .nav__item-toggle--collapsed {
    max-width: 0;
    opacity: 0;
  }

  .nav__link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-xl);
    color: var(--text);
    font-size: var(--text-14);
    transition:
      color,
      background-color var(--duration-base) ease;

    &:hover {
      background-color: var(--bg-green-hover);
      color: var(--brand-primary);
    }
  }

  .nav__link.router-link-active {
    background-color: var(--bg-green-active);
    color: var(--brand-primary);
  }

  .nav__title {
    max-width: 100%;
    overflow: hidden;
    opacity: 1;
    text-overflow: ellipsis;
    font-size: var(--text-16);
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
    gap: var(--space-2);
    padding-left: var(--space-6);
  }

  .nav__child-link {
    border-left: 1px solid var(--border);
    padding-left: var(--space-4);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
