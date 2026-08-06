<script setup lang="ts">
	definePageMeta({
		layout: 'app',
	})

	const { getWeeks } = useWeeksApi()

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
</script>

<template>
	<div class="page-container">
		<PageTitle />

		<PageLoadingState
			v-if="pending"
			name="weeks"
		/>

		<PageErrorState
			v-else-if="error"
			name="weeks"
			:error="error"
			@repeat="refresh"
		/>

		<PageEmptyState
			v-else-if="!weeks?.length"
			name="weeks"
		/>

		<WeeksGrid
			v-else
			:weeks="weeks"
		/>
	</div>
</template>
