<template>
  <div class="app-shell h-full">
    <router-view v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.meta.requiresAuth ? 'auth' : 'guest'" />
      </Transition>
    </router-view>
  </div>
</template>
