<script setup lang="ts">
	type AlertVariant = 'error' | 'success'
	defineProps<{
		message: string
		variant: AlertVariant
	}>()

	defineEmits<{
		close: []
	}>()

	const icons = {
		error: 'megaphone',
		success: 'check',
	}

	const titles = {
		error: 'Oops',
		success: 'Great',
	}
</script>

<template>
	<div :class="['alert', `alert--${variant}`]">
		<div class="alert-header">
			<Icon :name="`lucide:${icons[variant]}`" />

			<h2 class="text-title-md">{{ titles[variant] }}</h2>
		</div>

		<p class="text-body-lg">{{ message }}</p>

		<button
			class="icon"
			type="button"
			@click.prevent="$emit('close')"
		>
			<Icon name="lucide:x" />
		</button>
	</div>
</template>

<style scoped lang="scss">
	.alert {
		display: flex;
		position: relative;
		flex-direction: column;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		gap: var(--space-md);
	}

	.alert-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.alert--error {
		background-color: var(--color-error);
		color: var(--color-on-error);
	}

	.alert--success {
		background-color: var(--color-primary/40);
		color: var(--color-on-primary);
	}

	.icon {
		position: absolute;
		top: 10%;
		border: 0;
		background: transparent;
		color: inherit;
		inset-inline-end: var(--space-lg);
	}
</style>
