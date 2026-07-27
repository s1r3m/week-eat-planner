<script setup lang="ts">
	type ButtonType = 'button' | 'submit'
	type ButtonVariant = 'outline' | 'primary' | 'secondary'

	const {
		disabled = false,
		type = 'button',
		variant = 'primary',
	} = defineProps<{
		disabled?: boolean
		type?: ButtonType
		variant?: ButtonVariant
	}>()

	defineEmits<{
		click: []
	}>()
</script>

<template>
	<button
		:class="['btn', `btn--${variant}`]"
		:disabled="disabled"
		:type="type"
		@click="$emit('click')"
	>
		<slot></slot>
	</button>
</template>

<style scoped lang="scss">
	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		column-gap: var(--space-md);
		padding: var(--space-xs) var(--space-lg);
		border-radius: var(--radius-xl);
		font-size: var(--text-body-lg);
		font-weight: var(--font-weight-regular);
		letter-spacing: var(--tracking-normal);
		transition: all 0.3s ease;
	}

	.btn--primary {
		background-color: var(--color-primary);
		color: var(--color-on-primary);
		border: none;
	}

	.btn--secondary {
		background-color: var(--color-secondary);
	}

	.btn--outline {
		background-color: var(--color-surface);
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
	}

	.btn--outline:not(:disabled):hover {
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		filter: grayscale(0.8);
		background-color: var(--color-outline);
		color: var(--color-secondary);
		border-color: var(--color-outline);
	}

	.btn:not(:disabled):hover {
		transform: scale(1.02);
	}

	.btn:not(:disabled):active {
		transform: scale(0.98);
	}
</style>
