<script setup lang="ts">
	defineProps<{
		collapsed: boolean
	}>()

	interface NavLink {
		icon: string
		id: number
		title: string
		to: string
	}

	const navLinks: NavLink[] = [
		{ icon: 'lucide:calendar-days', id: 1, title: 'My Weeks', to: 'my-weeks' },
		{ icon: 'lucide:utensils', id: 2, title: 'My Recipes', to: 'my-recipes' },
	]
</script>

<template>
	<div class="nav">
		<div
			v-for="link in navLinks"
			:key="link.id"
			class="nav__link"
		>
			<Icon :name="link.icon" />

			<NuxtLink
				class="nav__title"
				:class="{ collapsed }"
				:to="{ name: link.to }"
			>
				{{ link.title }}
			</NuxtLink>
		</div>
	</div>
</template>

<style scoped>
	.nav {
		display: flex;
		flex-direction: column;
		padding: var(--space-md);
		gap: var(--space-md);
	}

	.nav__link {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		font-size: var(--text-title-md);
	}

	.nav__title {
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
