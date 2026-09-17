<template>
  <div class="variants" :class="{'empty-banners': isEmptyBanners}">
    <div class="variant-information" v-if="!isEmpty(selectedVariant)">
      <div class="variant-info">
        <div class="variant-info-label">Weight</div>
        <span>{{ weightInfo }}</span>
      </div>
      <div class="variant-info right">
        <div class="variant-info-label">Dimension</div>
        <span>{{ dimensionInfo }}</span>
      </div>
    </div>
    <div class="variant-images" v-if="!isEmpty(images)">
      <div class="variant-image-wrapper" 
        v-for="image in images" 
        :key="image.id"
      >
        <img :src="image.display"/>
      </div>
    </div>
    <div class="variants-list-wrapper">
      <div class="variant" v-for="variant in variants" 
        :key="variant.id"
        @click="clickVariant(variant)"
        :class="{'selected': variant.id == selectedVariant.id, 'unavailable': isUnavailable}"
      >
        <div class="variant-details">
          <!-- <div class="variant-sku">{{ variant.pluCode }}</div> -->
          <div class="variant-name">{{ variant.name }}</div>
          <!-- <div class="variant-price-wrapper">
            <span class="variant-price" v-if="hasPromoPrice(variant)">Promo: {{ currency(variant.promoPrice) }}</span>
            <span 
              class="variant-price" :class="{'has-promo-price': hasPromoPrice(variant)}"
            >{{ currency(variant.price) }}</span>
          </div> -->
        </div>
        <!-- <span v-if="variant.id == selectedVariant.id"
          class="variant-selector selected material-icons"
        >check_circle</span>
        <span v-else class="variant-selector material-icons">radio_button_unchecked</span> -->
      </div>
    </div>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
export default {
  name: "ProductVariants",
  mixins: [utility],
  props: {
    inventories: {
      type: Array,
      default: () => []
    },
    product: {
      type: Object,
      default: () => { },
      required: true,
    },
    preSelectVariant: {
      type: Object,
      default: () => { },
    },
    isEmptyBanners: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      variants: [],
      selectedVariant: {}
    }
  },
  created() {
    this.variants = [];
    if (isEmpty(this.product.variants)) {
      return;
    }
    this.variants = this.product.variants.map((it) => {
      return {
        ...it,
        images: it.images ? it.images.map((img) => {
          return {
            ...img,
            display: this.getImage(img.id, 'width=300')
          }
        }).sort((a, b) => a.sortIndex - b.sortIndex) : []
      }
    });
    if (!isEmpty(this.preSelectVariant)) {
      let variant = this.variants.find((it) => it.id == this.preSelectVariant.id);
      if (!variant) {
        this.clickVariant(this.variants[0]);
        return;
      }
      this.clickVariant(variant);
    }
    else this.clickVariant(this.variants[0]);
  },
  computed: {
    images() {
      if (isEmpty(this.selectedVariant)) return [];
      return this.selectedVariant.images;
    },
    weightInfo() {
      if (!isEmpty(this.selectedVariant) && this.selectedVariant.weight > 0) {
        return `${this.selectedVariant.weight} kg`;
      }
      return "-";

    },
    dimensionInfo() {
      if (!isEmpty(this.selectedVariant)) {
        let len = this.selectedVariant.length;
        let width = this.selectedVariant.width;
        let height = this.selectedVariant.height;
        if (len + width + height > 0) {
          return `${len}cm x ${width}cm x ${height}cm`;
        }
      }
      return "-";
    }
  },
  methods: {
    clickVariant(variant) {
      if (this.selectedVariant.id == variant.id) return;
      this.selectedVariant = variant;
      this.$emit('emit-variant', variant);
    },
    hasPromoPrice(variant) {
      return (variant.promoPrice || 0) > 0;
    },
    variantInventory(variant) {
      return this.inventories?.find((it) => it.product.id == this.product.id && it.variant?.id == variant.id && it.status == "ACTIVE" && it.stock > 0);
    }
  }
}
</script>
<style scoped lang="scss">
.variants {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
  &.empty-banners {
    max-width: 100% !important;
  }
  .variant-items {
    width: 100%;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .variants-list-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .variant {
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border: 1px solid $dark-color-4;
    color: $dark-color-2;
    border-radius: 24px;
    padding: 6px 16px;
    cursor: pointer;
    &.unavailable {
      background: $secondary-color-10;
      pointer-events: none;
      .variant-name {
        color: $secondary-color-60 !important;
      }
      .variant-price {
        color: $secondary-color-40 !important;
      }
    }
    &:not(.unavailable):hover {
      background: $secondary-color-20;
      .variant-selector {
        color: $primary-color-30;
      }
    }
    &.selected:not(.unavailable) {
      background: $secondary-color-20;
      pointer-events: none;
    }
    &.selected:is(.unavailable) {
      background: $secondary-color-20;
      border-color: $secondary-color-30;
      pointer-events: none;
      .variant-name {
        font-weight: bold !important;
      }
      .variant-selector {
        color: $secondary-color-60;
      }
    }
    .variant-details {
      display: flex;
      flex-direction: column;
      .variant-sku {
        font-size: 0.8em;
        color: $secondary-color-60;
        &::before {
          content: "SKU ";
        }
      }
      .variant-name {
        font-weight: bold;
        font-size: 17px;
        line-height: 26px;
      }
      .variant-price-wrapper {
        display: flex;
        align-items: baseline;
        gap: 8px;
        .variant-price {
          font-size: 0.8em;
          color: $primary-color-60;
          font-weight: bold;
          &.has-promo-price {
            color: $secondary-color-80;
            font-weight: normal;
            text-decoration: line-through;
          }
        }
      }
    }
    .variant-selector {
      width: 20px;
      color: $secondary-color-30;
      font-size: 1.1em;
      margin-bottom: 3px;
      &.out-stock {
        font-size: 0.8em;
        width: fit-content;
        white-space: nowrap;
        color: $secondary-color-50;
      }
    }
  }
}
.variant-images {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 55px;
  margin-bottom: 16px;
  width: 100%;
  overflow-x: auto;
  &::-webkit-scrollbar {
    background: 0 0 !important;
    display: none;
    width: 0 !important;
  }
  .variant-image-wrapper {
    min-width: 50px;
    max-width: 50px;
    height: 50px;
    padding: 2px;
    border: 3px solid $secondary-color-20;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      height: 100%;
      aspect-ratio: 1/1;
      object-fit: cover;
      background: $secondary-color-20;
      border-radius: 50%;
      overflow: hidden;
    }
  }
}
.variant-information {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  .variant-info {
    display: flex;
    flex-direction: column;
    &.right {
      justify-content: flex-end;
      align-items: flex-end;
      text-align: right;
    }
    .variant-info-label {
      text-transform: uppercase;
      font-weight: 700;
      font-size: 0.8em;
      color: $secondary-color-50;
    }
  }
}
</style>