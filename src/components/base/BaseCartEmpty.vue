<template>
  <div class="empty-content">
    <i class="material-icons-outlined empty-icon">shopping_cart</i>
    <span class="empty-content-header">Looks like your cart is empty</span>
    <small v-if="!isLoggedIn()"
      >If you have an account, please log in to see items you
      previously added.</small
    >
    <router-link
      to="/login"
      v-if="!isLoggedIn()"
      type="button"
      class="cart-login-btn"
      >Log In</router-link
    >
    <router-link 
      to="/shop/fnb" 
      :class="{'continue-shopping': !isLoggedIn(), 'cart-login-btn': isLoggedIn()}">
      Continue Shopping
    </router-link>
  </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
export default {
  data() {
    return {};
  },
  mixins: [utility],
  computed: {
    shopLink() {
      let outletCode = this.getOutletCode();
      return `/shop/${outletCode}`;
    },
  },
};
</script>
<style scoped lang="scss">
.empty-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  .empty-icon {
    font-size: 53px;
    color: $dark-color-1;
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
  .cart-login-btn {
    padding: 10px 32px;
    border-radius: 24px;
    border: none;
    color: $white;
    cursor: pointer;
    background: $primary-color-60;
    text-decoration: none;
    outline: none;
    font-size: 17px;
    line-height: 26px;
    font-family: "Berthold Akzidenz Grotesk Medium";
    letter-spacing: 0px;
    margin-top: 12px;
  }
  .continue-shopping {
    font-size: 17px;
    line-height: 26px;
    font-family: "Berthold Akzidenz Grotesk Medium";
    letter-spacing: 0px;
    color: $primary-color-60;
    text-decoration: none;
    cursor: pointer;
    margin-top: 12px;
    padding-bottom: 32px;
  }
}
</style>
