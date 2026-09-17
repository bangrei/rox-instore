<template>
  <div class="products-con">
    <div class="products-wrapper"
      v-if="!isEmpty(currentProducts)"
    >
      <router-link
        :to="getProductLink(prd)"
        class="product router-link"
        :class="{ changing: changing, prepare: !changing }"
        v-for="prd in currentProducts"
        :key="prd.id"
      >
        <div class="overlay" :class="{ 'no-image': prd.images.length == 0 }">
          <span class="cart-marker material-icons-outlined" v-if="prd.cart"
            >assignment_turned_in</span
          >
          <img
            v-if="prd.images.length > 0"
            :src="prd.images[0].image"
            :alt="prd.name"
          />
          <img
            v-else
            :src="require('@/assets/images/rox-logo-2025.jpeg')"
            :alt="prd.name"
          />
        </div>
        <div class="etalase-content">
          <div class="label">{{ prd.brandNames }}</div>
          <div class="sub-label">{{ prd.name }}</div>
          <div class="price-wrapper">
            <span class="promo-price" v-if="hasPromoPrice(prd)">{{
              displayPrice(prd)
            }}</span>
            <span class="price">{{ prdPrice(prd) }}</span>
          </div>
        </div>
      </router-link>
    </div>
    <base-empty-product-state :is-filter="true" v-if="isEmpty(currentProducts) && !loading"/>
  </div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
import { addFavorite, unFavorite } from "@/connector/v4/productConnector";
export default {
  name: "ProductsBrand",
  mixins: [utility],
  props: {
    products: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      zoom: false,
      zoomProduct: "",
      currentProducts: [],
      productSize: 4,
      isDesktop: false,
      changing: false,
    };
  },
  methods: {
    getProductLink(prd) {
      let names = prd.name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        ?.map((it) => {
          if (it.toUpperCase() == it) return it;
          return it.toLowerCase();
        });
      return `/product/${
        prd.id
      }/${names.join("-")}`;
    },
    seeProductDetails(prd) {
      let names = prd.name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        ?.map((it) => {
          if (it.toUpperCase() == it) return it;
          return it.toLowerCase();
        });
      this.$router.push({
        name: "ProductDetails",
        params: {
          productId: prd.id,
          productName: names.join("-"),
          edit: !isEmpty(prd.cart) ? prd.cart.id : null,
        },
      });
    },
    loadMore() {
      this.productSize += 10;
      let newProducts = this.products.slice(
        this.currentProducts.length,
        this.productSize
      );
      if (!isEmpty(newProducts)) {
        this.setupProducts(newProducts).forEach((p) => {
          this.currentProducts.push(p);
        });
        setTimeout(() => {
          this.resizeImageHandler();
        }, 10);
      }
      this.$emit("loadMore");
    },
    finalizeProducts(prd) {
      this.currentProducts = this.setupProducts(prd);
      this.changing = false;
      this.loading = false;
      window.addEventListener("resize", this.resizeImageHandler);
      setTimeout(() => {
        this.changing = true;
        this.resizeImageHandler();
      }, 50);
    },
    setCurrentProducts() {
      if (!isEmpty(this.products)) {
        let categories = this.$store.getters.getCategories.map((n) => {
          return { id: n.id, name: n.name };
        });
        this.products.forEach((it) => {
          let categoriesDisplay = categories
            .filter((n) => {
              return it.categories.indexOf(n.id) > -1;
            })
            .map((n) => {
              return n.name;
            });
          let brands = it.brands.map((b) => b.name);
          it.brandNames = brands.join(" | ");
          it.categoriesDisplay = categoriesDisplay.join(" | ");
          it.favorite = it.favorite || this.isFavorite(it.id);
          it.images = this.getImages(it);
        });
      }
      this.finalizeProducts(this.products);
    },
    isFavorite(productId) {
      return this.isFavoriteProduct(productId);
    },
    async clickFavorite(prd) {
      if (this.isGuestCustomer()) return;
      try {
        let idx = this.currentProducts.findIndex((it) => {
          return it.id == prd.id;
        });
        if (idx == -1) return;
        if (prd.favorite) {
          let res = await unFavorite(prd.id);
          if (!res.success)
            return this.showNotification(
              "warning",
              "error_outline",
              res.message
            );
          this.$store.dispatch("unFavorite", prd.id);
          this.currentProducts[idx].favorite = false;
        } else {
          let res = await addFavorite(prd.id);
          if (!res.success)
            return this.showNotification(
              "warning",
              "error_outline",
              res.message
            );
          this.$store.dispatch("addFavorite", prd.id);
          this.currentProducts[idx].favorite = true;
        }
      } catch (error) {
        this.showNotification("warning", "error_outline", error);
      }
    },
    prdDesc(prd) {
      if (isEmpty(prd.description)) return "";
      return prd.description.substring(0, 20);
    },
    displayPrice(prd) {
      if (isEmpty(prd.variants)) return this.currency(prd.originalPrice);
      let variants = prd.variants.filter((v) => v.promoPrice > 0);
      if (variants.length > 0) {
        return this.currency(variants[0].price)
      }
      return this.currency(prd.originalPrice);
    },
    prdPrice(prd) {
			if (isEmpty(prd.variants)) return this.currency(prd.price);
      let hasVariantPromo = this.hasPromoPrice(prd);
			if (hasVariantPromo) return hasVariantPromo;
			return this.currency(prd.variants[0].price);
		},
		hasPromoPrice(prd) {
			let promoPrice = prd.promoPrice;
			if (!isEmpty(prd.variants)) {
				let variants = prd.variants.filter((v) => v.promoPrice > 0);
				if (variants.length > 0) {
					promoPrice = variants[0].promoPrice;
				}
      }
			if (promoPrice > 0) return this.currency(promoPrice);
			return null;
		},
    getImage(prd) {
      let images = [];
      if (!isEmpty(prd.imageId)) images.push({ id: prd.imageId });
      if (!isEmpty(prd.image2Id)) images.push({ id: prd.image2Id });
      if (!isEmpty(prd.image3Id)) images.push({ id: prd.image3Id });
      if (!isEmpty(prd.images)) {
        images = prd.images;
        images.sort((a, b) => a.sortIndex - b.sortIndex);
      }
      if (isEmpty(images)) return "";
      let image = images[0].id;
      return `${this.$store.getters.cloudinaryURL}${image.id}?width=300`;
    },
    getImages(prd) {
      let images = [];
      if (!isEmpty(prd.imageId))
        images.push({
          sortIndex: 0,
          id: prd.imageId,
          image: `${this.$store.getters.cloudinaryURL}${prd.imageId}`,
        });
      if (!isEmpty(prd.image2Id))
        images.push({
          sortIndex: 1,
          id: prd.image2Id,
          image: `${this.$store.getters.cloudinaryURL}${prd.image2Id}`,
        });
      if (!isEmpty(prd.image3Id))
        images.push({
          sortIndex: 2,
          id: prd.image3Id,
          image: `${this.$store.getters.cloudinaryURL}${prd.image3Id}`,
        });
      if (!isEmpty(prd.images)) {
        images = prd.images.map((im) => {
          return {
            ...im,
            image: `${this.$store.getters.cloudinaryURL}${im.id}`,
          };
        });
        images.sort((a, b) => a.sortIndex - b.sortIndex);
      }
      return images;
    },
  },
  async created() {
    this.loading = true;
    setTimeout(() => {
      this.isDesktop = window.innerWidth >= 672;
      this.productSize = this.isDesktop ? 8 : 4;
      this.setCurrentProducts();
    }, 100);
  },
  beforeUnmount(){
    window.removeEventListener("resize", this.resizeImageHandler);
  }
};
</script>

<style lang="scss">
.router-link {
  text-decoration: none;
}
.empty-products {
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.products-con {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.products-wrapper {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  display: flex;
  gap: 24px;
  overflow: hidden;
  overflow-x: auto;
  .product {
    flex: 1;
    position: relative;
    border: 1px solid $secondary-color-20;
    border-radius: 6px;
    overflow: hidden;
    max-width: 250px;
    min-width: 250px;
    -webkit-animation-duration: 0.3s;
    animation-duration: 0.3s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: fadeInDown;
    animation-name: fadeInDown;
    .overlay {
      width: 100%;
      min-width: 250px;
      max-width: 250px;
      aspect-ratio: 1/1;
    }
    &.prepare {
      opacity: 0;
    }
    &.changing {
      -webkit-animation-duration: 0.3s;
      animation-duration: 0.3s;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
      -webkit-animation-name: fadeInDown;
      animation-name: fadeInDown;
    }
    .overlay {
      width: 100%;
      aspect-ratio: 1/1;
      background: $white;
      overflow: hidden;
      border-radius: 0px;
      position: relative;
      .cart-marker {
        position: absolute;
        top: 8px;
        right: 8px;
        color: $success-green;
      }
      &.no-image {
        background: $secondary-color-10 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        -o-box-shadow: none;
        box-shadow: none;
        background: $primary-color-10 !important;
        &::before {
          content: "";
          background-image: url("@/assets/images/rox-logo-2025.jpeg");
          background-position: center;
          background-repeat: no-repeat;
          width: 75px;
          height: 75px;
          opacity: 0.4;
          background-size: contain;
          color: $secondary-color-50;
        }
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        mix-blend-mode: multiply;
      }
    }
    .etalase-content {
      width: 100%;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }
    .label {
      text-align: left;
      font-size: 12px;
      display: block;
      color: $primary-color-60;
      font-weight: bold;
      text-transform: uppercase;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      line-height: 14px;
    }
    .sub-label {
      text-align: left;
      font-size: 15px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin-top: 8px;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: $secondary-color-80;
      text-overflow: ellipsis;
    }
    .price-wrapper {
      font-size: 18px;
      line-height: 28px;
      text-align: left;
      margin-top: 8px;
      display: flex;
      font-weight: bold;
      align-items: center;
      gap: 10px;
      color: $dark-color-1;
      .promo-price {
        position: relative;
        display: flex;
        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          height: 2px;
          margin: auto;
          background: $primary-color-60;
        }
      }
    }
    .action {
      display: block;
      width: fit-content;
      padding: 8px 18px;
      border-radius: 12px;
      background: $white;
      color: #000;
      font-weight: bold;
      margin: 16px auto;
    }
    .icons {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 6px 0;

      .icon-wrapper {
        display: flex;
        gap: 16px;
        align-items: center;

        * {
          color: $secondary-color-50;

          &.dark {
            color: $secondary-color-90 !important;
          }
          &.favorite {
            color: $primary-color-60 !important;
          }
        }

        .icon-lg {
          font-size: 2em;
        }
      }
    }
  }
}
@media (min-width: 672px) {
  .products-wrapper {
    padding-left: 0 !important;
    .label {
      cursor: pointer;
    }
    .action {
      cursor: pointer;
    }
    .icons {
      .icon-wrapper {
        cursor: pointer;
      }
    }
  }
}
@media (min-width: 672px) and (max-width: 1024px){
  .brand-name,
  .products-wrapper {
    padding-left: 20px !important;
  }
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
