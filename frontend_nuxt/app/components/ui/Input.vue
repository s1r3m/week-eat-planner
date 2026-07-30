<script setup lang="ts">
	const {
		id,
		placeholder = '',
		type = 'text',
	} = defineProps<{
		id: string
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
			:placeholder="placeholder"
		/>

		<button
			v-if="type === 'password'"
			aria-label="Toggle password visibility"
			:aria-pressed="revealed"
			type="button"
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
		</button>
	</div>
</template>

<style scoped lang="scss">
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
		inset-inline-end: var(--space-lg);
	}
</style>
