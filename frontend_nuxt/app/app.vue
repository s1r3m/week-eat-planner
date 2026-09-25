<script setup lang="ts">
  import GlobalToast from '@/common/ui/GlobalToast.vue'

  useHead({
    script: [
      {
        innerHTML: `(function(){var t=localStorage.getItem('wep-theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.add('light')})()`,
        tagPriority: 'critical',
      },
    ],
  })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <GlobalToast />
  </ClientOnly>
</template>
