<script setup lang="ts">
	import BaseButton from '@/common/ui/BaseButton.vue'
	import { logoutMutation } from '@/modules/auth/api/authApi'
	import { useGlobalToast } from '~/common/composables/useGlobalToast'
	import { useAuth } from '~/modules/auth/composables/useAuth'

	const emits = defineEmits<{
		navigate: []
	}>()

	const { mutateAsync: logout, isLoading } = logoutMutation()
	const { authState } = useAuth()
	const { show } = useGlobalToast()

	const route = useRoute()

	const showLogin = computed(
		() => authState.value !== 'authenticated' && route.name !== 'login',
	)
	const showSignup = computed(
		() => authState.value !== 'authenticated' && route.name !== 'signup',
	)
	const showLogout = computed(() => authState.value === 'authenticated')

	const navigate = async (name: string) => {
		await navigateTo({ name })
		emits('navigate')
	}

	const onLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Error during logout:', error)
			show('Error during logout')
		} finally {
			await navigate('index')
		}
	}
</script>

<template>
	<div class="header-controls">
		<BaseButton
			v-if="showLogin"
			variant="secondary"
			@click="navigate('login')"
		>
			Login
		</BaseButton>

		<BaseButton
			v-if="showSignup"
			@click="navigate('signup')"
		>
			Register
		</BaseButton>

		<BaseButton
			v-if="showLogout"
			variant="danger"
			:disabled="isLoading"
			@click="onLogout"
		>
			{{ isLoading ? 'Logging out...' : 'Logout' }}
		</BaseButton>
	</div>
</template>

<style scoped>
	.header-controls {
		display: flex;
		align-items: center;
		padding: var(--space-4);
		gap: var(--space-4);
	}

	.header-controls > * {
		width: 100%;
	}
</style>
