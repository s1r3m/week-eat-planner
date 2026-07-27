<template>
	<section class="hero-container">
		<div class="promo">
			<UiBadge variant="outline">Smarter meal planning</UiBadge>

			<h2>
				Plan once.
				<br />

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

				<UiButton variant="outline">See how it works</UiButton>
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
		margin-top: var(--space-2xl);
		display: flex;
		flex-direction: column-reverse;
	}

	@media screen and (width > 768px) {
		.hero-container {
			flex-direction: row;
			justify-content: space-between;
		}
	}

	.promo {
		display: flex;
		align-items: start;
		justify-content: center;
		gap: var(--space-2xl);
		flex-direction: column;
	}

	.buttons-container {
		display: flex;
		justify-content: start;
		column-gap: var(--space-2xl);
	}

	.description {
		font-size: var(--text-body-lg);
		color: var(--color-secondary);
	}

	h2 {
		font-size: var(--text-headline-xl);
		font-weight: var(--font-weight-semibold);
		line-height: 1.2;
	}

	img {
		width: 480px;
		height: 100%;
		border-radius: var(--radius-lg);
	}

	span {
		color: var(--color-primary);
	}
</style>
