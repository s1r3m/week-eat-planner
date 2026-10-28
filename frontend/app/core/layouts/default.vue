<script setup lang="ts">
	import AppFooter from '@/modules/main/ui/AppFooter.vue'
	import AppHeader from '@/modules/main/ui/AppHeader.vue'
</script>

<template>
	<div class="layout-container">
		<AppHeader />

		<main>
			<slot></slot>
		</main>

		<AppFooter />
	</div>
</template>

<style scoped>
	.layout-container {
		display: grid;
		grid-template-rows: min-content 1fr min-content;
		height: 100dvh;
	}
</style>
