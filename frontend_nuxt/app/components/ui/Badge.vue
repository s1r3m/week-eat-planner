<script setup lang="ts">
	type BadgeVariant = 'default' | 'outline'

	const { variant = 'default' } = defineProps<{
		variant?: BadgeVariant
	}>()
</script>

<template>
	<p :class="['badge', `badge--${variant}`, 'text-label-sm']">
		<slot></slot>
	</p>
</template>

<style scoped lang="scss">
	.badge {
		display: inline-flex;
		align-items: center;
		padding: var(--spacing) var(--space-xs);
		border-radius: var(--radius-lg);
	}

	.badge--default {
		background-color: var(--color-primary);
		color: var(--color-on-primary);
	}

	.badge--outline {
		border: 1px dotted var(--color-primary);
		background-color: var(--color-surface);
		color: var(--color-primary);
	}
</style>
