<script setup lang="ts">
	const { collapsed } = useSidebar()
</script>

<template>
	<div class="sidebar">
		<div class="upside">
			<LayoutAppLogo :collapsed="collapsed" />

			<LayoutAppNavigation :collapsed="collapsed" />
		</div>

		<LayoutAppUser :collapsed="collapsed" />
	</div>
</template>

<style scoped lang="scss">
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		// align-items: center;
		justify-content: space-between;
		padding: var(--space-md) 0;
		border-right: 1px solid var(--color-outline);
	}
</style>
