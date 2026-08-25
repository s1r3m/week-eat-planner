<script setup lang="ts">
	const { collapsed, toggleCollapsed } = useSidebar()

	const { logout } = useAuthStore()

	const onLogout = () => {
		logout()
		navigateTo({ name: 'index' })
	}
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

		<div class="app-header__right-side">
			<UiModeSwitch />

			<UiButton
				class="app-header__mobile-menu"
				variant="icon"
			>
				<Icon name="lucide:menu" />
			</UiButton>

			<UiButton
				variant="danger"
				@click="onLogout"
			>
				Logout
			</UiButton>
		</div>
	</header>
</template>

<style scoped>
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
		gap: var(--space-md);
	}

	.app-header__mobile-menu {
		display: block;
	}

	@media (width > 480px) {
		.app-header__mobile-menu {
			display: none;
		}
	}
</style>
