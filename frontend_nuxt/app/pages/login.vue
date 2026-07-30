<script setup lang="ts">
	const { email, errors, isLoading, login, meta, password, serverError } =
		useLoginForm()

	const onSubmit = async () => {
		await login()
		await navigateTo({ name: 'my-weeks' })
	}
</script>

<template>
	<div class="page-container">
		<div class="card">
			<div class="card-header">
				<h1 class="text-headline-md">Welcome back</h1>
			</div>

			<form
				class="login-form"
				novalidate
				@submit.prevent="onSubmit"
			>
				<UiAlert
					v-if="serverError"
					:message="serverError"
					variant="error"
					@close="serverError = null"
				/>

				<div class="form-group">
					<label for="email">Email:</label>

					<UiInput
						id="email"
						v-model="email"
						placeholder="Enter email"
					/>

					<small v-if="errors.email">{{ errors.email }}</small>
				</div>

				<div class="form-group">
					<label for="password">Password:</label>

					<UiInput
						id="password"
						v-model="password"
						type="password"
						placeholder="Enter password"
					/>

					<small v-if="errors.password">{{ errors.password }}</small>
				</div>

				<UiButton
					type="submit"
					:disabled="!meta.valid || isLoading"
				>
					{{ isLoading ? 'Logging in... ' : 'Login' }}
				</UiButton>
			</form>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 400px;
		margin: var(--space-2xl) auto;
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		background-color: var(--color-surface-variant);
		box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
		row-gap: var(--space-lg);
	}

	.card-header {
		margin: 0 auto;
		row-gap: var(--space-md);

		h1 {
			margin-bottom: var(--space-md);
			color: var(--color-primary);
			text-align: center;
		}
	}

	.form-group {
		position: relative;
		margin-top: var(--space-2xl);
		margin-bottom: var(--space-2xl);

		label {
			display: block;
			margin-bottom: var(--space-sm);
			font-weight: var(--font-weight-semibold);
		}

		small {
			position: absolute;
			padding-left: var(--space-sm);
			color: var(--color-error);
		}
	}

	button {
		width: 100%;
	}
</style>
