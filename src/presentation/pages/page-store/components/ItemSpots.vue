<template>
  <div class="item-spot-wrapper" :class="{'stretched': isStretched}">
    <img v-if="spot.images.length > 0" class="spot-bg-image" :src="spot.images[0].image" />
    <div class="spot-area">
      <div :style="spot.pos" class="spot-pin" @click="showSpot(spot.id)">
        <span class="spot-icon material-icons">error</span>
      </div>
      <div class="spot-popup" :style="spot.pos" v-if="showSpotId == spot.id">
        <div @click="closeSpotPopup" class="close-spot-popup">&#x2715;</div>
        <div class="spot-details">
          <div class="spot-brand">
            {{ spot.brandNames }}
          </div>
          <div class="spot-name">
            {{ spot.name }}
          </div>
          <div class="spot-price">
            <span v-if="spot.promoPrice > 0">{{
              currency(spot.promoPrice)
            }}</span>
            <span v-else>{{ currency(spot.price) }}</span>
            <router-link class="spot-link" :to="getProductLink(spot)">See Details</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
export default {
  mixins: [utility],
  props: {
    spot: {
      type: Object,
      default: () => {}
    },
    isStretched: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showSpotId: null,
      img: "https://cdn.shopify.com/s/files/1/0563/9634/9489/files/IMG_8146.jpg?v=1739952940",
      spots: [],
    };
  },
  created() {
    const products = this.$store.getters.getProducts;
    let spots = products?.filter((p) => !isEmpty(p.custom?.hotSpotLocation));
    if (spots) {
      spots = spots.filter((p) => {
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
    this.spots = spots;
  },

  methods: {
    closeSpotPopup() {
      this.showSpotId = null;
    },
    showSpot(id) {
      this.showSpotId = id;
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
};
</script>

<style scoped lang="scss">
.item-spot-wrapper {
  position: relative;
  width: 100%;
  border-radius: 20px;
  padding: 0px;
  &.stretched {
    height: 100%;
    .spot-bg-image {
      height: 100%;
      aspect-ratio: auto !important;
    }
  }
}
.spot-bg-image {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 20px;
}

.item-spot {
  position: absolute;
  text-decoration: none;
  color: #555;
  font-weight: bold;
  font-size: 17px;
}
span.spot-icon.material-icons {
  font-size: 28px;
  color: red;
}
.spot-area {
  &:hover .spot-popup {
    display: flex !important;
  }
}

.spot-label {
  background-color: #fff;
  padding: 3px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.spot-pin {
  cursor: pointer;
  width: 35px;
  height: 35px;
  position: absolute;
}

.spot-brand {
  text-align: left;
  color: $main-red;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-weight: bold;
}

.spot-name {
  font-size: 15px;
  margin-top: 6px;
  text-align: left;
  line-height: 22px;
}

.spot-price {
  font-size: 18px;
  line-height: 28px;
  margin-top: 7px;
  text-align: left;
  font-family: 'Berthold Akzidenz Grotesk Medium';
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.spot-popup {
  position: absolute;
  top: calc(100% - 83%);
  left: 8px;
  background-color: #fff;
  margin: 0 auto;
  width: auto;
  min-width: 200px;
  border-radius: 15px;
  overflow: hidden;
  padding: 20px;
  padding-top: 49px;
  z-index: 100;
  display: flex;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  img {
    width: 75px;
    aspect-ratio: 1/1;
    object-fit: contain;
    float: left;
    margin-right: 16px;
    margin-left: 0;
  }
}

a.spot-link {
  height: 34px;
  display: flex;
  align-items: center;
  background-color: $primary-color-60;
  color: #fff;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  text-decoration: none;
  font-family: 'Berthold Akzidenz Grotesk Medium';
  white-space: nowrap;
}

.close-spot-popup {
  position: absolute;
  right: 10px;
  cursor: pointer;
  top: 3px;
  font-weight: bold;
}

@media (min-width: 672px) {
  .item-spot-wrapper {
    float: left;
    padding: 0px !important;
  }
}
</style>
