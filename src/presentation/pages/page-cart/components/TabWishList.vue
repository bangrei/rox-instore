<template>
  <div :class="['wishlist-con', {'empty': !wishList.length && !isFetching}]">
    <h3 v-if="isFetching">&nbsp;</h3>
    <h3 v-else>Wishlist ({{ wishList.length }} items)</h3>
    <div class="favorites-con">
      <div class="shimmer-item" v-for="index in shimmerArray" :key="index">
        <div class="shimmer-image"></div>
        <div class="shimmer-content">
          <div class="shimmer-subtitle"></div>
          <div class="shimmer-title"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-button"></div>
        </div>
      </div>
      <div class="favorite-item" v-for="prd in wishList" :key="prd.id">
        <img :src="prd.imageDisplay" :alt="prd.name" @click="goPageDetails(prd)">
        <div class="favorite-info">
          <div class="favorite-brands">
            <span class="brand-name">{{ prd.brandNames }}</span>
            <i class="material-icons" @click="removeFromWishlist(prd)">close</i>
          </div>
          <span class="favorite-name">{{ prd.name }}</span>
          <span class="favorite-variant" v-if="prd.favoriteVariant">{{ prd.favoriteVariant.name }}</span>
          <span class="price-tag">{{ currency(prd.price) }}</span>
          <button type="button" 
            :class="['add-btn', {'selected': isInCart(prd), 'processing': prd.processing}]" 
            @click="addToCart(prd)">
            {{ prd.inCart ? 'Added to Cart' : 'Add to Cart' }} 
            <i class="material-icons-outlined btn-icon">{{ isInCart(prd) ? 'check' : 'shopping_cart' }}</i>
          </button>
        </div>
      </div>
    </div>
    <div class="empty-con">
      <div class="empty-content">
        <i class="material-icons-outlined empty-icon">favorite</i>
        <span class="empty-content-header">Your wishlist is empty</span>
        <small>But doesn’t have to be. Add items by clicking on the heart as you browse around.</small>
        <router-link
          to="/shop"
          type="button"
          class="shop-btn"
          >Shop Now</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { unFavorite, getInventory } from "@/connector/v4/productConnector";
import { isEmpty } from "lodash";
import { productService } from "@/bloc/services";
export default {
  name: "TabWishList",
  data() {
    return {
      wishList: [],
      isFetching: true,
    }
  },
  mixins: [utility],
  computed: {
    shimmerArray(){
      if(!this.isFetching) return [];
      return Array.from({length: 8}).map((_, index) => ({index}));
    }
  },
  methods: {
    isInCart(prd) {
      if (prd.processing) return false;
      let parent = this.$store.getters.getCarts;
      let carts = [];
      for(let k in parent){
        carts = [...carts, ...parent[k]];
      }
      return carts.find((c) => {
        if (prd.favoriteVariant) return c.product.id == prd.id && c.variant.id == prd.favoriteVariant.id;
        return c.product.id == prd.id;
      });
    },
    goPageDetails(prd) {
      let inCart = this.isInCart(prd);
      if (inCart) {
        return this.$emit('edit-cart', inCart);
      }
      let outletCode = this.getOutletCode();
      let names = prd.name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        ?.map((it) => {
          if (it.toUpperCase() == it) return it;
          return it.toLowerCase();
        });
      this.goToWithParams("ProductDetails", {
        outlet: outletCode,
        productId: prd.id,
        productName: names.join("-"),
      });
    },
    getProductImage(product) {
      let images = product.images;
      let img = product.imageId;
      if (!img) img = product.image2Id;
      if (!img) img = product.image3Id;
      if (product.favoriteVariant && product.favoriteVariant.images) {
        images = product.favoriteVariant.images;
        images.sort((a, b) => a.sortIndex - b.sortIndex);
      } else if (!isEmpty(product.variants)) {
        let variant = product.variants[0];
        if (!isEmpty(variant.images)) {
          images = variant.images;
        }
      }
      if (!isEmpty(images)) {
        images.sort((a, b) => a.sortIndex - b.sortIndex);
        img = images[0].id;
      }
      if (!img) return require("@/assets/images/rox-logo-2025.jpeg");
      return this.$store.getters.cloudinaryURL + img + "?width=250";
    },
    async fetchWishList() {
      try {
        let products = this.$store.getters.getProducts;
        let items = this.$store.getters.getFavorites;
        let prdIds = products?.map((p) => p.id);
        if (items.length > 0) {
          let availableItems = items.filter((it) => prdIds.includes(it.product));
          let unavailableItems = items.filter((it) => !prdIds.includes(it.product));
          items = availableItems.map((it) => {
            let prd = products.find((p) => p.id == it.product);
            let variants = prd.variants;
            prd.favoriteVariant = variants?.find((v) => v.id == it.variant);
            prd.imageDisplay = this.getProductImage(prd);
            prd.brandNames = prd.brands?.map((br) => br.name)?.join(' | ');
            let one = {
              ...prd,
              available: true,
              id: it.product,
              time: it.time,
              processing: false,
            }
            return one;
          });
          let executedIds = [];
          const fetchPrd = async () => {
            const it = unavailableItems.find((it) => !executedIds.includes(it.product));
            if(!it){
              items.sort((a, b) => b.time - a.time);
              return;
            }
            executedIds.push(it.product);
            const json = await productService.retrieveProductsList({
              pageNumber: 0,
              pageSize: 1,
              productId: it.product
            });
            if(json?.products?.length) {
              const newProducts = json?.products.map((prd) => {
                prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                let variants = prd.variants;
                prd.favoriteVariant = variants?.find((v) => v.id == it.variant);
                prd.imageDisplay = this.getProductImage(prd);
                prd.brandNames = prd.brands?.map((br) => br.name)?.join(' | ');
                return prd;
              })
              items = [
                ...items, 
                ...newProducts.map((prd) => {
                  let one = {
                    ...prd,
                    available: true,
                    id: it.product,
                    time: it.time,
                    processing: false,
                  }
                  return one;
                })
              ];
              products = [...products, ...newProducts];
              this.$store.dispatch('setProducts', products);
            }
            await fetchPrd();
          }
          await fetchPrd();
        }
        this.wishList = items;
        this.$emit('loaded', this.wishList);
      } finally {
        this.isFetching = false;
      }
    },
    getProductLink(prd) {
			let names = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
				if (it.toUpperCase() == it) return it;
				return it.toLowerCase();
			});
			return `/product/${prd.id}/${names.join('-')}`;
    },
    async removeFromWishlist(prd) {
      let id = prd.id;
      let variantId = prd.favoriteVariant?.id;
      const res = await unFavorite(id, variantId);
      if (!res.success) return this.showNotification("warning", "error_outline", `Something went wrong! ${res.message}`);
      this.$store.dispatch("unFavorite", {
        product: id,
        variant: variantId
      });
      this.fetchWishList();
    },
    getCartIndex(carts){
      if(isEmpty(carts)) return 0;
      let cartId = 0;
      carts.forEach((cart) => { 
          if(cart.id > cartId) cartId = cart.id;
      });
      return cartId;
    },
    async addToCart(prd) {
      if (this.isInCart(prd)) return;
      let index = this.wishList.findIndex((it) => {
        if (prd.favoriteVariant) return it.id == prd.id && it.favoriteVariant.id == prd.favoriteVariant.id;
        return it.id == prd.id;
      });
      if (index == -1) return;
      let inventory = null;
      let brandCode = prd.brand;
      let favoriteVariant = prd.favoriteVariant;
      let outlets = this.$store.getters.getOutlets.filter((o) => o.stores?.filter((s) => s.brandCode == brandCode).length > 0);
      if (!outlets) {
        this.showNotification("alert", "error_outline", `We are so sorry, this product is currently unavailable in any outlets`);
        return;
      }
      let outletIndex = 0;
      const findStock = async (outlet) => {
        this.wishList[index].processing = true;
        let outletCode = outlet?.apiCode;
        let res = await getInventory(outletCode, prd.id);
        if (res.success) {
          inventory = res.inventories.find((inv) => inv.product.id == prd.id && inv.stock > 0);
          if (favoriteVariant) {
            inventory = res.inventories.find((inv) => inv.variant?.id == prd.favoriteVariant.id && inv.stock > 0);
          } else {
            let findHasVariant = res.inventories.find((inv) => !isEmpty(inv.variant) && inv.stock > 0);
            if (findHasVariant) {
              inventory = findHasVariant;
              favoriteVariant = inventory.variant;
            }
          }
          let maxQty = inventory ? inventory.stock : 0;
          if (maxQty <= 0) {
            inventory = null;
          }
        }
        outletIndex++;
        if (!inventory && outletIndex < outlets.length) {
          await findStock(outlets[outletIndex]);
        }
      }
      await findStock(outlets[outletIndex]);
      if (!inventory) {
        this.wishList[index].processing = false;
        this.showNotification("alert", "error_outline", `We are so sorry, this product is currently unavailable`);
        return;
      }
      let self = this;
      let price = prd.price;
      if (favoriteVariant) {
        price = favoriteVariant.price;
        if (favoriteVariant.promoPrice > 0) {
          price = favoriteVariant.promoPrice;
        }
      }
      let product = JSON.parse(JSON.stringify(prd));
      let outletStore = this.$store.getters.getOutlets.find((ou) => {
        return ou.stores?.filter((os) => os.id == inventory.store.id)
      });
      let hq = this.$store.getters.getHeadquarter;
      let brand = hq.headquarter.brand.find((b) => b.apiCode == inventory.store.brandCode);
      outletStore.brand = brand;
      let parent = this.$store.getters.getCarts || {};
      let carts = [];
      for(let k in parent){
        carts = [...carts, ...parent[k]];
      }
      let tempCart = {
        outletStore: outletStore,
        id: self.getCartIndex(carts) + 1,
        showEdit: false,
        product: product,
        quantity: 1,
        variant: favoriteVariant,
        modifierGroups: [],
        price: price,
        accPrice: price,
        specialInstructions: "",
        modifiers: [],
        storeName: inventory.store.name,
        storeId: inventory.store.id,
        inventory: inventory,
        processing: true,
        freeProduct: "",
        checked: true,
      };
      carts.push(tempCart);
      
      this.$emit('update-cart', carts, false, () => {
        self.wishList[index].processing = false;
      }, () => {
        carts.pop();
        self.$store.dispatch("setCarts", parent);
        self.$emit('update-cart', carts, true, () => {}, () => {});
        self.wishList[index].processing = false;
      });
    }
  },
  created() {
    this.fetchWishList();
  }
}
</script>

<style scoped lang="scss">
.shimmer-item {
  width: 100%;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid $secondary-color-20;
  background: $white;
  .shimmer-image {
    width: 80px;
    min-width: 80px;
    aspect-ratio: 1/1;
    background: $secondary-color-20;
  }
  .shimmer-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    .shimmer-subtitle {
      width: 35%;
      height: 12px;
      background: $secondary-color-20;
    }
    .shimmer-title {
      width: 100%;
      height: 20px;
      background: $secondary-color-20;
    }
    .shimmer-text {
      width: 20%;
      height: 20px;
      background: $secondary-color-20;
    }
    .shimmer-button {
      width: 25%;
      height: 35px;
      border-radius: 999px;
      background: $secondary-color-20;
      margin-left: auto;
    }
  }
}
.wishlist-con {
  width: 100%;
  height: 100%;
  padding-inline: 20px;
  h3 {
    text-align: left;
    padding-block: 24px;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-weight: normal;
  }
  &.empty {
    height: 100%;
    max-width: 100% !important;
    .empty-con {
      width: 100%;
      height: 100%;
      display: flex !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}
.favorites-con {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.favorite-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid $secondary-color-20;
  background: $white;
  img {
    min-width: 80px;
    max-width: 80px;
    aspect-ratio: 1/1;
    object-fit: cover;
    cursor: pointer;
  }
  .favorite-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    .favorite-brands {
      display: flex;
      justify-content: space-between;
      width: 100%;
      .brand-name {
        color: $main-red;
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        text-transform: uppercase;
        font-size: 12px;
      }
      .material-icons {
        font-size: 1.2em;
        cursor: pointer;
        color: $secondary-color-70;
        &:hover {
          color: $secondary-color-100;
        }
      }
    }
    .favorite-name {
      color: $secondary-color-80;
      font-size: 1em;
    }
    .favorite-variant {
      color: $info-light;
    }
    .price-tag {
      font-weight: bold;
      font-size: 1.2em;
      margin-top: 8px;
    }
    .add-btn {
      padding: 4px 12px;
      outline: none;
      border-radius: 24px;
      border: 1px solid $secondary-color-70;
      color: $secondary-color-70;
      font-size: 0.9em;
      font-weight: bold;
      cursor: pointer;
      background: $white;
      width: fit-content;
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      &:not(.selected):hover {
        border: 1px solid $secondary-color-100;
        color: $secondary-color-100;
      }
      &:is(.selected) {
        border-color: transparent;
        color: $success-green;
        pointer-events: none;
        line-height: 1;
        font-size: 0.8em;
        .btn-icon {
          font-size: 1.4em;
          line-height: 1;
          margin-bottom: 3px;
        }
      }
      &.processing {
        position: relative;
        overflow: hidden;
        color: $secondary-color-50 !important;
        border-color: $secondary-color-50 !important;
        .btn-icon {
          color: $secondary-color-50 !important;
        }
        &::before {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 3px;
          width: 100%;
          background: $secondary-color-20;
          content: "";
          z-index: 1;
        }
        &::after {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 3px;
          background: $success-green;
          content: "";
          z-index: 2;
          transition: all 1s;
          -webkit-transition: all 1s;
          animation: processingAnim 1s ease-in-out infinite;
          -webkit-animation: processingAnim 1s ease-in-out infinite;
        }
      }
      .btn-icon {
        font-size: 1em;
      }
    }
  }
}
@keyframes processingAnim {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
@-webkit-keyframes processingAnim {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
.empty-con {
  display: none;
}
.empty-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  .empty-icon {
    font-size: 2.2em;
    color: $secondary-color-70;
  }
  .empty-content-header {
    white-space: nowrap;
    font-weight: bold;
    font-size: 24px;
    color: $dark-color-1;
    font-family: "Berthold Akzidenz Grotesk Medium";
  }
  small {
    color: $dark-color-1;
    font-size: 15px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0px;
  }
  .shop-btn {
    padding: 10px 24px;
    border-radius: 24px;
    border: none;
    color: $white;
    cursor: pointer;
    background: $main-red;
    text-decoration: none;
    outline: none;
    font-size: 17px;
    line-height: 26px;
    font-weight: bold;
    letter-spacing: 0px;
  }
  .continue-shopping {
    font-size: 0.9em;
    font-weight: bold;
    color: $main-red;
    text-decoration: none;
    cursor: pointer;
    padding-bottom: 24px;
  }
}
@media (min-width: 672px) {
  .wishlist-con {
    padding-inline: 0;
  }
  .favorites-con {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
    gap: 20px;
  }
}
</style>
