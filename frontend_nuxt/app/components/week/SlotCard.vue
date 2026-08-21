<script setup lang="ts">
	defineProps<{ mealSlot: IMealSlot }>()
</script>

<template>
	<div
		class="slot"
		:class="{ 'slot--filled': !!mealSlot.recipe }"
	>
		<div class="slot__bg">
			<img
				v-if="mealSlot.recipe?.image_url"
				class="slot__bg-image"
				:src="mealSlot.recipe?.image_url"
				alt=""
				loading="lazy"
			/>
		</div>

		<div class="slot__content">
			<UiBadge>{{ mealSlot.meal_type }}</UiBadge>

			<template v-if="mealSlot.recipe">
				<div class="slot__portion">
					<span class="slot__portion-control">
						<Icon name="lucide:minus" />
					</span>
					{{ mealSlot.recipe?.portions ?? 1 }}
					<span class="slot__portion-control">
						<Icon name="lucide:plus" />
					</span>
				</div>

				<UiBadge
					v-if="mealSlot.recipe"
					variant="recipe-name"
				>
					{{ mealSlot.recipe?.name }}
				</UiBadge>
			</template>

			<div
				v-else
				class="slot__assign"
			>
				<Icon
					name="lucide:plus"
					:size="14"
				/>
				Assign a recipe
			</div>
		</div>
	</div>
</template>

<style scoped>
	.slot {
		display: grid;
		position: relative;
		grid-template-areas: 1 / 1;
		height: 120px;
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1px dotted var(--color-primary);
		border-radius: var(--radius-xl);
		cursor: pointer;

		&:hover {
			background-color: color-mix(
				in oklab,
				var(--color-primary) 25%,
				rgb(255 255 255)
			);
		}
	}

	.slot--filled {
		border: 1px solid var(--color-primary);
	}

	.slot__bg {
		position: absolute;
		z-index: 0;
		grid-area: 1 / 1;
		transition: all 0.3s ease;
		inset: 0;

		.slot__bg-image {
			display: block;
			width: 100%;
			object-fit: cover;
			object-position: center;
			transition: transform 0.3s ease;
		}

		&::after {
			content: '';
			position: absolute;
			z-index: 0;
			background: rgb(255 255 255 / 50%);
			pointer-events: none;
			inset: 0;
			backdrop-filter: blur(3px);
		}
	}

	.slot:hover .slot__bg img {
		transform: scale(1.1);
	}

	.slot__content {
		display: flex;
		position: relative;
		grid-area: 1 / 1;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);

		.slot__portion {
			z-index: 10;
		}

		.slot__portion-control {
			display: inline-flex;
			align-items: center;
			padding: var(--space-xs);
			border: 1px solid var(--color-outline);
			border-radius: var(--radius-full);

			&:hover {
				background-color: color-mix(
					in oklab,
					var(--color-primary) 25%,
					rgb(255 255 255)
				);
			}
		}

		.slot__assign {
			display: flex;
			align-items: center;
			font-size: var(--font-size-label);
		}
	}
</style>
