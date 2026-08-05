<script setup lang="ts">
	const { collapsed } = useSidebar()
</script>

<template>
	<div class="app-sidebar">
		<div class="upside">
			<LayoutAppLogo :collapsed="collapsed" />

			<LayoutAppNavigation :collapsed="collapsed" />
		</div>

		<LayoutAppUser :collapsed="collapsed" />
	</div>
</template>

<style scoped lang="scss">
	.app-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		justify-content: space-between;
		padding: var(--space-md) 0;
		border-right: 1px solid var(--color-outline);
	}
</style>
