<script setup lang="ts">
	defineProps<{
		name: string
	}>()
</script>

<template>
	<div class="page-title">
		<h1 class="page-title__name">{{ name }}</h1>

		<div class="page-title__controls">
			<slot name="controls"></slot>
		</div>
	</div>
</template>

<style scoped>
	.page-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.page-title__name {
		color: var(--color-primary);
	}

	.page-title__controls {
		display: flex;
		gap: var(--space-md);
	}
</style>
