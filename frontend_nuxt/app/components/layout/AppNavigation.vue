<script setup lang="ts">
	defineProps<{
		collapsed: boolean
	}>()

	interface NavLink {
		id: number
		icon: string
		title: string
	}

	const navLinks: NavLink[] = [
		{ id: 1, icon: 'lucide:calendar-days', title: 'My Weeks' },
		{ id: 2, icon: 'lucide:utensils', title: 'My Recipes' },
	]
</script>

<template>
	<div class="navigation">
		<div
			class="nav-link"
			v-for="link in navLinks"
			:key="link.id"
		>
			<Icon :name="link.icon" />
			<span
				class="nav-title"
				:class="{ collapsed }"
			>
				{{ link.title }}
			</span>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.nav-link {
		margin-bottom: var(--space-md);
		font-size: var(--text-title-md);
	}

	.nav-title {
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
