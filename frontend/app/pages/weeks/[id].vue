<script setup lang="ts">
	import BaseButton from '@/common/ui/BaseButton.vue'
	import PageErrorState from '@/common/ui/PageErrorState.vue'
	import PageLoadingState from '@/common/ui/PageLoadingState.vue'
	import PageTitle from '@/common/ui/PageTitle.vue'
	import { getUser } from '@/modules/auth/api/authApi'
	import { getWeekQuery } from '@/modules/weeks/api/weeksApi'
	import { useWeekDeleteDialog } from '@/modules/weeks/composables/useWeekDeleteDialog'
	import SlotGrid from '@/modules/weeks/ui/SlotGrid.vue'
	import WeekDeleteDialog from '@/modules/weeks/ui/WeekDeleteDialog.vue'

	definePageMeta({
		middleware: 'layout',
	})

	const route = useRoute()
	const {
		data: week,
		error,
		refetch,
	} = useQuery(getWeekQuery(route.params.id as string))

	const { data: user } = getUser()

	const { open } = useWeekDeleteDialog()
</script>

<template>
	<div class="page-container">
		<PageTitle
			v-if="week"
			:name="week.name"
		>
			<template
				v-if="user"
				#controls
			>
				<BaseButton aria-label="Groceries">
					<Icon
						name="lucide:shopping-cart"
						:size="24"
					/>

					<span class="page-title__button-label">Groceries</span>
				</BaseButton>

				<BaseButton
					variant="danger"
					aria-label="Delete week"
					@click="open(week)"
				>
					<Icon
						name="lucide:trash"
						:size="24"
					/>

					<span class="page-title__button-label">Delete week</span>
				</BaseButton>
			</template>
		</PageTitle>

		<PageErrorState
			v-else-if="error"
			name="weeks"
			:error="error"
			@retry="refetch"
		/>

		<PageLoadingState
			v-else
			name="weeks"
		/>

		<SlotGrid
			v-if="week"
			:week="week"
		/>

		<WeekDeleteDialog />
	</div>
</template>

<style scoped>
	@media (--mobile) {
		.page-title__button-label {
			display: none;
		}
	}
</style>
