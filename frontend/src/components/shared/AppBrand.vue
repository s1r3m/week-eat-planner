<template>
  <router-link
    :to="{ name: 'promo' }"
    class="flex items-center text-foreground hover:text-foreground/80"
  >
    <div class="flex shrink-0 bg-transparent group-data-[collapsible=icon]:size-10">
      <img class="size-10" src="@/assets/logo.png" alt="Week Eat Planner logo" />
    </div>
    <h1
      class="text-lg font-semibold tracking-tight text-brand-primary group-data-[collapsible=icon]:hidden"
    >
      Week Eat Planner
    </h1>
  </router-link>
</template>
