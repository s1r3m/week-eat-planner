<script setup lang="ts">
	definePageMeta({
		middleware: 'auth',
		layout: 'app',
	})

	const {
		data: recipes,
		isLoading: isLoadingRecipes,
		error,
		refetch,
	} = useQuery(getMyRecipesQuery())
</script>

<template>
	<div class="page-container">
		<PageTitle name="My Recipes">
			<template #controls>
				<UiButton aria-label="Create recipe">
					<Icon name="lucide:plus" />

					<span class="page-title__button-label">Create recipe</span>
				</UiButton>
			</template>
		</PageTitle>

		<PageLoadingState
			v-if="!recipes && isLoadingRecipes"
			name="recipes"
		/>

		<PageErrorState
			v-else-if="error"
			name="recipes"
			:error="error"
			@repeat="refetch"
		/>

		<RecipeGrid
			v-else
			:recipes="recipes"
		/>
	</div>
</template>

<style scoped>
	.page-title__button-label {
		display: none;
	}

	@media (width > 768px) {
		.page-title__button-label {
			display: inline;
		}
	}
</style>
