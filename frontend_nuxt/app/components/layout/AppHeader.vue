<script setup lang="ts">
	const { collapsed, toggleCollapsed } = useSidebar()
	const isMobile = true
</script>

<template>
	<div class="left-header">
		<UiButton
			class="menu-btn"
			variant="icon"
			@click="toggleCollapsed"
		>
			<Icon
				:name="collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
			/>
		</UiButton>

		<div class="breadcrumbs">My Weeks -> temp</div>
	</div>

	<div class="right-header">
		<UiButton
			v-if="isMobile"
			class="menu-btn"
			variant="icon"
		>
			<Icon name="lucide:menu" />
		</UiButton>
	</div>
</template>

<style scoped lang="scss">
	.left-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.right-header {
		display: flex;
		align-items: center;
	}
</style>
