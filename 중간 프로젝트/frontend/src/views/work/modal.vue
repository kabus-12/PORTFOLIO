<script setup>
const emit = defineEmits(["close"]);
const emitClose = () => {
  emit("close");
};
</script>
<template>
  <div class="work-modal card shadow-lg border-0 border-radius-xl p-4">
    <slot name="content" />
    <div class="mt-3 d-flex justify-content-end gap-2">
      <slot name="actions" :close="emitClose" />
    </div>
  </div>
</template>
<style scoped>
.work-modal {
  background-color: var(--app-surface);
}
</style>
