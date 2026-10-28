<script setup lang="ts">
	import AuthCard from '@/modules/auth/ui/AuthCard.vue'
	import AuthSignupForm from '@/modules/auth/ui/AuthSignupForm.vue'

	definePageMeta({
		auth: 'guest',
	})

	const onSuccess = async () => {
		await navigateTo({ name: 'login' })
	}
</script>

<template>
	<div class="page-container">
		<AuthCard
			header="Join us"
			description="Register your account"
		>
			<AuthSignupForm @success="onSuccess" />
		</AuthCard>
	</div>
</template>

<style scoped>
	.page-container {
		display: flex;
		justify-content: center;
		margin-top: var(--space-4);
	}
</style>
