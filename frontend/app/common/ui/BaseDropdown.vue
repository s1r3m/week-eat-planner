<script setup lang="ts">
	import {
		DropdownMenuContent,
		DropdownMenuPortal,
		DropdownMenuRoot,
		DropdownMenuTrigger,
	} from 'reka-ui'

	defineProps<{
		align?: 'center' | 'end' | 'start'
		contentClass?: string
	}>()
</script>

<template>
	<DropdownMenuRoot>
		<DropdownMenuTrigger as-child>
			<slot name="trigger"></slot>
		</DropdownMenuTrigger>

		<DropdownMenuPortal>
			<DropdownMenuContent
				class="dropdown"
				:align="align ?? 'end'"
				:class="contentClass"
				:side-offset="8"
			>
				<slot></slot>
			</DropdownMenuContent>
		</DropdownMenuPortal>
	</DropdownMenuRoot>
</template>
