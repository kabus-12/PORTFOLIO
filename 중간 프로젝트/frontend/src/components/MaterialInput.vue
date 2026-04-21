<template>
  <div
    class="input-group"
    :class="[
      `input-group-${variant} ${getStatus(error, success)}`,
      modelValue !== '' && modelValue !== null && modelValue !== undefined
        ? 'is-filled'
        : '',
    ]"
  >
    <label :class="variant === 'static' ? '' : 'form-label'">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      class="form-control"
      :class="getClasses(size)"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :required="isRequired"
      :disabled="disabled"
      :readonly="readonly"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script>
import setMaterialInput from "@/assets/js/material-input.js";

export default {
  name: "MaterialInput",
  props: {
    // value 대신 modelValue로 변경 (Vue 3 표준)
    modelValue: {
      type: [String, Number],
      default: "",
    },
    variant: {
      type: String,
      default: "outline",
    },
    label: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "default",
    },
    success: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"], // 이벤트명 변경
  mounted() {
    if (setMaterialInput) {
      setMaterialInput();
    }
  },
  methods: {
    getClasses: (size) => {
      return size && size !== "default" ? `form-control-${size}` : "";
    },
    getStatus: (error, success) => {
      if (success) return "is-valid";
      if (error) return "is-invalid";
      return "";
    },
  },
};
</script>
