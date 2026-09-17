<template>
  <div :class="['checkbox-custom', { checked: stateCheck }]" @click="toggleCheck">
    <div
      :class="[
        'checkbox-icon',
        {
          'material-icons': stateCheck,
          'material-icons-outlined': !stateCheck,
        },
      ]"
    >
      check_box
    </div>
    <span class="checkbox-label">{{ label }}</span>
  </div>
</template>
<script>
export default {
  name: "CustomCheckbox",
  props: {
    isChecked: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    }
  },
  data() {
    return {}
  },
  computed: {
    stateCheck() {
      return this.isChecked == true;
    }
  },
  methods: {
    toggleCheck() {
      this.$emit('toggle-checkbox');
    }
  },
}
</script>
<style scoped lang="scss">
.checkbox-custom {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  cursor: pointer;
  width: fit-content;
  .checkbox-icon {
    color: $secondary-color-40;
  }
  .checkbox-label {
    line-height: 1.8;
    font-weight: normal;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    color: $secondary-color-70;
    white-space: nowrap !important;
  }
  &.checked {
    .checkbox-icon,
    .checkbox-label {
      color: $primary-color-60 !important;
    }
  }
}
</style>
