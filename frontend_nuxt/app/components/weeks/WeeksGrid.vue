<script setup lang="ts">
	defineProps<{
		weeks: IWeekPreview[]
	}>()

	const { deleteWeek } = useWeeksApi()

	const onDelete = async (weekId: string) => {
		await deleteWeek(weekId)
	}
</script>

<template>
	<div class="weeks-grid">
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
</template>

<style scoped>
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
		cursor: pointer;
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
