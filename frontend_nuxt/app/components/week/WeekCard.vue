<script setup lang="ts">
	defineProps<{
		pending?: boolean
		week: IWeekPreview
	}>()
</script>

<template>
	<NuxtLink
		:to="{ name: 'weeks-id', params: { id: week.id } }"
		:aria-disabled="week.__pending || undefined"
	>
		<div class="weeks-grid__card">
			<div class="weeks-grid__card-content">
				<div class="weeks_grid__card-bg"></div>

				<h2 class="weeks-grid__card-name">{{ week.name }}</h2>
			</div>

			<div
				v-if="week.__pending"
				class="weeks-grid__card-blocker"
				aria-hidden="true"
			>
				<span class="spinner"></span>
			</div>
		</div>
	</NuxtLink>
</template>

<style scoped>
	.weeks-grid__card {
		display: grid;
		isolation: isolate;
	}

	.weeks-grid__card-content,
	.weeks-grid__card-blocker {
		grid-area: 1 / 1;
	}

	.weeks-grid__card-content {
		display: grid;
		width: 100%;
		height: 240px;
		overflow: hidden;
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
		cursor: pointer;
		isolation: isolate;
	}

	.weeks-grid__card-blocker {
		display: flex;
		z-index: 1;
		align-items: center;
		justify-content: center;
		background: rgb(0 0 0 / 45%);
		cursor: not-allowed;
	}

	.weeks_grid__card-bg {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		background: color-mix(in oklab, var(--color-primary) 30%, white);
	}

	.weeks-grid__card-name {
		position: relative;
		grid-area: 1 / 1;
		align-self: end;
		margin: 0;
		padding: var(--space-md);
		background: rgb(255 255 255 / 45%);
		color: var(--color-text);
		text-align: center;
	}

	.spinner {
		display: inline-block;
		width: 48px;
		height: 48px;
		animation: spin 0.7s linear infinite;
		border: 6px solid var(--color-primary);
		border-radius: 50%;
		border-right-color: transparent;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
