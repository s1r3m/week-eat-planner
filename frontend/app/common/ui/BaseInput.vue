<script setup lang="ts">
	type InputType = 'number' | 'password' | 'text'

	const props = withDefaults(
		defineProps<{
			autocomplete?: string
			error?: string
			id?: string
			label: string
			min?: number
			placeholder?: string
			type?: InputType
		}>(),
		{ autocomplete: 'off', placeholder: '', type: 'text' },
	)

	const model = defineModel<number | string>({ default: '' })
	const id = props.id ?? useId()
</script>

<template>
	<div class="base-input">
		<label
			class="base-input__label"
			:for="id"
		>
			{{ label }}
		</label>

		<div class="base-input__wrapper">
			<slot name="icon-left"></slot>

			<input
				:id="id"
				v-model="model"
				class="base-input__input"
				:type="type"
				:autocomplete="autocomplete"
				:placeholder="placeholder"
				:min="min"
			/>

			<slot name="icon-right"></slot>
		</div>

		<small
			v-if="error"
			class="base-input__error"
		>
			{{ error }}
		</small>
	</div>
</template>

<style scoped>
	.base-input {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.base-input__label {
		color: var(--text-muted);
		font-size: var(--text-14);
	}

	.base-input__wrapper {
		display: flex;
		align-items: center;
		height: 48px;
		padding: var(--space-2);
		transition: border-color var(--duration-fast);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background-color: var(--bg-elevated);

		&:focus-within {
			border-color: var(--brand-primary);
			outline: none;
		}
	}

	.base-input__input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
	}

	.base-input--disabled {
		@mixin control-disabled;
	}

	.base-input__error {
		color: var(--danger);
	}

	.base-input__wrapper:has(+ .base-input__error) {
		border-color: var(--danger);
	}
</style>
