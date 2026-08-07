<script setup lang="ts">
	import { addWeekMutation } from '~/api/weeks/mutations'

	definePageMeta({
		layout: 'app',
	})

	const {
		data: weeks,
		error,
		isLoading: isLoadingWeeks,
		refresh,
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
					@click="create({ name: 'new week' })"
				>
					<Icon name="lucide:plus" />
					Create week
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
			@repeat="refresh"
		/>

		<WeekGrid
			v-else
			:weeks="weeks ?? []"
		/>
	</div>
</template>
