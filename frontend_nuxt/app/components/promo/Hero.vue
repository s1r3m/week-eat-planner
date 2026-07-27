<template>
	<section class="hero-container">
		<div class="promo">
			<UiBadge variant="outline">Smarter meal planning</UiBadge>

			<h2>
				Plan once.
				<span>Eat better</span>
				all week.
			</h2>

			<p class="description">
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
			src="@/assets/styles/promo/photo2.jpg"
			alt="meal planner"
		/>
	</section>
</template>

<style scoped lang="scss">
	.hero-container {
		margin-top: var(--space-lg);
		padding: 0 var(--space-md);
		display: flex;
		flex-direction: column;
		row-gap: var(--space-2xl);
	}

	.promo {
		display: flex;
		align-items: center;
		justify-content: center;
		row-gap: var(--space-md);
		flex-direction: column;
	}

	.buttons-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		row-gap: var(--space-md);
	}

	@media screen and (width > 768px) {
		.hero-container {
			flex-direction: row;
			justify-content: space-between;
		}

		.promo {
			align-items: start;
			justify-content: center;
			column-gap: var(--space-2xl);
			flex-direction: column;
		}

		.buttons-container {
			flex-direction: row;
			justify-content: start;
			column-gap: var(--space-2xl);
		}

		h2 {
			font-size: var(--text-headline-xl);
			line-height: 1.5;
		}
	}

	.description {
		font-size: var(--text-body-md);
		color: var(--color-secondary);
		text-align: center;
	}

	h2 {
		font-size: var(--text-headline-lg);
		font-weight: var(--font-weight-semibold);
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
