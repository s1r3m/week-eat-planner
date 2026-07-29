<script setup lang="ts">
	const { logout, user } = useAuthStore()

	const onLogout = () => {
		logout()
		navigateTo({ name: 'index' })
	}
</script>

<template>
	<div class="page-container">
		<h1>My Weeks</h1>

		<p>{{ user }}</p>

		<UiButton @click="onLogout">Logout</UiButton>
	</div>
</template>
