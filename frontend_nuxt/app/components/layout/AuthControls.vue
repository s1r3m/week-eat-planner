<script setup lang="ts">
	const route = useRoute()

	const showLogin = computed(() => route.name !== 'login')
	const showSignup = computed(() => route.name !== 'signup')
</script>

<template>
	<div class="controls-container">
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
	.controls-container {
		display: flex;
		align-items: center;
		column-gap: var(--space-md);
	}
</style>
