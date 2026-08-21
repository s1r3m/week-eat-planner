<script setup lang="ts">
	defineProps<{
		description: string
		header: string
		id: string
	}>()

	defineEmits<{
		submit: []
	}>()
</script>

<template>
	<div class="card">
		<div class="card-header">
			<h1 class="card-header__title">{{ header }}</h1>

			<p class="card-header__description">{{ description }}</p>
		</div>

		<form
			:id="id"
			novalidate
			@submit.prevent="$emit('submit')"
		>
			<slot></slot>
		</form>
	</div>
</template>

<style scoped>
	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		margin: var(--space-2xl) auto;
		padding: var(--space-lg);
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-lg);
		background-color: var(--color-surface-variant);
		row-gap: var(--space-lg);
	}

	.card-header {
		margin: 0 auto;
		row-gap: var(--space-md);

		.card-header__title {
			color: var(--color-primary);
			font-size: var(--font-size-title);
			text-align: center;
		}

		.card-header__description {
			color: var(--color-on-surface-variant);
		}
	}

	:deep(.form-group) {
		position: relative;
		margin-top: var(--space-2xl);
		margin-bottom: var(--space-2xl);
	}

	:deep(.form-group label) {
		display: block;
		margin-bottom: var(--space-sm);
		font-weight: var(--font-weight-medium);
	}

	:deep(.form-group small) {
		position: absolute;
		padding-left: var(--space-sm);
		color: var(--color-error);
	}

	:deep(.submit) {
		width: 100%;
		margin-bottom: var(--space-md);
	}
</style>
