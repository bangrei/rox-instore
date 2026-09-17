<template>
  <div class="empty-wrapper">
    <img :src="require('@/assets/images/product-empty-state.png')"/>
    <label>Oops! No products found</label>
    <span v-if="isFilter">No products match your current filter. Please try different keywords or filters.</span>
  </div>
</template>
<script>
export default {
  name: "BaseEmptyProductState",
  props: {
    isFilter: {
      type: Boolean,
      default: false,
    }
  }
}
</script>
<style scoped lang="scss">
.empty-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 24px;
  img {
    max-width: 160px;
    width: 100%;
    margin-inline: auto;
  }
  label {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 24px;
    line-height: 38px;
  }
}
</style>