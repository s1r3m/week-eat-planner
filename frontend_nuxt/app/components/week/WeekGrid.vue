<script setup lang="ts">
	defineProps<{
		weeks: IWeekPreview[]
	}>()
</script>

<template>
	<EmptyState
		v-if="!weeks.length"
		name="weeks"
	/>

	<div
		v-else
		class="week-grid"
	>
		<WeekCard
			v-for="week in weeks"
			:key="week.id"
			:week="week"
			:pending="week.__pending"
		/>
	</div>
</template>

<style scoped>
	.week-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: var(--space-lg);
		margin: var(--space-md) 0;
	}

	@container (width > 600px) {
		.week-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@container (width > 920px) {
		.week-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
