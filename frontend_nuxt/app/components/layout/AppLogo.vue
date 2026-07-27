<template>
	<NuxtLink
		:to="{ name: 'index' }"
		class="app-logo-container"
	>
		<img
			class="logo"
			src="@/assets/logo.png"
			alt="Week Eat Planner logo"
		/>

		<h1>Week Eat Planner</h1>
	</NuxtLink>
</template>

<style scoped>
	.app-logo-container {
		display: flex;
		text-decoration: none;
	}

	.logo {
		width: 40px;
	}

	h1 {
		color: var(--color-primary);
		font-size: var(--text-title-lg);
	}
</style>
