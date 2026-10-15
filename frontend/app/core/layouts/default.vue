<script setup lang="ts">
	import AppFooter from '@/modules/main/ui/AppFooter.vue'
	import AppHeader from '@/modules/main/ui/AppHeader.vue'
</script>

<template>
	<div class="layout-container">
		<AppHeader />

		<main class="main">
			<slot></slot>
		</main>

		<AppFooter />
	</div>
</template>

<style scoped>
	.layout-container {
		display: flex;
		flex-direction: column;
		max-width: var(--container-max-width);
		min-height: 100dvh;
		margin: 0 auto;
	}

	.main {
		flex: 1 1 auto;
	}
</style>
