<template>
	<NuxtLink
		:to="{ name: 'index' }"
		class="app-logo-container"
	>
		<img
			class="logo"
			src="@/assets/logo.png"
			alt=""
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
		flex-shrink: 0;
		width: 100%;
		max-width: 36px;
		height: auto;
		object-fit: contain;
	}

	h1 {
		color: var(--color-primary);
		font-size: var(--text-title-lg);
	}
</style>
