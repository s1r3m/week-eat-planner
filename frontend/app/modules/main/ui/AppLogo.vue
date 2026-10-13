<script setup lang="ts">
	const { collapsed = false } = defineProps<{
		collapsed?: boolean
	}>()

	defineEmits<{
		navigate: []
	}>()
</script>

<template>
	<NuxtLink
		:to="{ name: 'index' }"
		class="app_logo"
		@click="$emit('navigate')"
	>
		<img
			class="app_logo__icon"
			src="/images/logo.png"
			alt=""
			aria-hidden="true"
		/>

		<h1
			class="app_logo__title"
			:class="{ 'app_logo__title--collaped': collapsed }"
		>
			Week Eat Planner
		</h1>
	</NuxtLink>
</template>

<style scoped>
	.app_logo {
		display: flex;
		align-items: center;
		height: var(--header-height);
		padding: 0 var(--space-2);
		gap: var(--space-1);
	}

	.app_logo__icon {
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		object-fit: contain;
	}

	.app_logo__title {
		width: 100%;
		overflow: hidden;
		transition:
			opacity,
			max-width var(--duration-base) ease;
		opacity: 1;
		color: var(--brand-primary);
		font-size: var(--text-20);
		white-space: nowrap;
	}

	.app_logo__title--collaped {
		max-width: 0;
		opacity: 0;
	}
</style>
