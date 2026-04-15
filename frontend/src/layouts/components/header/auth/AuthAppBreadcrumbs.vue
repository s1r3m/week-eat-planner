<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, idx) in breadcrumbs" :key="item.label">
        <BreadcrumbItem>
          <template v-if="item.to">
            <BreadcrumbLink as-child>
              <router-link :to="item.to"> {{ item.label }}</router-link>
            </BreadcrumbLink>
            <BreadcrumbSeparator v-if="idx < breadcrumbs.length - 1" />
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/layouts/composables/breadcrumbs';

const breadcrumbs = useBreadcrumbs();
</script>
