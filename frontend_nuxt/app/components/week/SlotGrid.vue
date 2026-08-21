<script setup lang="ts">
	defineProps<{ week: IWeek }>()

	const mealTypeOrder: Record<MealType, number> = {
		BREAKFAST: 0,
		LUNCH: 1,
		DINNER: 3,
		SNACK: 2,
	}
	const sortSlots = (slots: IMealSlot[]) => {
		return [...slots].sort(
			(a, b) => mealTypeOrder[a.meal_type] - mealTypeOrder[b.meal_type],
		)
	}
</script>

<template>
	<div class="meal-slot-grid">
		<div
			v-for="day in week.week_days"
			:key="day.name"
			class="meal-slot-grid__day"
		>
			<p class="meal-slot-grid__day-title">{{ day.name }}</p>

			<div class="meal-slot-grid__day-block">
				<WeekSlotCard
					v-for="slot in sortSlots(day.slots)"
					:key="slot.id"
					:meal-slot="slot"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.meal-slot-grid {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-lg);
		gap: var(--space-lg);
	}

	.meal-slot-grid__day {
		display: flex;
		flex-direction: column;
		padding: var(--space-md);
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-lg);
		background-color: var(--color-surface-variant);
		gap: var(--space-lg);
	}

	.meal-slot-grid__day-title {
		text-align: left;
	}

	.meal-slot-grid__day-block {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: var(--space-md);
	}

	@container (width > 600px) {
		.meal-slot-grid__day-block {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@container (width > 920px) {
		.meal-slot-grid__day-block {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
