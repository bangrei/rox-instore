<template>
  <div :class="['cart-item', {'display-only': displayOnly, 'freeze': cart.freeProduct}]">
    <div class="cart-wrapper">
      <div @click="editCart(cart)"
        :class="['cart-product', { 'no-image': !getCartImage(cart) }]"
      >
        <!-- <base-custom-checkbox
          :isChecked="cart.checked == true"
          @toggle-checkbox="toogleCart"
        />
        <img
          :class="cart.product.imageSize"
          v-if="cart.product.imageDisplay"
          :src="cart.product.imageDisplay"
        /> -->
        <img :src="getCartImage(cart)"/>
      </div>
      <div class="cart-info">
        <div class="cart-info-wrapper">
          <router-link :to="productLink" class="cart-info-details">
            <div class="cart-category">
              {{ cart.outletStore?.brand?.name }}
            </div>
            <div class="cart-name">{{ cart.product.name }}</div>
          </router-link>
          <i class="material-icons" v-if="!displayOnly && !cart.freeProduct" @click="toggleModal">close</i>
        </div>
        <div class="cart-actions" v-if="cart.freeProduct">
          <div class="free-product">
            {{ cartQty }}x free item(s)
          </div>
        </div>
        <div class="cart-modifiers" v-if="(hasVariant() || hasModifiers())">
          <span v-if="hasVariant()">{{ getVariant() }}</span>
          <span
            :class="{
              separator: hasVariant() && hasModifiers(),
            }"
          ></span>
          <span>{{ getModifiers() }}</span>
        </div>
        <div :class="['product-price-wrapper', {'flex-between': displayOnly}]">
          <span v-if="displayOnly">{{ loading ? 'loading...' : 'x' }}{{ loading ? '' : cartQty }}</span>
          <div class="product-price-content" v-if="!cart.freeProduct">
            <div class="original-price" v-if="hasPromoPrice()">
              {{ hasPromoPrice() }}
            </div>
            <div class="cart-price">{{ currency(cartPrice) }}</div>
          </div>
        </div>
        <div class="cart-qty-select" 
          data-label="Variant" v-if="(hasVariant()) && !cart.freeProduct && !displayOnly">
          <select name="cart-variant" v-model="variantId">
            <option v-for="v in variantsList" :value="v.id" :key="v.id">{{ v.name }}</option>
          </select>
        </div>
        <div :class="['cart-qty-input', {'loading': loading}]" data-label="Quantity" v-if="!cart.freeProduct && !displayOnly">
          <input type="number" min="1" :max="maxQty" v-model="cartQty"/>
          <!-- <select name="cart-qty" v-model="cartQty">
            <option v-for="mq in maxQtyOptions" :value="mq.value" :key="mq.key">{{ mq.value }}</option>
          </select> -->
        </div>
        <div class="cart-edit-buttons" v-if="!displayOnly && !cart.freeProduct">
          <button type="button" v-if="isStockAvailable" class="edit-button" @click="editCart(cart)">Edit</button>
          <button type="button" v-if="isFavoriteProduct(cart.product.id)"
            class="edit-button disabled" 
            @click="toggleWishlist">
            Wishlist <i class="material-icons favorite">favorite</i>
          </button>
          <button type="button" v-else class="edit-button" 
            @click="toggleWishlist">Move To Wishlist <i class="material-icons">favorite</i>
          </button>
        </div>
      </div>
    </div>
    <small class="empty-stock" v-if="!isStockAvailable && !cart.freeProduct">This product is unavailable at the moment. Remove this product to continue.</small>

    <base-modal :show="showModal" :smallSize="true">
      <template v-slot:body>
        <span style="margin-top: 24px;">Are you sure to remove this product?</span>
        <div class="action-footer">
          <button type="button" class="action-btn lite" @click="toggleModal()">Cancel</button>
          <button type="button" class="action-btn"  @click="removeCart()">Remove</button>
        </div>
      </template>
    </base-modal>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
import { addFavorite, unFavorite, getInventory } from "@/connector/v4/productConnector";
import { isEmpty, debounce } from "lodash";
import moment from 'moment-timezone';
export default {
  name: "CartItem",
  props: {
    cart: {
      type: Object,
      default: () => {},
    },
    carts: {
      type: Array,
      default: () => [],
    },
    isDesktop: {
      type: Boolean,
      default: false,
    },
    displayOnly: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [utility],
  data() {
    return {
      cartQty: 1,
      prevQty: 1,
      allowChangeQty: false,
      maxQty: 1,
      inventory: null,
      loading: true,
      showModal: false,
      variantId: null,
      modifierGroups: [],
    };
  },
  watch: {
    cartQty: {
      handler: debounce(function(val){
        if(!this.enabledInventory || this.isFnBProduct) return;
        if(val > this.maxQty) {
          this.cartQty = this.prevQty;
          this.showNotification("warning", "error_outline", `Exceeded the max. available stock is not allowed!`);
          return;
        }
        this.prevQty = val;
        this.changeQty(val);
      }, 500),
      immediate: false,
    },
    async variantId() {
      this.$emit('change-variant', this.cart, this.variant, this.inventory);
    },
    cart: {
      handler(){
        //
      },
      deep: true
    }
  },
  computed: {
    isStockAvailable() {
      if(this.isFnBProduct) return true;
      if(!this.enabledInventory) return true;
      let stock = this.cart?.inventory?.stock || 0;
      return stock > 0

    },
    variantsList() {
      if(this.isFnBProduct){
        return this.cart.product.variants?.filter((v) => v.id == this.cart.variant?.id);
      }
      return this.cart.product.variants;
    },
    variant() {
      if (!this.variantId) return;
      return this.variantsList.find((it) => it.id == this.variantId);
    },
    productLink() {
      let cart = this.cart;
      if (cart.freeProduct) {
        let otherCart = this.carts.find((c) => {
          return c.product.id == cart.product.id && c.id !== cart.id;
        });
        if (!isEmpty(otherCart)) {
          cart = otherCart;
        }
      }
      let product = cart.product;
      let productSlugs = this.slugName(product.name);
      let variant = cart.variant;
      if (!isEmpty(variant)) {
        productSlugs = [productSlugs, this.slugName(variant.name)].join('-');
      }
      return `/product/${product.id}/${productSlugs}`;
    },
    cartPrice() {
      let prd = this.cart.product;
      let price = prd.price;
      if (prd.promoPrice > 0) price = prd.promoPrice;
      if (!isEmpty(this.variant)) {
        price = this.variant.price;
        if (this.variant.promoPrice > 0) price = this.variant.promoPrice;
      }
      if(this.cart.modifiers.length > 0){
        this.cart.modifiers.forEach((mod) => {
          price += mod.price * mod.quantity;
        })
      }
      return price;
    },
    isFnBProduct(){
      if(!this.cart) return false;
      let brand = this.collectBrandsList().find((b) => b.apiCode == this.cart.product.brand);
      if(!brand) return false;
      return brand.type == "FOOD";
    },
    enabledInventory(){
      return this.isInventoryEnabled(this.cart.product.brand);
    }
  },
  methods: {
    toggleModal() {
      this.showModal = !this.showModal;
    },
    editCart() {
      if(this.cart.freeProduct) return;
      this.$store.dispatch("setCartProductEdit", this.cart.id);
      this.$router.push(this.productLink);
    },
    toogleCart() {
      this.$emit('toggle-cart');
    },
    hasPromoPrice() {
      let products = this.$store.getters.getProducts || [];
      let prd = products.find((it) => it.id == this.cart.product.id);
      if (!prd) return null;
      if (this.hasVariant()) {
        if (this.cart.variant.promoPrice > 0) return this.currency(this.cart.variant.price);
      }
      if (prd.promoPrice > 0 && prd.price !== prd.originalPrice)
        return this.currency(prd.originalPrice);
      return null;
    },
    hasVariant() {
      return !isEmpty(this.cart.variant);
    },
    getVariant() {
      return this.cart.variant.name;
    },
    hasModifiers() {
      return !isEmpty(this.cart.modifiers);
    },
    getModifiers() {
      let modifiers = [];
      if (!isEmpty(this.cart.modifiers)) {
        this.cart.modifiers.forEach((mod) => {
          modifiers.push(`${mod.quantity}x ${mod.name || mod.modifierName}`);
        });
      }
      return modifiers.join(", ");
    },
    async changeQty(qty) {
      this.allowChangeQty = false;
      await this.$emit('change-qty', qty, this.cart, (cart) => {
        this.cartQty = cart.quantity;
      });
      this.allowChangeQty = true;
    },
    removeCart() {
      this.showModal = false;
      this.$emit('remove-cart', this.cart);
    },
    async plusCart() {
      this.$emit('plus', this.cart, (cart) => {
        this.cartQty = cart.quantity
      });
    },
    async minusCart() {
      this.$emit('minus', this.cart, (cart) => {
        this.cartQty = cart.quantity
      });
    },
    async toggleWishlist() {
      let isFavorite = this.isFavoriteProduct(this.cart.product.id, this.cart.variant?.id);
      let id = this.cart.product.id;
      if (isFavorite) {
        const res = await unFavorite(id, this.cart.variant?.id);
        if (res.success) return this.showNotification("warning", "error_outline", `Something went wrong! ${res.message}`);
        this.$store.dispatch("unFavorite", {
          product: id,
          variant: this.cart.variant?.id
        });
        return;
      }
      const res = await addFavorite(id, this.cart.variant?.id);
      if(!res.success) return this.showNotification("warning", "error_outline", res.message);
      this.$store.dispatch("addFavorite", {
        product: id,
        variant: this.cart.variant?.id,
        time: parseInt(moment().format('x'))
      });
    }
  },
  async created() {
    try {
      this.allowChangeQty = false;
      this.variantId = this.cart.variant ? this.cart.variant.id : null;
      if(this.enabledInventory){
        let res = await getInventory(this.cart.outletStore.apiCode, this.cart.product.id);
        if (res?.success) {
          this.inventory = res.inventories.find((inv) => inv.store.id == this.cart.storeId);
          if(this.variant) this.inventory = res.inventories.find((inv) => inv.variant?.id == this.variant.id);
          this.maxQty = this.enabledInventory ? this.inventory?.stock || 0 : this.cart.quantity;
        }
      }
      this.cartQty = this.cart.quantity;
      this.$emit('cart-inventory', this.cart, this.inventory);
    } finally {
      this.allowChangeQty = true;
      this.loading = false;
    }
  },
};
</script>
<style scoped lang="scss">
.empty-stock {
  color: $main-red;
}
.cart-edit-buttons {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-block: 12px;
  .edit-button {
    border: 1px solid #525252;
    font-family: 'Berthold Akzidenz Grotesk Medium';
    outline: none;
    padding: 8px 14px;
    border-radius: 24px;
    height: 34px;
    background: $white;
    font-size: 13px;
    line-height: 1;
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 6px;
    cursor: pointer;
    color: #525252;
    &.disabled {
      pointer-events: none;
      background: transparent;
      border-color: transparent;
      color: $success-green;
      padding-inline: 0 !important;
    }
    .material-icons {
      font-size: 13px !important;
      &.favorite {
        color: $main-red;
      }
    }
  }
}
.close-btn {
  cursor: pointer;
  color: $secondary-color-60;
}
.action-footer {
  padding: 24px;
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}
.action-btn {
  width: 100%;
  padding: 6px 16px;
  background: $main-red;
  border: none;
  outline: none;
  color: $white;
  align-items: center;
  justify-content: center;
  border-radius: 32px;
  cursor: pointer;
  text-align: center;
  &.lite {
    background-color: transparent !important;
    color: $main-red !important;
  }
}
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
    font-weight: bold;
    color: $secondary-color-70;
    white-space: normal !important;
  }
  &.checked {
    .checkbox-icon,
    .checkbox-label {
      color: $main-red !important;
    }
  }
}
.cart-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
  &.freeze {
    pointer-events: none !important;
  }
  &.display-only {
    padding-bottom: 0px !important;
    .cart-info-details,
    .cart-modifiers {
      font-size: 0.8em !important;
    }
    .product-price-wrapper {
      font-size: 15px;
      line-height: 22px;
      letter-spacing: 0px;
      font-weight: 400;
      color: $dark-color-1;
      align-items: baseline;
      &.flex-between {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
    .product-price-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 15px;
      line-height: 22px;
      letter-spacing: 0px;
    }
    .cart-product img {
      max-width: 108px !important;
      min-width: 108px !important;
    }
  }

  & + .cart-item {
    padding-top: 16px;
    border-top: 1px solid $secondary-color-10;
  }

  .cart-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .cart-product {
      overflow: hidden;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      height: fit-content;
      flex: 1;
      max-width: 200px;
      min-width: 120px;

      img {
        object-fit: contain;
      }
    }

    .cart-info {
      display: flex;
      flex-direction: column;
      flex: 2;
      gap: 4px;
      .cart-info-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 4px;
        text-align: left;
        text-decoration: none;
      }
      .cart-info-wrapper {
        width: 100%;
        display: flex;
        gap: 24px;
        justify-content: space-between;
        .material-icons {
          color: $secondary-color-60;
          cursor: pointer;
        }
      }
      .cart-category {
        color: $main-red;
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        font-size: 12px;
        line-height: 14px;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }
      .cart-name {
        font-size: 15px;
        line-height: 22px;
        letter-spacing: 0px;
        font-weight: 400;
        color: $dark-color-1;
      }
      .cart-modifiers {
        width: 100%;
        color: $dark-color-3;
        text-align: left;
        font-size: 15px;
        line-height: 22px;
        letter-spacing: 0px;

        .separator {
          content: "";
          width: 5px;
          height: 5px;
          background: $dark-color-3;
          border-radius: 50%;
          display: inline-block;
          margin: 0 6px;
        }
      }
    }
  }

  .cart-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    .cart-buttons {
      display: flex;
      gap: 16px;
      align-items: center;

      .cart-increment {
        cursor: pointer;
        padding: 4px;
        background: $secondary-color-90;
        color: $white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
    }
  }
}
.cart-qty-select {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: $secondary-color-10;
  border-bottom: 2px solid $secondary-color-30;
  padding-top: 25px;
  padding-bottom: 4px;
  &::before {
    content: attr(data-label);
    text-align: left;
    font-size: 0.9em;
    color: $secondary-color-70;
    width: 100%;
    position: absolute;
    top: 4px;
    left: 8px;
    pointer-events: none;
  }
  select {
    padding-inline: 4px;
    width: 100%;
    outline: none;
    border-color: transparent;
    background: transparent;
  }
}
.cart-qty-input {
  // max-width: 100px;
  width: 100%;
  position: relative;
  &::before {
    content: "Quantity";
    text-align: left;
    font-size: 0.9em;
    color: $secondary-color-70;
    width: 100%;
    position: absolute;
    top: 4px;
    left: 8px;
    pointer-events: none;
  }
  input {
    padding-top: 25px;
    padding-inline: 8px;
    width: 100%;
    outline: none;
    background: $secondary-color-10;
    border-color: transparent;
    border-bottom-color: $secondary-color-30;
    appearance: textfield;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &:focus{
      background: $secondary-color-20;
      border-bottom-color: $secondary-color-40;
    }
  }
  &.loading {
    input {
      color: transparent !important;
    }
    &::after {
      content: "Loading...";
      position: absolute;
      z-index: 10;
      left: 8px;
      bottom: 0px;
      font-size: 0.9em;
      font-family: 'Berthold Akzidenz Grotesk Medium';
    }
  }
}
@media (min-width: 672px) {
  .cart-wrapper {
    flex-direction: row !important;
  }
}
</style>
