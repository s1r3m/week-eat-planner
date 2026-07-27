<template>
	<div id="layout-container">
		<LayoutGuestHeader />

		<main id="guest-main">
			<slot></slot>
		</main>

		<LayoutGuestFooter />
	</div>
</template>

<style scoped>
	#layout-container {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	#guest-main {
		flex: 1 1 auto;
	}
</style>
