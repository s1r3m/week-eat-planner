<script setup lang="ts">
	defineProps<{ mealSlot: IMealSlot }>()
</script>

<template>
	<div class="slot">
		<div v-if="mealSlot.recipe">
			<div class="slot__bg"></div>

			<h3 class="slot__type">{{ mealSlot.meal_type }}</h3>
		</div>

		<div
			v-else
			class="empty"
		></div>
	</div>
</template>

<style scoped>
	.slot {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		border: 1px dotted var(--color-outline);
		border-radius: var(--radius-md);
	}
</style>
