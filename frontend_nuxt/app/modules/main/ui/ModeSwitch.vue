<script setup lang="ts">
  import { DropdownMenuItem } from 'reka-ui'

  import BaseButton from '@/common/ui/BaseButton.vue'
  import BaseDropdown from '@/common/ui/BaseDropdown.vue'

  const colorMode = useColorMode()
</script>

<template>
  <BaseDropdown>
    <template #trigger>
      <BaseButton variant="icon">
        <ClientOnly>
          <Icon
            v-if="colorMode.value === 'light'"
            name="lucide:sun"
            :size="24"
          />

          <Icon
            v-else
            name="lucide:moon"
            :size="24"
          />

          <template #placeholder>
            <Icon
              name="lucide:palette"
              :size="24"
            />
          </template>
        </ClientOnly>
      </BaseButton>
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
  </BaseDropdown>
</template>
