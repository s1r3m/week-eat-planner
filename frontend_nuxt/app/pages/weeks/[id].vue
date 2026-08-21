<script setup lang="ts">
	definePageMeta({
		middleware: 'shared',
	})

	const route = useRoute()
	const authStore = useAuthStore()
	const { mutate: remove } = useMutation(deleteWeekMutation())
	const {
		data: week,
		error,
		refetch,
	} = useQuery(getWeekQuery(route.params.id as string))

	const onDelete = async (weekId: string) => {
		remove(weekId)
		return await navigateTo({ name: 'my-weeks' })
	}
</script>

<template>
	<div
		v-if="week"
		class="page-container"
	>
		<PageTitle :name="week?.name">
			<template
				v-if="authStore.isAuthenticated"
				#controls
			>
				<UiButton>
					<Icon name="lucide:shopping-cart" />

					<span class="button-label">Groceries</span>
				</UiButton>

				<UiButton
					variant="danger"
					:disabled="!week"
					@click="onDelete(week?.id as string)"
				>
					<Icon name="lucide:trash" />

					<span class="button-label">Delete week</span>
				</UiButton>
			</template>
		</PageTitle>

		<PageLoadingState
			v-if="!week"
			name="weeks"
		/>

		<PageErrorState
			v-else-if="error"
			name="weeks"
			:error="error"
			@repeat="refetch"
		/>

		<WeekSlotGrid
			v-else
			:week="week"
		/>
	</div>
</template>

<style scoped>
	.button-label {
		display: none;
	}

	@media (width > 768px) {
		.button-label {
			display: inline;
		}
	}
</style>
