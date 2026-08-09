<script setup lang="ts">
	import type { RouteLocationRaw } from 'vue-router'

	defineProps<{
		collapsed: boolean
	}>()

	interface NavLink {
		icon?: string
		id: string
		title: string
		to: RouteLocationRaw
		inactive?: boolean
		child?: NavLink[]
	}

	const { data: weeks } = useQuery(getWeeksQuery())

	const navLinks = computed<NavLink[]>(() => [
		{
			icon: 'lucide:calendar-days',
			id: '1',
			title: 'My Weeks',
			to: { name: 'my-weeks' },
			child: weeks.value?.map((week) => ({
				id: week.id,
				title: week.name,
				inactive: week.__pending,
				to: { name: 'weeks-id', params: { id: week.id } },
			})),
		},
		{
			icon: 'lucide:utensils',
			id: '2',
			title: 'My Recipes',
			to: { name: 'my-recipes' },
		},
	])
</script>

<template>
	<div class="nav">
		<div
			v-for="link in navLinks"
			:key="link.id"
			class="nav__item"
		>
			<NuxtLink
				class="nav__link"
				:to="link.to"
				:aria-label="link.title"
			>
				<Icon
					v-if="link.icon"
					:name="link.icon"
				/>

				<span
					class="nav__title"
					:class="{ collapsed }"
				>
					{{ link.title }}
				</span>
			</NuxtLink>

			<div
				v-if="link.child?.length && !collapsed"
				class="nav__children"
			>
				<template
					v-for="child in link.child"
					:key="child.id"
				>
					<span
						v-if="child.inactive"
						class="nav__child-link nav__child-link--inactive"
					>
						{{ child.title }}
					</span>

					<NuxtLink
						v-else
						class="nav__child-link"
						:to="child.to"
					>
						{{ child.title }}
					</NuxtLink>
				</template>
			</div>
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

	.nav__item {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.nav__link {
		display: flex;
		align-items: center;
		padding: var(--space-xs);
		transition: all 0.3s ease;
		border-radius: var(--radius-sm);
		color: var(--color-on-surface-variant);
		font-size: var(--text-title-lg);
		text-decoration: none;
		gap: var(--space-md);

		&:hover {
			color: var(--color-primary);
		}

		&.router-link-active {
			background-color: var(--color-surface-variant);
			color: var(--color-primary);
		}
	}

	.nav__title {
		max-width: 100%;
		overflow: hidden;
		transition: all 0.3s ease;
		opacity: 1;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.collapsed {
		max-width: 0;
		opacity: 0;
	}

	.nav__children {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding-left: calc(1.5rem + var(--space-md));
	}

	.nav__child-link {
		padding: var(--space-xs) var(--space-sm);
		overflow: hidden;
		transition: all 0.3s ease;
		border-radius: var(--radius-xs);
		color: var(--color-on-surface-variant);
		font-size: var(--text-body-lg);
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;

		&:hover {
			color: var(--color-primary);
		}

		&.router-link-exact-active {
			background-color: var(--color-surface-variant);
			color: var(--color-primary);
		}
	}

	.nav__child-link--inactive {
		opacity: 0.5;
		color: var(--color-on-surface-variant);
		cursor: not-allowed;
	}
</style>
