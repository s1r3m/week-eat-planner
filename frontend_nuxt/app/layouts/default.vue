<template>
	<div class="layout-container">
		<LayoutGuestHeader />

		<main class="guest-main">
			<slot></slot>
		</main>

		<LayoutGuestFooter />
	</div>
</template>

<style scoped>
	.layout-container {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		max-width: 1260px;
		margin: 0 auto;
	}

	.guest-main {
		flex: 1 1 auto;
	}
</style>
