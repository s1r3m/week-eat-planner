<script setup lang="ts">
	const {
		autocomplete = 'off',
		id,
		name = '',
		placeholder = '',
		type = 'text',
	} = defineProps<{
		autocomplete?: string
		id: string
		name?: string
		placeholder?: string
		type?: 'password' | 'text'
	}>()
	const model = defineModel<string>({ default: '' })

	const revealed = ref<boolean>(false)
	const inputType = computed(() =>
		type === 'password' && revealed.value ? 'text' : type,
	)
</script>

<template>
	<div class="container">
		<input
			:id="id"
			v-model="model"
			:type="inputType"
			:name="name"
			:autocomplete="autocomplete"
			:placeholder="placeholder"
		/>

		<UiButton
			v-if="type === 'password'"
			variant="icon"
			aria-label="Toggle password visibility"
			:aria-pressed="revealed"
			@click="revealed = !revealed"
		>
			<Icon
				v-if="revealed"
				name="lucide:eye"
			/>

			<Icon
				v-else
				name="lucide:eye-closed"
			/>
		</UiButton>
	</div>
</template>

<style scoped>
	.container {
		position: relative;
	}

	input {
		display: block;
		width: 100%;
		padding: var(--space-sm);
		padding-inline-end: calc(var(--space-lg) * 3);
		transition: border-color 0.3s;
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-sm);
	}

	input:focus {
		border-color: var(--color-primary);
		outline: none;
	}

	button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		border: 0;
		background: transparent;
		inset-inline-end: var(--space-md);
	}
</style>
