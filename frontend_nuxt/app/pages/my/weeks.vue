<script setup lang="ts">
	import type { IWeekPreview } from '@/api/weeks'

	import { useWeeksApi } from '@/api/weeks'

	definePageMeta({
		layout: 'app',
	})

	const { createWeek, deleteWeek, getWeeks } = useWeeksApi()

	const {
		data: weeks,
		error,
		pending,
		refresh,
	} = useAsyncData('weeks', () => {
		return new Promise<IWeekPreview[]>((resolve) => {
			setTimeout(() => {
				resolve(getWeeks())
			}, 1000)
		})
	})

	const onCreate = async () => {
		await createWeek({ name: 'new week' })
		await refresh()
	}

	const onDelete = async (weekId: string) => {
		await deleteWeek(weekId)
		await refresh()
	}
</script>

<template>
	<div class="page-container">
		<div class="page-title">
			<h1 class="page-title__name">My Weeks</h1>

			<div class="page-title__controls">
				<UiButton @click="onCreate">
					<Icon name="lucide:plus" />
					Create week
				</UiButton>
			</div>
		</div>

		<div
			v-if="pending"
			class="loading-state"
		>
			<div class="loading-state__card">
				<h2 class="loading-state__title">Loading weeks...</h2>
			</div>
		</div>

		<div
			v-else-if="error"
			class="error-state"
		>
			<div class="error-state__card">
				<h2 class="error-state__title">Failed to load weeks</h2>

				<p class="error-state__description">{{ error.message }}</p>

				<UiButton @click="refresh">Try again</UiButton>
			</div>
		</div>

		<div
			v-else-if="!weeks?.length"
			class="empty-state"
		>
			<div class="empty-state__card">
				<h2 class="empty-state__title">No weeks yet</h2>

				<p class="empty-state__description">Try to create one.</p>
			</div>
		</div>

		<div
			v-else
			class="weeks-grid"
		>
			<div
				v-for="week in weeks"
				:key="week.id"
				class="weeks-grid__card"
				@click="onDelete(week.id)"
			>
				<div class="weeks_grid__card-bg"></div>

				<h2 class="weeks-grid__card-name">{{ week.name }}</h2>
			</div>
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

	.loading-state {
		max-width: 480px;
		margin: var(--space-md) auto;
	}

	.loading-state__card {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: center;
		padding: var(--space-md);
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
	}

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
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
	}

	.weeks-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: var(--space-lg);
	}

	.weeks-grid__card {
		width: 100%;
		height: 240px;
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
	}

	@container (width > 600px) {
		.weeks-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@container (width > 920px) {
		.weeks-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
