<script setup lang="ts">
	defineProps<{
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
			<h1 class="text-headline-md">{{ header }}</h1>
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

<style scoped lang="scss">
	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 400px;
		margin: var(--space-2xl) auto;
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		background-color: var(--color-surface-variant);
		box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
		row-gap: var(--space-lg);
	}

	.card-header {
		margin: 0 auto;
		row-gap: var(--space-md);

		h1 {
			margin-bottom: var(--space-md);
			color: var(--color-primary);
			text-align: center;
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
		font-weight: var(--font-weight-semibold);
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
