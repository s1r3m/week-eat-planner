<script setup lang="ts">
	import PromoHero from '@/modules/main/ui/PromoHero.vue'

	definePageMeta({
		auth: 'public',
		redirectAuthenticated: true,
	})
</script>

<template>
	<div class="page-container">
		<PromoHero />
	</div>
</template>
