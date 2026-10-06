<template>
  <div :class="['shimmer', {'active': loading}]">
    <div class="shimmer-item" v-for="item in shimmerItems" :key="item.index">
      <div class="shimmer-head">
        <div class="shimmer-row">
          <div class="shimmer-row__icon"></div>
          <div class="shimmer-row column">
            <div class="shimmer-row__text short"></div>
            <div class="shimmer-row__text"></div>
          </div>
        </div>
        <div class="shimmer-row__button"></div>
      </div>
      <div class="shimmer-body">
        <div class="shimmer-row">
          <div class="shimmer-row__image"></div>
          <div class="shimmer-row column">
            <div class="shimmer-row__text short"></div>
            <div class="shimmer-row__text"></div>
            <div class="shimmer-row__text short"></div>
          </div>
        </div>
        <div class="shimmer-row end">
          <div class="shimmer-row__text short"></div>
          <div class="shimmer-row__button"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "MyOrderShimmer",
  props: {
    loading: {
      type: Boolean,
      default: true,
    }
  },
  computed: {
    shimmerItems() {
      if(!this.loading) return [];
      return Array.from({ length: 5 }, (_, i) => ({index: i}));
    },
  }
}
</script>
<style scoped lang="scss">
.shimmer {
  display: none;
  &:is(.active) {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .shimmer-item {
    width: 100%;
    min-height: 120px;
    border: 1px solid $secondary-color-20;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 1.5s infinite;
    }
  }
  
  .shimmer-head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .shimmer-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .shimmer-row {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    &:is(.end){
      justify-content: flex-end;
    }
    &:is(.column) {
      align-items: flex-start !important;
      flex-direction: column !important;
    }
    &__icon {
      min-width: 40px;
      min-height: 40px;
      background: $secondary-color-20;
      border-radius: 50%;
    }
    &__text {
      flex: 1;
      width: 100%;
      min-height: 20px;
      background: $secondary-color-20;
      border-radius: 4px;
      &:is(.short){
        max-width: 30%;
        min-height: 15px;
      }
    }
    &__button {
      min-width: 120px;
      min-height: 30px;
      background: $secondary-color-20;
      border-radius: 999px;
    }
    &__image {
      min-width: 80px;
      min-height: 80px;
      background: $secondary-color-20;
      border-radius: 8px;
    }
  }
}
</style>