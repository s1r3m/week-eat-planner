<script setup lang="ts">
	definePageMeta({
		middleware: 'auth',
		layout: 'app',
	})

	const {
		data: weeks,
		error,
		isLoading: isLoadingWeeks,
		refetch,
	} = useQuery(getWeeksQuery())
	const { mutate: create, isLoading: isCreating } =
		useMutation(addWeekMutation())
</script>

<template>
	<div class="page-container">
		<PageTitle name="My Weeks">
			<template #controls>
				<UiButton
					:disabled="isCreating"
					aria-label="Create week"
					@click="create({ name: 'new week' })"
				>
					<Icon name="lucide:plus" />

					<span class="page-title__button-label">Create week</span>
				</UiButton>
			</template>
		</PageTitle>

		<PageLoadingState
			v-if="!weeks?.length && isLoadingWeeks"
			name="weeks"
		/>

		<PageErrorState
			v-else-if="error"
			name="weeks"
			:error="error"
			@repeat="refetch"
		/>

		<WeekGrid
			v-else
			:weeks="weeks ?? []"
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
