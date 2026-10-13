<script setup lang="ts">
	import { useGlobalToast } from '@/common/composables/useGlobalToast'
	import { useToastAutoDismiss } from '@/common/composables/useToastAutoDismiss'
	import BaseAlert from '@/common/ui/BaseAlert.vue'

	const { dismiss, toasts } = useGlobalToast()

	useToastAutoDismiss(toasts, dismiss)
</script>

<template>
	<Teleport to="body">
		<div class="global-toast">
			<TransitionGroup name="toast">
				<BaseAlert
					v-for="toast in toasts"
					:key="toast.id"
					class="global-toast__item"
					:message="toast.message"
					:variant="toast.variant"
					@close="dismiss(toast.id)"
				/>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<style scoped>
	.global-toast {
		display: flex;
		position: fixed;
		z-index: 100;
		right: var(--space-5);
		bottom: var(--space-5);
		flex-direction: column;
		pointer-events: none;
		gap: var(--space-2);
	}

	.global-toast__item {
		max-width: 24.375rem;
		pointer-events: all;
	}

	.toast-enter-active {
		transition:
			opacity var(--duration-base) ease-out,
			transform var(--duration-base) cubic-bezier(0.16, 1, 0.3, 1);
	}

	.toast-leave-active {
		transition:
			opacity var(--duration-fast) ease-in,
			transform var(--duration-fast) ease-in;
	}

	.toast-enter-from,
	.toast-leave-to {
		transform: translateX(1.5rem);
		opacity: 0;
	}

	.toast-move {
		transition: transform var(--duration-base) ease;
	}
</style>
