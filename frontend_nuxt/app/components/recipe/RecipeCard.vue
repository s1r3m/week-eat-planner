<script setup lang="ts">
	defineProps<{
		pending?: boolean
		recipe: IRecipeInfo
	}>()
</script>

<template>
	<NuxtLink
		:to="'#'"
		:aria-disabled="pending || undefined"
		:class="{ 'week-card__link--disabled': pending }"
		:tabindex="pending ? -1 : undefined"
	>
		<div class="recipe-card">
			<div class="recipe-card__content">
				<div class="recipe-card__bg">
					<img
						v-if="recipe.image_url"
						class="recipe-card__bg-image"
						:src="recipe.image_url"
						alt=""
						loading="lazy"
					/>
				</div>

				<div class="recipe-card__title">
					<h2 class="recipe-card__name">{{ recipe.name }}</h2>

					<p class="recipe-card__author">{{ recipe.author }}</p>
				</div>
			</div>

			<div
				v-if="pending"
				class="recipe-card__blocker"
				aria-hidden="true"
			>
				<UiSpinner />
			</div>
		</div>
	</NuxtLink>
</template>

<style scoped>
	.recipe-card {
		display: grid;
		position: relative;
		overflow: hidden;
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-xl);
		isolation: isolate;
	}

	.recipe-card:hover .recipe-card__bg img {
		transform: scale(1.1);
	}

	.recipe-card__content,
	.recipe-card__blocker {
		grid-area: 1 / 1;
	}

	.recipe-card__content {
		display: grid;
		width: 100%;
		height: 180px;
		overflow: hidden;
		border: 1px solid var(--color-outline);
		border-radius: var(--radius-md);
		cursor: pointer;
		isolation: isolate;
	}

	.recipe-card__blocker {
		display: flex;
		z-index: 1;
		align-items: center;
		justify-content: center;
		background: rgb(0 0 0 / 45%);
		cursor: not-allowed;
	}

	.recipe-card__bg {
		position: absolute;
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		inset: 0;
	}

	.recipe-card__bg-image {
		display: block;
		width: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 0.3s ease;
	}

	.recipe-card__title {
		position: relative;
		grid-area: 1 / 1;
		align-self: end;
		padding: var(--space-md);
		background: rgb(255 255 255 / 75%);

		.recipe-card__name {
			font-size: var(--font-size-button);
		}

		.recipe-card__author {
			font-size: var(--font-size-label);
		}
	}
</style>
