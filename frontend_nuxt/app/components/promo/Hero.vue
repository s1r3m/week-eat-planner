<template>
	<section class="hero-container">
		<div class="promo">
			<UiBadge variant="outline">Smarter meal planning</UiBadge>

			<h2 class="text-headline-lg">
				Plan once.
				<span>Eat better</span>
				all week.
			</h2>

			<p class="description text-body-md text-secondary">
				Build a week of meals, keep your budget on track, and reduce waste with
				auto-generated grocery lists.
			</p>

			<div class="buttons-container">
				<UiButton @click="navigateTo({ name: 'login' })">
					Start Planning
				</UiButton>

				<UiButton
					variant="outline"
					:disabled="true"
				>
					See how it works
				</UiButton>
			</div>
		</div>

		<img
			src="@/assets/promo/photo2.jpg"
			alt="meal planner"
		/>
	</section>
</template>

<style scoped>
	.hero-container {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-lg);
		row-gap: var(--space-2xl);
	}

	.promo {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		row-gap: var(--space-lg);
	}

	.buttons-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		row-gap: var(--space-md);
	}

	@media screen and (width > 768px) {
		.hero-container {
			flex-direction: row;
			justify-content: space-between;
		}

		.promo {
			flex-direction: column;
			align-items: start;
			justify-content: center;
			padding: var(--space-md);
			row-gap: var(--space-xl);
		}

		.buttons-container {
			flex-direction: row;
			justify-content: start;
			column-gap: var(--space-2xl);
		}

		.description {
			font-size: var(--text-body-lg);
			line-height: 2;
			text-align: left;
		}

		h2 {
			font-size: var(--text-headline-xl);
			line-height: 1.5;
			text-align: left;
		}
	}

	img {
		width: 100%;
		max-width: 480px;
		height: auto;
		border-radius: var(--radius-lg);
	}

	span {
		color: var(--color-primary);
	}
</style>
