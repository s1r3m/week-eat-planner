<script setup lang="ts">
	const { collapsed } = useSidebar()
</script>

<template>
	<div
		class="layout"
		:class="{ collapsed }"
	>
		<LayoutAppHeader class="auth-header" />

		<LayoutAppSidebar class="auth-sidebar" />

		<main class="content">
			<slot></slot>
		</main>
	</div>
</template>

<style scoped lang="scss">
	.layout {
		--sidebar-width: var(--sidebar-expanded);

		display: grid;
		grid-template:
			'side head' var(--header-height)
			'side main' 1fr
			/ var(--sidebar-width) 1fr;
		width: 100%;
		height: 100vh;
		transition: grid-template-columns 0.3s ease;
	}

	.layout.collapsed {
		--sidebar-width: var(--sidebar-collapsed);
	}

	.auth-header {
		grid-area: head;
	}

	.auth-sidebar {
		grid-area: side;
	}

	.content {
		grid-area: main;
	}
</style>
