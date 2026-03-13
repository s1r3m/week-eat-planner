<template>
  <div id="recipe-page">
    <PageTitle header="Recipes" description="Discover recipes for every meal" />

    <section id="featured" class="mx-6 mt-3">
      <Card>
        <CardHeader>
          <CardTitle>Featured</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-3">
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
        </CardContent>
      </Card>
    </section>
    <section id="breakfast" class="mx-6 mt-3">
      <Card>
        <CardHeader>
          <CardTitle>Breakfasts</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-3">
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
        </CardContent>
      </Card>
    </section>
    <section id="lunch" class="mx-6 mt-3">
      <Card>
        <CardHeader>
          <CardTitle>Lunch</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-3">
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
        </CardContent>
      </Card>
    </section>
    <section id="dinner" class="mx-6 mt-3">
      <Card>
        <CardHeader>
          <CardTitle>Dinner</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-3">
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
        </CardContent>
      </Card>
    </section>
    <section id="snacks" class="mx-6 mt-3">
      <Card>
        <CardHeader>
          <CardTitle>Snacks</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-3">
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
          <Skeleton class="size-36" />
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>
