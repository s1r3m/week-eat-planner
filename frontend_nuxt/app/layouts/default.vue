<template>
	<div id="layout-container">
		<header id="guest-header">
			<h1>Week Eat Planner</h1>
		</header>

		<main id="guest-main">
			<slot></slot>
		</main>

		<footer id="guest-footer">Footer</footer>
	</div>
</template>

<style scoped>
	#layout-container {
		display: flex;
		flex-direction: column;
	}

	#guest-header {
		border-bottom: 1px solid red;
		flex: 0 0 auto;
	}

	#guest-footer {
		border-top: 1px solid red;
		flex: 0 0 auto;
	}

	#guest-main {
		flex: 1 1 auto;
	}
</style>
