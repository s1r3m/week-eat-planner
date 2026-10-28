<script setup lang="ts">
	import { AlertDialogCancel } from 'reka-ui'

	import type { IRecipeForm } from '@/modules/recipes/types'

	import BaseAlertDialog from '@/common/ui/BaseAlertDialog.vue'
	import BaseButton from '@/common/ui/BaseButton.vue'
	import BaseInput from '@/common/ui/BaseInput.vue'
	import PageTitle from '@/common/ui/PageTitle.vue'
	import { createEmptyForm } from '@/modules/recipes/utils'

	definePageMeta({
		auth: 'required',
	})

	const form = ref<IRecipeForm>(createEmptyForm())
	const isConfirmOpen = ref<boolean>(false)

	const onConfirm = () => {
		form.value = createEmptyForm()
		isConfirmOpen.value = false
	}
</script>

<template>
	<div class="page-container">
		<PageTitle name="Create a recipe" />

		<div class="recipe-form__wrapper">
			<form
				class="recipe-form"
				novalidate
			>
				<div class="recipe-form__name_wrapper">
					<BaseInput
						v-model="form.name"
						class="recipe-form__name"
						label="Recipe name"
					/>

					<BaseInput
						v-model="form.portions"
						label="Portions"
						type="number"
						:min="1"
					/>
				</div>
			</form>

			<div class="recipe-form__controls">
				<BaseButton
					variant="secondary"
					@click="isConfirmOpen = true"
				>
					Clear
				</BaseButton>

				<BaseButton type="submit">Create</BaseButton>
			</div>
		</div>

		<BaseAlertDialog
			v-model="isConfirmOpen"
			title="Clear form"
			:description="`Are you sure you want to clear the form?`"
			title-hidden
		>
			<AlertDialogCancel as-child>
				<BaseButton variant="secondary">No</BaseButton>
			</AlertDialogCancel>

			<BaseButton @click="onConfirm">Yes</BaseButton>
		</BaseAlertDialog>
	</div>
</template>

<style scoped>
	.recipe-form__wrapper {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-4);
		gap: var(--space-4);
	}

	.recipe-form__name_wrapper {
		display: flex;
		gap: var(--space-2);
	}

	.recipe-form__name {
		flex: 1;
	}

	.recipe-form__controls {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	@media (--mobile) {
		.recipe-form__name_wrapper {
			flex-direction: column;
		}
	}
</style>
