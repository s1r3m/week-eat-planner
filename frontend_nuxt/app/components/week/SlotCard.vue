<script setup lang="ts">
	defineProps<{ mealSlot: IMealSlot }>()
</script>

<template>
	<div class="slot">
		<div class="slot__bg"></div>

		<div class="slot__content">
			<h3 class="slot__type">{{ mealSlot.meal_type }}</h3>

			<div
				v-if="mealSlot.recipe"
				class="slot__portion"
			>
				<span>-</span>
				1
				<span>+</span>
			</div>

			<p>{{ mealSlot.recipe?.name }}</p>
		</div>
	</div>
</template>

<style scoped>
	.slot {
		display: grid;
		grid-template-areas: 1 / 1;
		min-height: 120px;
		padding: var(--space-md);
		transition: all 0.3s ease;
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-xl);

		&:hover {
			transform: scale(1.02);
		}
	}

	.slot__bg {
		position: relative;
		grid-area: 1 / 1;
	}

	.slot__content {
		display: flex;
		position: relative;
		grid-area: 1 / 1;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}

	.slot__type {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-full);
		background-color: var(--color-primary);
		color: var(--color-on-primary);
		font-size: var(--text-badge-md);
		text-align: center;
	}

	.empty {
		border: 1px dotted var(--color-primary);
	}
</style>
