<script setup lang="ts">
	const authStore = useAuthStore()
	const email = ref<string>('')
	const password = ref<string>('')
	const onSubmit = async () => {
		await authStore.signup({
			email: email.value,
			password: password.value,
			username: email.value.split('@', 1)[0]!,
		})
		navigateTo({ name: 'my-weeks' })
	}
</script>

<template>
	<div class="page-container">
		<div class="card">
			<div class="card-header">
				<h1 class="text-headline-md">Register</h1>
			</div>

			<form class="login-form">
				<div class="form-group">
					<label for="email">Email:</label>

					<UiInput
						id="email"
						v-model="email"
						placeholder="Enter email"
					/>

					<small v-if="false">Email is required</small>
				</div>

				<div class="form-group">
					<label for="password">Password:</label>

					<UiInput
						id="password"
						v-model="password"
						type="password"
						placeholder="Enter password"
					/>

					<small v-if="false"></small>
				</div>

				<UiButton
					type="submit"
					@click.prevent="onSubmit"
				>
					Register
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
		margin-bottom: var(--space-xl);

		label {
			display: block;
			margin-bottom: var(--space-sm);
			font-weight: var(--font-weight-semibold);
		}

		small {
			position: absolute;
			bottom: calc(var(--space-sm) * -1);
		}
	}

	button {
		width: 100%;
	}
</style>
