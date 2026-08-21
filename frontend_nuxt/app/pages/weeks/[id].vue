<script setup lang="ts">
	definePageMeta({
		middleware: 'shared',
	})

	const route = useRoute()
	const authStore = useAuthStore()
	const { mutateAsync: remove } = useMutation(deleteWeekMutation())
	const {
		data: week,
		error,
		refetch,
	} = useQuery(getWeekQuery(route.params.id as string))

	const onDelete = async (weekId: string) => {
		try {
			await remove(weekId)
		} catch (error: unknown) {
			console.error('An error during delete: ', error)
			return
		}
		return await navigateTo({ name: 'my-weeks' })
	}
</script>

<template>
	<div class="page-container">
		<PageTitle
			v-if="week"
			:name="week.name"
		>
			<template
				v-if="authStore.isAuthenticated"
				#controls
			>
				<UiButton aria-label="Groceries">
					<Icon name="lucide:shopping-cart" />

					<span class="button-label">Groceries</span>
				</UiButton>

				<UiButton
					variant="danger"
					:disabled="!week"
					aria-label="Delete week"
					@click="onDelete(week?.id as string)"
				>
					<Icon name="lucide:trash" />

					<span class="button-label">Delete week</span>
				</UiButton>
			</template>
		</PageTitle>

		<PageErrorState
			v-else-if="error"
			name="weeks"
			:error="error"
			@repeat="refetch"
		/>

		<PageLoadingState
			v-else
			name="weeks"
		/>

		<WeekSlotGrid
			v-if="week"
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
