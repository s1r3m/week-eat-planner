<script setup lang="ts">
	const { name = '' } = defineProps<{
		name?: string
	}>()
</script>

<template>
	<div class="loading-state">
		<div class="loading-state__card">
			<span class="spinner"></span>

			<h2 class="loading-state__title">Loading {{ name }}...</h2>
		</div>
	</div>
</template>

<style scoped>
	.loading-state {
		max-width: 480px;
		margin: var(--space-md) auto;
	}

	.loading-state__card {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: center;
		padding: var(--space-md);
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
	}

	.spinner {
		display: inline-block;
		width: 24px;
		height: 24px;
		animation: spin 0.7s linear infinite;
		border: 3px solid var(--color-primary);
		border-radius: 50%;
		border-right-color: transparent;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
