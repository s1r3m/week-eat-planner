<template>
	<div class="controls-container">
		<button
			type="button"
			class="btn"
		>
			Login
		</button>

		<button
			type="button"
			class="btn primary"
		>
			Register
		</button>
	</div>
</template>

<style scoped>
	.controls-container {
		display: flex;
		align-items: center;
		column-gap: 12px;
		transition: all 0.3s ease;
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
	}

	.primary {
		background-color: var(--color-primary);
	}
</style>
