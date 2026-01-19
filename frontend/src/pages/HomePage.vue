<template>
  <main class="flex flex-col gap-20 px-4 pb-20 pt-10">
    <section id="hero" class="grid items-center gap-10 md:grid-cols-2 scroll-mt-24">
      <article class="space-y-4 text-center md:text-left">
        <Badge variant="default"> Smarter meal planning </Badge>
        <h1 class="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          Plan once. <span class="text-primary">Eat better</span> all week
        </h1>
        <p class="text-lg text-muted-foreground">
          Build a week of meals, keep your budget on track, and reduce waste with auto-generated
          grocery lists.
        </p>
        <div class="flex flex-col items-center gap-3 md:flex-row md:items-center">
          <Button size="lg" class="w-full md:w-auto" @click="$router.push('/signup')">
            Start planning
          </Button>
          <Button variant="secondary" size="lg" class="w-full md:w-auto" as-child>
            <router-link to="#use-cases">See how it works</router-link>
          </Button>
        </div>
      </article>
      <AspectRatio :ratio="1 / 1" class="bg-muted rounded-xl">
        <img
          src="@/assets/photo2.jpg"
          alt="Weekly meal plan preview"
          class="w-full h-full rounded-xl"
        />
      </AspectRatio>
    </section>

    <section id="use-cases" class="space-y-6 scroll-mt-24">
      <div class="flex flex-col gap-2 text-center">
        <h2 class="text-3xl font-semibold text-foreground">For every routine</h2>
        <p class="text-muted-foreground">Stay flexible while keeping your meals intentional.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-2xl border bg-card/60 p-6 shadow-sm">
          <h3 class="text-xl font-semibold text-foreground">Athletes</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Balance macros, schedule training days, and keep fuel ready.
          </p>
        </div>
        <div class="rounded-2xl border bg-card/60 p-6 shadow-sm">
          <h3 class="text-xl font-semibold text-foreground">Families</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Coordinate busy schedules, avoid takeout, and keep favorites on rotation.
          </p>
        </div>
        <div class="rounded-2xl border bg-card/60 p-6 shadow-sm">
          <h3 class="text-xl font-semibold text-foreground">Diets</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Plan around dietary needs, swap meals fast, and generate precise shopping lists.
          </p>
        </div>
      </div>
    </section>

    <section id="carousel" class="flex justify-center py-16 md:py-20">
      <Carousel class="w-full max-w-5xl" :opts="{ align: 'center', loop: true }">
        <CarouselContent class="-ml-2 md:-ml-4">
          <CarouselItem
            v-for="{ id, src } in photos"
            :key="id"
            class="pl-2 md:pl-4 basis-11/12 sm:basis-3/4 md:basis-2/3 lg:basis-1/2"
          >
            <Card class="p-2 md:p-3">
              <CardContent>
                <AspectRatio :ratio="1 / 1" class="bg-muted rounded-xl">
                  <img :src="src" alt="carousel item" class="w-full h-full rounded-xl" />
                </AspectRatio>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>

    <section
      id="get-started"
      class="rounded-3xl border bg-muted/40 px-6 py-10 md:px-10 scroll-mt-24"
    >
      <div class="grid gap-8 md:grid-cols-[1.2fr,1fr] md:items-center">
        <article class="space-y-3">
          <p class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick start
          </p>
          <h2 class="text-3xl font-semibold text-foreground">Get set up in minutes</h2>
          <p class="text-muted-foreground">
            No complicated setup — just add your meals, generate your list, and start the week
            confident.
          </p>
          <div class="grid gap-3 text-sm text-foreground md:grid-cols-2">
            <div class="rounded-xl border bg-background/80 px-4 py-3">
              <p class="font-semibold">Create your week</p>
              <p class="text-muted-foreground">Drop in meals for each day and meal type.</p>
            </div>
            <div class="rounded-xl border bg-background/80 px-4 py-3">
              <p class="font-semibold">Attach recipes</p>
              <p class="text-muted-foreground">Keep favorites ready to reuse and tweak.</p>
            </div>
            <div class="rounded-xl border bg-background/80 px-4 py-3">
              <p class="font-semibold">Auto grocery list</p>
              <p class="text-muted-foreground">Generate a shopping list from your plan.</p>
            </div>
            <div class="rounded-xl border bg-background/80 px-4 py-3">
              <p class="font-semibold">Adapt quickly</p>
              <p class="text-muted-foreground">Swap meals and keep the list in sync.</p>
            </div>
          </div>
        </article>

        <div class="flex flex-col gap-4 rounded-2xl border bg-background/70 p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Next step</p>
              <p class="text-lg font-semibold text-foreground">Start your first week</p>
            </div>
            <div
              class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold"
            >
              1
            </div>
          </div>
          <p class="text-muted-foreground">
            Create your account and build your first plan. We’ll keep your recipes and shopping
            lists organized.
          </p>
          <div class="flex flex-col gap-2 sm:flex-row">
            <Button class="w-full sm:w-auto" @click="$router.push('/signup')"
              >Create account</Button
            >
            <Button variant="secondary" class="w-full sm:w-auto" as-child>
              <router-link to="/login">Log in</router-link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const photos = [
  { id: 1, src: new URL('@/assets/photo3.jpg', import.meta.url).href },
  { id: 2, src: new URL('@/assets/photo4.jpg', import.meta.url).href },
  { id: 3, src: new URL('@/assets/photo5.jpg', import.meta.url).href },
];
</script>
