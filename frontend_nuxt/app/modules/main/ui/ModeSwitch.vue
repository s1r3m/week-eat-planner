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
      :class="{ 'dropdown__item--selected': colorMode.preference === 'dark' }"
      @click="colorMode.preference = 'dark'"
    >
      <Icon
        name="lucide:moon"
        :size="24"
      />
      Dark
    </DropdownMenuItem>

    <DropdownMenuItem
      class="dropdown__item"
      :class="{ 'dropdown__item--selected': colorMode.preference === 'light' }"
      @click="colorMode.preference = 'light'"
    >
      <Icon
        name="lucide:sun"
        :size="24"
      />
      Light
    </DropdownMenuItem>

    <DropdownMenuItem
      class="dropdown__item"
      :class="{ 'dropdown__item--selected': colorMode.preference === 'system' }"
      @click="colorMode.preference = 'system'"
    >
      <Icon
        name="lucide:palette"
        :size="24"
      />
      System
    </DropdownMenuItem>
  </BaseDropdown>
</template>
