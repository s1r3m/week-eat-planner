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
		<AuthForm
			id="login-form"
			header="Welcome back"
			@submit="onSubmit"
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
					name="email"
					placeholder="Enter email"
				/>

				<small v-if="errors.email">{{ errors.email }}</small>
			</div>

			<div class="form-group">
				<label for="password">Password:</label>

				<UiInput
					id="password"
					v-model="password"
					name="password"
					type="password"
					placeholder="Enter password"
				/>

				<small v-if="errors.password">{{ errors.password }}</small>
			</div>

			<UiButton
				class="submit"
				type="submit"
				:disabled="!meta.valid || isLoading"
			>
				{{ isLoading ? 'Logging in... ' : 'Login' }}
			</UiButton>
		</AuthForm>
	</div>
</template>
