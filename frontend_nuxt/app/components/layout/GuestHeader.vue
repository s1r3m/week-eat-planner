<template>
	<header class="guest-header">
		<LayoutAppLogo />

		<LayoutAuthControls class="desktop-only" />

		<Icon
			class="mobile-only"
			name="lucide:menu"
		/>
	</header>
</template>

<style scoped lang="scss">
	.guest-header {
		display: flex;
		position: sticky;
		z-index: 30;
		align-items: center;
		justify-content: space-between;
		height: var(--header-height);
		padding: var(--space-md) 0;
		border-bottom: 1px solid var(--color-outline);
		inset: 0;
		backdrop-filter: blur(16px);
	}

	.mobile-only {
		display: block;
	}

	.desktop-only {
		display: none;
	}

	@media (width >= 768px) {
		.mobile-only {
			display: none;
		}

		.desktop-only {
			display: flex;
		}
	}
</style>
