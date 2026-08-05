<script setup lang="ts">
	const { collapsed, toggleCollapsed } = useSidebar()
</script>

<template>
	<header class="app-header">
		<div class="app-header__left-side">
			<UiButton
				class="menu-btn"
				variant="icon"
				@click="toggleCollapsed"
			>
				<Icon
					:name="
						collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'
					"
				/>
			</UiButton>

			<div class="breadcrumbs">My Weeks -> temp</div>
		</div>

		<div class="app-header__right-side mobile_only">
			<UiButton
				class="app-header__menu-btn"
				variant="icon"
			>
				<Icon name="lucide:menu" />
			</UiButton>
		</div>
	</header>
</template>

<style scoped lang="scss">
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		border-bottom: 1px solid var(--color-outline);
	}

	.app-header__left-side {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.app-header__right-side {
		display: flex;
		align-items: center;
	}

	.mobile_only {
		display: block;
	}

	@media screen and (width > 480px) {
		.mobile_only {
			display: none;
		}
	}
</style>
