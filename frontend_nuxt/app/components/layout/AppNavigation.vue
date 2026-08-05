<script setup lang="ts">
	defineProps<{
		collapsed: boolean
	}>()

	interface NavLink {
		icon: string
		id: number
		title: string
	}

	const navLinks: NavLink[] = [
		{ icon: 'lucide:calendar-days', id: 1, title: 'My Weeks' },
		{ icon: 'lucide:utensils', id: 2, title: 'My Recipes' },
	]
</script>

<template>
	<div class="navigation">
		<div
			v-for="link in navLinks"
			:key="link.id"
			class="nav-link"
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
