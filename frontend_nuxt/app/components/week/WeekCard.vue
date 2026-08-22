<script setup lang="ts">
	defineProps<{
		pending?: boolean
		week: IWeekPreview
	}>()
</script>

<template>
	<NuxtLink
		:to="{ name: 'weeks-id', params: { id: week.id } }"
		:aria-disabled="pending || undefined"
		:class="{ 'week-card__link--disabled': pending }"
		:tabindex="pending ? -1 : undefined"
	>
		<div class="week-card">
			<div class="week-card__content">
				<div class="week-card__bg"></div>

				<h2 class="week-card__name">{{ week.name }}</h2>
			</div>

			<div
				v-if="pending"
				class="week-card__blocker"
				aria-hidden="true"
			>
				<UiSpinner />
			</div>
		</div>
	</NuxtLink>
</template>

<style scoped>
	.week-card {
		display: grid;
		isolation: isolate;
	}

	.week-card__content,
	.week-card__blocker {
		grid-area: 1 / 1;
	}

	.week-card__content {
		display: grid;
		width: 100%;
		height: 240px;
		overflow: hidden;
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		background-color: var(--color-surface-variant);
		cursor: pointer;
		isolation: isolate;
	}

	.week-card__blocker {
		display: flex;
		z-index: 1;
		align-items: center;
		justify-content: center;
		background: rgb(0 0 0 / 45%);
		cursor: not-allowed;
	}

	.week-card__bg {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		background: color-mix(in oklab, var(--color-primary) 30%, white);
	}

	.week-card__name {
		position: relative;
		grid-area: 1 / 1;
		align-self: end;
		padding: var(--space-md);
		background: rgb(255 255 255 / 45%);
		color: var(--color-text);
		text-align: center;
	}

	.week-card__link--disabled {
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
