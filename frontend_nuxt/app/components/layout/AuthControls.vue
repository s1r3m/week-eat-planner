<script setup lang="ts">
	const route = useRoute()

	const loginHidden = computed(() => route.name === 'login')
	const signupHidden = computed(() => route.name === 'signup')
</script>

<template>
	<div class="controls-container">
		<button
			type="button"
			class="btn"
			:hidden="loginHidden"
			@click="navigateTo({ name: 'login' })"
		>
			Login
		</button>

		<button
			type="button"
			class="btn primary"
			:hidden="signupHidden"
			@click="navigateTo({ name: 'signup' })"
		>
			Register
		</button>
	</div>
</template>

<style scoped>
	.controls-container {
		display: flex;
		align-items: center;
		column-gap: var(--space-md);
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		transition: all 0.3s ease;
	}

	.primary {
		background-color: var(--color-primary);
	}
</style>
