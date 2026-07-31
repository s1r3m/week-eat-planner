<script setup lang="ts">
	const { collapsed } = useSidebar()
</script>

<template>
	<div
		class="layout"
		:class="{ collapsed }"
	>
		<header class="auth-header">
			<LayoutAppHeader />
		</header>

		<aside class="auth-sidebar">
			<LayoutAppSidebar />
		</aside>

		<main class="content">
			<slot></slot>
		</main>
	</div>
</template>

<style scoped lang="scss">
	.layout {
		--sidebar-width: var(--sidebar-expanded);

		display: grid;
		width: 100%;
		grid-template-columns: var(--sidebar-width) 1fr;
		grid-template-rows: var(--header-height) 1fr;
		grid-template-areas: 'side head' 'side main';
		height: 100vh;

		transition: grid-template-columns 0.3s ease;
	}

	.layout.collapsed {
		--sidebar-width: var(--sidebar-collapsed);
	}

	.auth-header {
		grid-area: head;
		display: flex;
		padding: var(--space-md);
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--color-outline);
	}

	.auth-sidebar {
		grid-area: side;
	}

	.content {
		grid-area: main;
	}
</style>
