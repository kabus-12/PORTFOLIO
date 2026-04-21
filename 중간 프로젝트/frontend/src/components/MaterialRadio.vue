<template>
  <div class="form-check">
    <input
      :id="id"
      class="form-check-input"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @change="$emit('update:modelValue', value)"
    />
    <label class="custom-control-label" :for="id">
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: "MaterialRadio",
  props: {
    // 부모의 v-model과 연결되는 값
    modelValue: [String, Number, Boolean],
    // 이 라디오 버튼 자체의 값
    value: [String, Number, Boolean],
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
};
</script>
