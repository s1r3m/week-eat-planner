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
		overflow: hidden;
		white-space: nowrap;
		opacity: 1;
		max-width: 100%;
		transition: all 0.3s ease;
	}

	.collapsed {
		opacity: 0;
		max-width: 0;
	}
</style>
