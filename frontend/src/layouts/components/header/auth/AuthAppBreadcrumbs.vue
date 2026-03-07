<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, idx) in items" :key="item.label">
        <BreadcrumbItem>
          <template v-if="item.to">
            <BreadcrumbLink as-child>
              <router-link :to="item.to"> {{ item.label }}</router-link>
            </BreadcrumbLink>
            <BreadcrumbSeparator v-if="idx < items.length - 1" />
          </template>
          <template v-else>
            <BreadcrumbPage> {{ item.label }} </BreadcrumbPage>
          </template>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useRoute } from 'vue-router';

interface Breadcrumbs {
  to?: string;
  label: string;
}
const route = useRoute();
const buildItems = (route: RouteLocationNormalizedLoadedGeneric) => {
  if (route.matched.length < 2) {
    return [{ label: 'Home' }] as Breadcrumbs[];
  }
  const pageMeta = route.matched[1].meta.breadcrumbs;
  const crumbs = typeof pageMeta === 'function' ? pageMeta(route) : pageMeta;
  return crumbs as Breadcrumbs[];
};

const items = computed(() => buildItems(route));
</script>
