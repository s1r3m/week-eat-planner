<template>
  <header
    class="flex items-center gap-3 h-15 sticky top-0 z-30 border-b bg-background/70 backdrop-blur mx-3"
  >
    <div class="flex-none">
      <slot name="left" />
    </div>
    <div class="flex-1">
      <slot name="center" />
    </div>
    <div class="flex-none">
      <slot name="right" />
    </div>
  </header>
</template>
