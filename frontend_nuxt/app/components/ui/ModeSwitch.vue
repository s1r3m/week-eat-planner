<script setup lang="ts">
	import { DropdownMenuItem } from 'reka-ui'

	const colorMode = useColorMode()
</script>

<template>
	<UiDropdown>
		<template #trigger>
			<UiButton variant="icon">
				<ClientOnly>
					<Icon
						v-if="colorMode.value === 'light'"
						name="lucide:sun"
					/>

					<Icon
						v-else
						name="lucide:moon"
					/>

					<template #placeholder>
						<Icon name="lucide:palette" />
					</template>
				</ClientOnly>
			</UiButton>
		</template>

		<DropdownMenuItem
			class="dropdown__item"
			@click="colorMode.preference = 'dark'"
		>
			<Icon name="lucide:moon" />
			Dark
		</DropdownMenuItem>

		<DropdownMenuItem
			class="dropdown__item"
			@click="colorMode.preference = 'light'"
		>
			<Icon name="lucide:sun" />
			Light
		</DropdownMenuItem>

		<DropdownMenuItem
			class="dropdown__item"
			@click="colorMode.preference = 'system'"
		>
			<Icon name="lucide:palette" />
			System
		</DropdownMenuItem>
	</UiDropdown>
</template>
