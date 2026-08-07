<script setup lang="ts">
	defineProps<{
		collapsed: boolean
	}>()

	const authStore = useAuthStore()
</script>

<template>
	<div class="user-info">
		<Icon name="lucide:circle-user" />

		<p
			v-if="authStore.user?.username"
			class="user-info__name"
			:class="{ collapsed }"
		>
			{{ authStore.user.username }}
		</p>
	</div>
</template>

<style scoped>
	.user-info {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
	}

	.user-info__name {
		max-width: 100%;
		overflow: hidden;
		transition: all 0.3s ease;
		opacity: 1;
		white-space: nowrap;
	}

	.collapsed {
		max-width: 0;
		opacity: 0;
	}
</style>
