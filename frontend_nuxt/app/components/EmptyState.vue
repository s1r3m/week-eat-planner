<script setup lang="ts">
	defineProps<{
		name: string
	}>()
</script>

<template>
	<div class="empty-state">
		<div class="empty-state__card">
			<h2 class="empty-state__title">No {{ name }} yet</h2>

			<p class="empty-state__description">Try to create one.</p>
		</div>
	</div>
</template>

<style scoped>
	.empty-state {
		max-width: 480px;
		margin: var(--space-md) auto;
	}

	.empty-state__card {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: center;
		padding: var(--space-md);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
	}
</style>
