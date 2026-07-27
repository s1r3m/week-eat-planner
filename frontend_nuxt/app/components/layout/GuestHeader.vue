<template>
	<header class="guest-header">
		<LayoutAppLogo />

		<LayoutAuthControls />
	</header>
</template>

<style scoped>
	.guest-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md);
		border-bottom: 1px solid var(--color-outline);
	}
</style>
