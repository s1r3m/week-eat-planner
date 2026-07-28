<template>
	<div class="layout-container">
		<LayoutGuestHeader />

		<main class="guest-main">
			<slot></slot>
		</main>

		<LayoutGuestFooter />
	</div>
</template>

<style scoped lang="scss">
	.layout-container {
		display: flex;
		flex-direction: column;
		max-width: 1480px;
		min-height: 100dvh;
		margin: 0 auto;
	}

	.guest-main {
		flex: 1 1 auto;
	}
</style>
