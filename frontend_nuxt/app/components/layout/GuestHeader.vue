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

<style scoped>
	.guest-header {
		display: flex;
		position: sticky;
		inset: 0;
		z-index: 30;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		border-bottom: 1px solid var(--color-outline);
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
