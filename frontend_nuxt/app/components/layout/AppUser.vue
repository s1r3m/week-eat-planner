<script setup lang="ts">
	defineProps<{
		collapsed: boolean
	}>()
</script>

<template>
	<div class="user-info">
		<Icon
			name="lucide:circle-user"
			:size="25"
		/>

		<p
			class="user-name"
			:class="{ collapsed }"
		>
			Jonh Doe
		</p>
	</div>
</template>

<style scoped lang="scss">
	.user-info {
		display: flex;
		gap: var(--space-md);
	}

	.user-name {
		max-width: 100%;
		overflow: hidden;
		transition: all 0.3s ease;
		opacity: 1;
		white-space: nowrap;
	}

	.collapsed {
		max-width: 0;
		opacity: 0;
	}
</style>
