<script setup lang="ts">
	const { name = '' } = defineProps<{
		name?: string
	}>()
</script>

<template>
	<div class="loading-state">
		<div class="loading-state__card">
			<UiSpinner />

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
</style>
