<script setup lang="ts">
	const { collapsed } = useSidebar()
</script>

<template>
	<div class="app-sidebar">
		<LayoutAppLogo :collapsed="collapsed" />

		<LayoutAppNavigation
			class="app-sidebar__nav"
			:collapsed="collapsed"
		/>

		<LayoutAppUser :collapsed="collapsed" />
	</div>
</template>

<style scoped lang="scss">
	.app-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		border-right: 1px solid var(--color-outline);
	}

	.app-sidebar__nav {
		flex: 1;
	}
</style>
