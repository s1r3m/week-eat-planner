<script setup lang="ts">
	const route = useRoute()

	const showLogin = computed(() => route.name !== 'login')
	const showSignup = computed(() => route.name !== 'signup')
</script>

<template>
	<div class="header-controls">
		<UiButton
			v-if="showLogin"
			variant="outline"
			@click="navigateTo({ name: 'login' })"
		>
			Login
		</UiButton>

		<UiButton
			v-if="showSignup"
			@click="navigateTo({ name: 'signup' })"
		>
			Register
		</UiButton>
	</div>
</template>

<style scoped>
	.header-controls {
		display: flex;
		align-items: center;
		padding: var(--space-md);
		column-gap: var(--space-md);
	}
</style>
