<template>
  <div class="featured-products">
    <div 
      class="featured-item"
      :class="{'stretched': isStretched(index)}"
      v-for="(spot, index) in spots" 
      :key="spot.id"
    >
      <ItemSpots :spot="spot" :isStretched="isStretched(index)"/>
    </div>
  </div>
</template>
<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
import ItemSpots from "./ItemSpots.vue";
export default {
  name: "FeaturedProducts",
  mixins: [utility],
  props: {
    products: {
      type: Array,
      default: () => []
    }
  },
  components: {
    ItemSpots
  },
  data(){
    return {
      spots: []
    }
  },
  methods: {
    isStretched(index){
      let pos = index + 1;
      let max = 3;
      if(pos > max) {
        if(pos % 4 == 0) return true;
        pos = (index + 1) % max;
      }
      return pos == 2;
    },
    getProductLink(prd) {
      let names = prd.name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        ?.map((it) => {
          if (it.toUpperCase() == it) return it;
          return it.toLowerCase();
        });
      if (!isEmpty(prd.variants)) {
        prd.variants.sort((a, b) => a.sortIndex - b.sortIndex);
        let variant = prd.variants[0];
        if (!isEmpty(prd.cart)) variant = prd.cart.variant;

        let variantSlugs = variant.name
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .split(" ")
          ?.map((it) => {
            if (it.toUpperCase() == it) return it;
            return it.toLowerCase();
          });
        names = [...names, ...variantSlugs];
      }
      return `/product/${prd.id}/${names.join("-")}`;
    },
  },
  created() {
    if(this.products?.length > 0) {
      this.spots = this.products.filter((p) => {
        if(!p.custom?.hotSpotLocation) return false;
        return p.custom?.hotSpotLocation.split('*').length == 2;
      })?.map((it) => {
        let customField = it.custom?.hotSpotLocation;
        let [top, left] = customField.split("*");
        let images = this.defaultProductImages(it);
        let brands = it.brands.map((b) => b.name);
        return {
          ...it,
          pos: {
            top: top,
            left: left
          },
          images: [...images],
          brandNames: brands.join(" | ")
        };
      });
    }
  },
}
</script>
<style scoped lang="scss">
.featured-products {
  width: 100%;
  padding: 24px;
  gap: 20px;
  display: grid;
  grid-template-columns: 48% 48%;
}
.featured-item {
  width: 100%;
}
@media (min-width: 672px){
  .featured-products {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  .featured-item {
    min-width: auto !important;
    min-width: 250px;
    &.stretched {
      grid-row: span 2;
    }
  }
}
</style>