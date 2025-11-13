<template>
  <main class="main-layout">
    <section class="main-content">
        <div v-if="$slots.header" class="content-header">
            <slot name="header" />
        </div>

        <div class="content-body">
            <Suspense>
                <slot />
            </Suspense>
        </div>
    </section>
  </main>
</template>

<script setup lang="ts">

</script>

<style scoped>
.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px); /* Account for header/footer */
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
}

.content-body {
  flex: 1;
}
</style>
