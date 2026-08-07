<script setup lang="ts">
	defineProps<{
		error: Error
		name: string
	}>()

	defineEmits<{
		repeat: []
	}>()
</script>

<template>
	<div class="error-state">
		<div class="error-state__card">
			<h2 class="error-state__title">Failed to load {{ name }}</h2>

			<p class="error-state__description">{{ error.message }}</p>

			<UiButton @click="$emit('repeat')">Try again</UiButton>
		</div>
	</div>
</template>

<style scoped>
	.error-state {
		max-width: 480px;
		margin: var(--space-md) auto;
	}

	.error-state__card {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: center;
		padding: var(--space-md);
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
	}

	.error-state__title {
		color: var(--color-error);
	}
</style>
