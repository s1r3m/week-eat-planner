<script setup lang="ts">
	const authStore = useAuthStore()

	// await useAsyncData('auth-init', () => authStore.init(), { server: false })
	await authStore.init()
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
