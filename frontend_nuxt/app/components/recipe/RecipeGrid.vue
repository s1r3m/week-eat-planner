<script setup lang="ts">
	defineProps<{
		recipes?: IRecipeInfo[]
	}>()
</script>

<template>
	<div>
		<EmptyState
			v-if="!recipes?.length"
			name="recipes"
		/>

		<div
			v-else
			class="recipe-grid"
		>
			<RecipeCard
				v-for="recipe in recipes"
				:key="recipe.id"
				:recipe="recipe"
				:pending="recipe.__pending"
			/>
		</div>
	</div>
</template>

<style scoped>
	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
		margin: var(--space-md) 0;
	}

	@container (width > 600px) {
		.recipe-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@container (width > 920px) {
		.recipe-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
