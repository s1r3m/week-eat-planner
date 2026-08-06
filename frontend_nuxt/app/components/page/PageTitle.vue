<script setup lang="ts">
	const { createWeek } = useWeeksApi()

	const onCreate = async () => {
		await createWeek({ name: 'new week' })
	}
</script>

<template>
	<div class="page-title">
		<h1 class="page-title__name">My Weeks</h1>

		<div class="page-title__controls">
			<UiButton @click="onCreate">
				<Icon name="lucide:plus" />
				Create week
			</UiButton>
		</div>
	</div>
</template>

<style scoped>
	.page-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.page-title__name {
		color: var(--color-primary);
	}

	.page-title__controls {
		display: flex;
		gap: var(--space-md);
	}
</style>
