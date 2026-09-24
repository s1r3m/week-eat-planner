<script setup lang="ts">
	type BadgeVariant = 'default' | 'outline' | 'recipe-name'

	const { variant = 'default' } = defineProps<{
		variant?: BadgeVariant
	}>()
</script>

<template>
	<p :class="['badge', `badge--${variant}`]">
		<slot></slot>
	</p>
</template>

<style scoped>
	.badge {
		display: flex;
		align-items: center;
		padding: var(--spacing) var(--space-xs);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-small);
	}

	.badge--default {
		background-color: var(--color-primary);
		color: var(--color-on-primary);
	}

	.badge--outline {
		border: 1px dotted var(--color-primary);
		background-color: var(--color-surface);
		color: var(--color-primary);
		font-size: var(--font-size-label);
	}

	.badge--recipe-name {
		border: none;
		background-color: var(--color-surface);
		font-size: var(--font-size-label);
	}
</style>
