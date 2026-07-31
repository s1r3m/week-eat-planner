<script setup lang="ts">
	const { collapsed = false } = defineProps<{
		collapsed?: boolean
	}>()
</script>

<template>
	<NuxtLink
		:to="{ name: 'index' }"
		class="app-logo-container"
	>
		<img
			class="logo"
			src="@/assets/logo.png"
			alt=""
			aria-hidden="true"
		/>

		<h1
			class="text-title-lg"
			:class="{ collapsed }"
		>
			Week Eat Planner
		</h1>
	</NuxtLink>
</template>

<style scoped lang="scss">
	.app-logo-container {
		display: flex;
		align-items: center;
		column-gap: var(--space-xs);
		text-decoration: none;
	}

	.logo {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		object-fit: contain;
	}

	h1 {
		color: var(--color-primary);
		overflow: hidden;
		white-space: nowrap;
		opacity: 1;
		max-width: 100%;
		transition: all 0.3s ease;
	}

	.collapsed {
		opacity: 0;
		max-width: 0;
	}
</style>
