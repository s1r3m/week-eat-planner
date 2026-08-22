<template>
	<span class="spinner"></span>
</template>

<style scoped>
	.spinner {
		display: inline-block;
		width: 24px;
		height: 24px;
		animation: spin 0.7s linear infinite;
		border: 3px solid var(--color-primary);
		border-radius: 50%;
		border-right-color: transparent;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
