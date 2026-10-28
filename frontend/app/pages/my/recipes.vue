<script setup lang="ts">
	import BaseButton from '@/common/ui/BaseButton.vue'
	import PageTitle from '@/common/ui/PageTitle.vue'

	definePageMeta({
		auth: 'required',
	})
</script>

<template>
	<div class="page-container">
		<PageTitle name="My Recipes">
			<template #controls>
				<NuxtLink :to="{ name: 'recipes-create' }">
					<BaseButton aria-label="Create recipe">
						<Icon
							name="lucide:plus"
							:size="24"
						/>

						<span class="page-title__button-label">Create recipe</span>
					</BaseButton>
				</NuxtLink>
			</template>
		</PageTitle>
	</div>
</template>

<style scoped>
	@media (--mobile) {
		.page-title__button-label {
			display: none;
		}
	}
</style>
