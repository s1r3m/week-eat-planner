<script setup lang="ts">
	const {
		email,
		errors,
		isLoading,
		meta,
		password,
		register,
		serverError,
		username,
	} = useSignupForm()

	const onSubmit = async () => {
		await register()
		navigateTo({ name: 'my-weeks' })
	}
</script>

<template>
	<div class="page-container">
		<AuthForm
			id="singup-form"
			header="Register"
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
					autocomplete="username"
					placeholder="Enter email"
				/>

				<small v-if="errors.email">{{ errors.email }}</small>
			</div>

			<div class="form-group">
				<label for="name">Name:</label>

				<UiInput
					id="name"
					v-model="username"
					name="name"
					placeholder="Enter username"
				/>

				<small v-if="errors.username">{{ errors.username }}</small>
			</div>

			<div class="form-group">
				<label for="password">Password:</label>

				<UiInput
					id="password"
					v-model="password"
					type="password"
					name="password"
					autocomplete="new-password"
					placeholder="Enter password"
				/>

				<small v-if="errors.password">{{ errors.password }}</small>
			</div>

			<UiButton
				class="submit"
				type="submit"
				:disabled="isLoading || !meta.valid"
			>
				{{ isLoading ? 'Creating a profile...' : 'Register' }}
			</UiButton>
		</AuthForm>
	</div>
</template>
