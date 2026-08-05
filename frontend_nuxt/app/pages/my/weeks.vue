<script setup lang="ts">
	import type { IWeekPreview } from '@/api/weeks'

	import { useWeeksApi } from '@/api/weeks'

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
		<h1>My Weeks</h1>

		<div
			v-if="pending"
			class="error-state"
		>
			Loading...
		</div>

		<div
			v-else-if="error"
			class="error-state"
		>
			<h2 class="error-state__title">Failed to load weeks</h2>

			<p class="error-state__description">{{ error.message }}</p>

			<UiButton @click="refresh">Try again</UiButton>
		</div>

		<div
			v-else-if="!weeks?.length"
			class="empty-state"
		>
			<h2 class="empty-state__title">No weeks yet</h2>

			<p class="empty-state__description">Try create one.</p>
		</div>

		<div
			v-else
			class="weeks-grid"
		>
			<div
				v-for="week in weeks"
				:key="week.id"
				class="weeks-grid__card"
			>
				<div class="weeks_grid__card-bg"></div>

				<h2 class="weeks-grid__card-name">{{ week.name }}</h2>
			</div>
		</div>
	</div>
</template>
