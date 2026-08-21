<script setup lang="ts">
	const { collapsed = false } = defineProps<{
		collapsed?: boolean
	}>()
</script>

<template>
	<NuxtLink
		:to="{ name: 'index' }"
		class="app_logo"
	>
		<img
			class="app_logo__icon"
			src="@/assets/logo.png"
			alt=""
			aria-hidden="true"
		/>

		<h1
			class="app_logo__title"
			:class="{ collapsed }"
		>
			Week Eat Planner
		</h1>
	</NuxtLink>
</template>

<style scoped>
	.app_logo {
		display: flex;
		align-items: center;
		padding: var(--space-md);
		column-gap: var(--space-xs);
		text-decoration: none;
	}

	.app_logo__icon {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		object-fit: contain;
	}

	.app_logo__title {
		width: 100%;
		overflow: hidden;
		transition: all 0.3s ease;
		opacity: 1;
		color: var(--color-primary);
		font-size: var(--font-size-title);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-tight);
		white-space: nowrap;
	}

	.collapsed {
		max-width: 0;
		opacity: 0;
	}
</style>
