<template>
	<NuxtLink
		:to="{ name: 'index' }"
		class="app-logo-container"
	>
		<img
			class="logo"
			src="@/assets/logo.png"
			alt=""
			aria-hidden="true"
		/>

		<h1 class="text-title-lg text-primary">Week Eat Planner</h1>
	</NuxtLink>
</template>

<style scoped lang="scss">
	.app-logo-container {
		display: flex;
		align-items: center;
		column-gap: var(--space-xs);
		text-decoration: none;
	}

	.logo {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		object-fit: contain;
	}
</style>
