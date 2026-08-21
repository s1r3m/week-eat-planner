<template>
	<header class="guest-header">
		<LayoutAppLogo />

		<LayoutAuthControls class="guest-header__controls" />

		<Icon
			class="guest-header__mobile-controls"
			name="lucide:menu"
		/>
	</header>
</template>

<style scoped>
	.guest-header {
		display: flex;
		position: sticky;
		z-index: 30;
		align-items: center;
		justify-content: space-between;
		height: var(--header-height);
		border-bottom: 1px solid var(--color-outline);
		inset: 0;
		backdrop-filter: blur(16px);
	}

	.guest-header__mobile-controls {
		display: block;
	}

	.guest-header__controls {
		display: none;
	}

	@media (width >= 768px) {
		.guest-header__mobile-controls {
			display: none;
		}

		.guest-header__controls {
			display: flex;
		}
	}
</style>
