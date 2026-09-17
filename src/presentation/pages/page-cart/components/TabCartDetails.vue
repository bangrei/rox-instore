<template>
  <div :class="['cart-details', {'disabled': !ableToCheckout}]">
    <div class="cart-details-wrapper">
      <div class="cart-wishlist">
        <button class="wishlist-btn" type="button" @click="addMoreProducts">
          Add More Products from Wishlist
          <i class="material-icons">favorite</i>
        </button>
      </div>
      <div class="cart-offer">
        <widget-voucher ref="cartVoucherWidget" />
        <widget-promo-code @emit-promocode="emitPromoCode" />
      </div>
      <!-- <Widget-fulfillment-display @change-address="changeAddress" /> -->
      <div class="cart-sum">
        <base-accordion ref="orderSummary" accordionTitle="Your Order Summary" :noBorder="true">
          <div class="cart-sum-body">
            <div class="cart-sum-item">
              <div class="cart-sum-item-label">Subtotal</div>
              <div class="cart-sum-item-label">{{ subTotalDisplay }}</div>
            </div>
            <div
              class="cart-sum-item"
              v-for="extra in extraCharges"
              :key="extra.name"
            >
              <div class="cart-sum-item-label">
                {{ extra.name }}
                {{ extra.percentage ? "(" + extra.percentage + "%)" : "" }}
              </div>
              <div class="cart-sum-item-label">
                {{ currency(extra.amount) }}
              </div>
            </div>
            <div
              class="cart-sum-item"
              v-for="extra in groupedOutletExtraCharges"
              :key="extra.displayName"
            >
              <div class="cart-sum-item-label">{{ extra.displayName }}</div>
              <div class="cart-sum-item-label">
                {{ currency(extra.amount) }}
              </div>
            </div>
            <div
              class="cart-sum-item"
              v-for="disc in groupedDiscounts"
              :key="disc.id"
            >
              <div
                class="cart-sum-disc-icon"
                v-if="disc.promotion || disc.voucher"
                @click="removeDiscount(disc)"
              >
                <span 
                  class="material-icons-outlined spinning"
                  v-if="removingDiscount && removingDiscount == disc.voucher">data_saver_off</span>
                <span v-else class="material-icons-outlined">highlight_off</span>
              </div>
              <div class="cart-sum-disc-label">
                {{
                  disc && !disc.promotion && !disc.voucher
                    ? "Points"
                    : disc.reason
                }}
              </div>
              <div class="cart-sum-disc-label nowrap">
                -{{ currency(disc.amount) }}
              </div>
            </div>
            <div
              class="cart-sum-item"
              v-for="disc in groupedDiscountsPerBrand"
              :key="disc.discount.reason"
            >
              <div
                class="cart-sum-disc-icon"
                v-if="disc.discount.promotion || disc.discount.voucher"
                @click="removeDiscount(disc.discount)"
              >
                <span 
                  class="material-icons-outlined spinning"
                  v-if="removingDiscount && removingDiscount == disc.discount.reason">data_saver_off</span>
                <span v-else class="material-icons-outlined">highlight_off</span>
              </div>
              <div class="cart-sum-disc-label">
                {{
                  disc &&
                  !disc.discount &&
                  !disc.discount.promotion &&
                  !disc.discount.voucher
                    ? "Points"
                    : disc.discount.reason
                }}
              </div>
              <div class="cart-sum-disc-label nowrap">
                -{{ currency(disc.discount.amount) }}
              </div>
            </div>
            <div
              class="cart-sum-item"
              v-for="extra in groupedDeliveryCharges"
              :key="extra.displayName"
            >
              <div class="cart-sum-item-label">{{ extra.displayName }}</div>
              <div class="cart-sum-item-label">
                {{ currency(extra.amount) }}
              </div>
            </div>
            <div
              class="cart-sum-item"
              v-for="disc in groupedDeliveryDiscounts"
              :key="disc.id"
            >
              <div
                class="cart-sum-disc-icon"
                v-if="disc.promotion || disc.voucher"
                @click="removeDiscount(disc)"
              >
                <span 
                  class="material-icons-outlined spinning"
                  v-if="removingDiscount && removingDiscount == disc.voucher">data_saver_off</span>
                <span v-else class="material-icons-outlined">highlight_off</span>
              </div>
              <div class="cart-sum-disc-label">
                {{
                  disc && !disc.promotion && !disc.voucher
                    ? "Points"
                    : disc.reason
                }}
              </div>
              <div class="cart-sum-disc-label nowrap">
                -{{ currency(disc.amount) }}
              </div>
            </div>
            <div
              class="cart-sum-item"
              v-for="disc in groupedDeliveryDiscountsPerBrand"
              :key="disc.discount.reason"
            >
              <div
                class="cart-sum-disc-icon"
                v-if="disc.discount.promotion || disc.discount.voucher"
                @click="removeDiscount(disc.discount)"
              >
                <span 
                  class="material-icons-outlined spinning"
                  v-if="removingDiscount && removingDiscount == disc.discount.reason">data_saver_off</span>
                <span v-else class="material-icons-outlined">highlight_off</span>
              </div>
              <div class="cart-sum-disc-label">
                {{
                  disc &&
                  !disc.discount &&
                  !disc.discount.promotion &&
                  !disc.discount.voucher
                    ? "Points"
                    : disc.discount.reason
                }}
              </div>
              <div class="cart-sum-disc-label nowrap">
                -{{ currency(disc.discount.amount) }}
              </div>
            </div>
            <div class="cart-sum-item">
              <div class="cart-sum-item-label">Order Total</div>
              <div class="cart-sum-item-label">{{ totalDisplay }}</div>
            </div>
          </div>
        </base-accordion>
      </div>
      <div class="cart-total-info">
        <div class="cart-total-label">Total Amount</div>
        <div class="cart-toal-label">{{ totalDisplay }}</div>
      </div>
    </div>
    <div class="cart-details-checkout">
      <button type="button" :class="['checkout-btn', {'disabled': !ableToCheckout}]" 
        @click="checkout()">
        Checkout ({{ cartsCount }})
      </button>
      <div :class="['express-checkout', {'disabled': !ableToCheckout}]">
        <span class="express-checkout-headnote">Express Checkout</span>
        <img :src="require('@/assets/images/express-checkout-button.png')"/>
        <span class="express-checkout-footnote">
          Once selected, your payment method will open.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
// import WidgetFulfillmentDisplay from "@/components/widgets/WidgetFulfillmentDisplay.vue";
import WidgetPromoCode from "@/components/widgets/WidgetPromoCode.vue";
import WidgetVoucher from "@/components/widgets/WidgetVoucher.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
  name: "TabCartDetails",
  components: {
    WidgetVoucher,
    WidgetPromoCode,
    // WidgetFulfillmentDisplay,
  },
  mixins: [utility],
  props: {
    totalAmount: {
      type: Number,
      default: 0
    },
    subTotalAmount: {
      type: Number,
      default: 0,
    },
    totalUnselected: {
      type: Number,
      default: 0,
    },
    cartsCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
      promoCode: "",
      outletsList: [],
      removingDiscount: ""
    };
  },
  computed: {
    ableToCheckout() {
      return this.cartsCount > 0;
    },
    totalDisplay() {
      if (!this.ableToCheckout) return 0;
      let total = this.totalAmount;
      if (total) return this.currency(total);
      return 0;
    },
    subTotalDisplay() {
      if (!this.ableToCheckout) return 0;
      let subTotal = this.subTotalAmount;
      if (subTotal) return this.currency(subTotal);
      return 0;
    },
    extraCharges() {
      if (this.cartsCount <= 0) return [];
      let parent = this.$store.getters.getExtraCharges || {};
      let items = [];
      for(let k in parent) items = [...items, ...parent[k]];
      return items;
    },
    outletExtraCharges() {
      if (this.cartsCount <= 0) return [];
      let parentCharges = this.$store.getters.getOutletExtraCharges || {};
      let items = [];
      for(let k in parentCharges){
        items = [...items, ...parentCharges[k]];
      }
      if (isEmpty(items)) return [];
      let extraCharges = [];
      items.forEach((it) => {
        let item = { ...it.extraCharges, ...{ qty: 1 } };
        let displayName = [item.name];
        if (item.percentage) {
          displayName.push(`${item.percentage}%`);
          if (item.inclusive) displayName.push("(incl.)");
          else displayName.push("(excl.)");
        }
        item.displayName = displayName.join(" ");

        let idx = extraCharges.findIndex((x) => {
          return x.displayName == item.displayName;
        });
        if (idx > -1) {
          extraCharges[idx].qty++;
          extraCharges[idx].amount += item.amount;
        } else {
          extraCharges.push(item);
        }
      });

      return extraCharges;
    },
    groupedOutletExtraCharges(){
      return this.getGroupedOutletExtraCharges(false);
    },
    groupedDeliveryCharges(){
      return this.getGroupedOutletExtraCharges(true);
    },
    discounts() {
      if (this.cartsCount <= 0) return [];
      let parent = this.$store.getters.getDiscounts || {};
      let items = [];
      for(let k in parent) items = [...items, ...parent[k]];
      return items;
    },
    discountPerBrand() {
      if (this.cartsCount <= 0) return [];
      let parent = this.$store.getters.getDiscountPerBrand || {};
      let items = [];
      for(let k in parent) items = [...items, ...parent[k]];
      return items;
    },
    groupedDiscounts(){
      return this.getGroupedDiscounts(false);
    },
    groupedDeliveryDiscounts(){
      return this.getGroupedDiscounts(true);
    },
    groupedDiscountsPerBrand(){
      return this.getGroupedDiscountsPerBrand(false);
    },
    groupedDeliveryDiscountsPerBrand(){
      return this.getGroupedDiscountsPerBrand(true);
    },
    appliedPromoCodes() {
      if (this.cartsCount <= 0) return [];
      let parent = this.$store.getters.getPromoCodes || {};
      let items = [];
      for(let k in parent) items = [...items, ...parent[k]];
      return items;
    },
  },
  methods: {
    getGroupedDiscounts(isDelivery){
      let discs = !isEmpty(this.discounts) ? JSON.parse(JSON.stringify(this.discounts)) : [];
      let groups = [];
      for(let i = 0; i < discs.length; i++){
        let disc = discs[i];
        let ix = groups.findIndex((it) => it.reason == disc.reason);
        if(ix > -1) {
          groups[ix].amount += parseFloat(disc.amount)
        } else {
          groups.push(disc);
        }
      }
      if(isDelivery) return groups.filter((g) => g.discountOnDelivery);
      return groups.filter((g) => !g.discountOnDelivery);
    },
    getGroupedDiscountsPerBrand(isDelivery){
      let discs = !isEmpty(this.discountPerBrand) ? JSON.parse(JSON.stringify(this.discountPerBrand)) : [];
      let groups = [];
      for(let i = 0; i < discs.length; i++){
        let disc = discs[i];
        let ix = groups.findIndex((it) => it.discount?.reason == disc.discount?.reason);
        if(ix > -1) {
          groups[ix].discount.amount += parseFloat(disc.discount.amount)
        } else {
          groups.push(disc);
        }
      }
      if(isDelivery) return groups.filter((g) => g.discount.discountOnDelivery);
      return groups.filter((g) => !g.discount.discountOnDelivery);
    },
    getGroupedOutletExtraCharges(isDeliveryCharge){
      let outletExtraCharges = this.outletExtraCharges;
      let extras = !isEmpty(outletExtraCharges) ? JSON.parse(JSON.stringify(outletExtraCharges)) : [];
      let groups = [];
      if(isDeliveryCharge && !isEmpty(extras)){
        extras = extras.filter((e) => e.type == "DELIVERY_CHARGE")
      } else if(!isDeliveryCharge && !isEmpty(extras)){
        extras = extras.filter((e) => e.type != "DELIVERY_CHARGE")
      }
      for(let i = 0; i < extras.length; i++){
        let extra = extras[i];
        let ix = groups.findIndex((it) => it.displayName == extra.displayName);
        if(ix > -1){
          groups[ix].amount += parseFloat(extra.amount);
        } else {
          groups.push(extra);
        }
      }
      return groups;
    },
    async changeAddress() {
      let self = this;
      let callback =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : () => {};
      let address =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : () => null;
      this.$store.dispatch("setDeliveryAddress", address);
      let parentCarts = this.$store.getters.getCarts || {};
      for(let outletCode in parentCarts){
        let outletCarts = parentCarts[outletCode] || [];
        await this.testOrder(
          false,
          function (json) {
            callback(json);
          },
          function (error) {
            self.$store.dispatch("setDeliveryAddress", null);
            if (error.message)
              self.showNotification(
                "alert",
                "error_outline",
                `Something went wrong! ${error.message}`
              );
            callback(error);
          },
          true,
          true,
          outletCarts,
          outletCode
        );
      }
    },
    async removeVoucher(disc) {
      let parentCarts = this.$store.getters.getCarts || {};
      let outletCodes = Object.keys(parentCarts);
      let removedIndex = 0;
      this.removingDiscount = disc.voucher;
      const removeOne = async () => {
        let appliedVc = this.$store.getters.getAppliedVouchers || {};
        let cashVc = this.$store.getters.getAppliedCashVouchers || {};
        let outletCode = outletCodes[removedIndex];
        let outletCarts = parentCarts[outletCode] || [];
        let vcs = appliedVc[outletCode] || [];
        let vcash = cashVc[outletCode] || [];
        let voucher = vcs.find((it) => {
          return it.id == disc.voucher;
        });
        if (!voucher) {
          voucher = vcash.find((it) => {
            return it.id == disc.voucher;
          });
        }
        if (!voucher) {
          this.removingDiscount = "";
          return;
        }
        let payload = {
          voucherId: voucher.id,
          key: outletCode
        }
        if (voucher.isCashVoucher) {
          this.$store.dispatch("removeAppliedCashVoucher", payload);
        } else {
          this.$store.dispatch("removeAppliedVoucherOutlet", payload);
        }
        let self = this;
        await this.testOrder(
          false,
          function () {
            if(removedIndex == outletCodes.length - 1) {
              self.removingDiscount = "";
              return self.showNotification(
                "success",
                "error_outline",
                `Voucher has been removed!`
              );
            }
            removedIndex++;
            removeOne();
          },
          function (error) {
            self.showNotification(
              "alert",
              "error_outline",
              `Something went wrong! ${error.message}`
            );
            if(removedIndex == outletCodes.length - 1) {
              self.removingDiscount = "";
              return
            }
            removedIndex++;
            if (voucher.isCashVoucher) {
              self.$store.dispatch("addAppliedCashVouchers", voucher);
            } else {
              self.$store.dispatch("addAppliedCashVouchers", voucher);
            }
            removeOne();
          },
          true,
          true,
          outletCarts,
          outletCode
        );
        self.$refs['cartVoucherWidget'].initAppliedVouchers();
      }
      removeOne();
    },
    checkout() {
      if (!this.isLoggedIn()) {
        return this.$router.push({
          path: '/login',
          query: {
            redirect: `/cart`,
            reinit: true
          }
        });
      }
      /*
      if (this.isOrderOmisell()) {
        let address = this.$store.getters.getDeliveryAddress;
        if(isEmpty(address)) return this.showNotification("alert", "error_outline", "Delivery address is required!");
      }
      */
      this.goTo('CheckoutPage');
    },
    removeDiscount(disc) {
      if (isEmpty(disc)) return;
      if (disc.voucher) return this.removeVoucher(disc);
      this.removingDiscount = disc.reason;
      let reason = disc.reason.split(" ");
      let code = !isEmpty(reason) ? reason[reason.length - 1] : "";
      let promoCodes = this.$store.getters.getPromoCodes || {};
      for(let k in promoCodes){
        promoCodes[k] = promoCodes[k].filter((it) => it != code);
      }
      this.$store.dispatch("setPromoCodes", promoCodes);
      this.executePromo(code);
    },
    async executePromo(removeCode, showAlert = true) {
      let self = this;
      let callback =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let parentCarts = this.$store.getters.getCarts || {};
      let keys = Object.keys(parentCarts);
      let errors = {};
      let success = {};
      await Promise.all(keys.map((key) => {
        if(removeCode){
          let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
          if(!removedPromocodes[key]) removedPromocodes[key] = [];
          removedPromocodes[key].push(removeCode);
          this.$store.dispatch("setAutoPromocodes", removedPromocodes);
        }
        return self.testOrder(false, (json) => {
          if(!json?.success) {
            errors[key] = json;
            return;
          }
          success[key] = json;
        }, (error) => {
          errors[key] = error;
        }, false, true, parentCarts[key], key)
      }));
      this.removingDiscount = "";
      self.emitCarts();

      let errorKeys = Object.keys(errors);
      let successKeys = Object.keys(success);
      let outlets = self.$store.getters.getOutlets;
      if(errorKeys.length > 0){
        let errorMessages = "";
        for(let code in errors){
          const error = errors[code];
          let oneOutlet = outlets.find((it) => it.apiCode == code);
          let promoCodes = self.$store.getters.getPromoCodes || {};
          if(promoCodes[code] && !isEmpty(promoCodes[code])){
            promoCodes[code] = promoCodes[code].filter((it) => {
              return it != self.promoCode;
            });
          }
          if(removeCode){
            let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
            if(removedPromocodes[code]) {
              removedPromocodes[code] = removedPromocodes[code].filter((rm) => rm != removeCode);
            }
            self.$store.dispatch("setAutoPromocodes", removedPromocodes);
          }
          errorMessages += `Unable to apply on outlet ${oneOutlet?.name}. ${error.message || ""}`;
          self.$store.dispatch("setPromoCodes", promoCodes);
        }
        if (showAlert) {
          self.showNotification(
            "alert",
            "error_outline",
            `${errorMessages || "Something went wrong!"}`
          );
        }
        let error = {
          ...errors[errorKeys[0]],
          ...{message: errorMessages}
        };
        callback(error);
      }
      if(successKeys.length > 0){
        for(let code in success){
          let oneOutlet = outlets.find((it) => it.apiCode == code);
          if (removeCode) {
            if (showAlert){
              self.showNotification(
                "success",
                "error_outline",
                `${removeCode} has been removed from outlet ${oneOutlet?.name}`
              );
            }
            return;
          }
          if (showAlert){
            self.showNotification(
              "success",
              "error_outline",
              `${self.promoCode} has been applied on outlet ${oneOutlet?.name}`
            );
          }
        }
        callback(success[successKeys[0]]);
      }
      self.promoCode = "";
    },
    emitCarts(){
      let parent = this.$store.getters.getCarts || {};
      let carts = [];
      for(let k in parent){
        carts = [...carts, ...parent[k]];
      }
      this.$emit('update-cart', carts, true);
    },
    async emitPromoCode(currentPromocode, promoCodes, callbackEmit) {
      let self = this;
      self.promoCode = currentPromocode;
      let parent = self.$store.getters.getCarts;
      let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
      for(let k in parent){
        if(removedPromocodes[k]) {
          removedPromocodes[k] = removedPromocodes[k].filter((rm) => rm != currentPromocode);
        }
      }
      self.$store.dispatch("setAutoPromocodes", removedPromocodes);
      await self.executePromo(
        null, false,
        (json) => {
          let msg = `${currentPromocode} has been applied`;
          let icon = "success";
          if (!json.success) {
            icon = "alert";
            let errors = json.errors || {};
            msg = json.message;
            promoCodes.pop();
            promoCodes = self.$store.getters.getPromoCodes || {};
            for(let k in errors){
              if(promoCodes[k] && !isEmpty(promoCodes[k])){
                promoCodes[k] = promoCodes[k].filter((it) => it != currentPromocode);
              }
            }
            for(let n in promoCodes){
              promoCodes[n] = promoCodes[n].filter((it) => it != currentPromocode);
            }
            self.$store.dispatch("setPromoCodes", promoCodes);
            self.executePromo(currentPromocode, false);
            self.showNotification(icon, "error_outline", msg);
            callbackEmit();
            return;
          }
          self.promoCode = "";
          self.showNotification(icon, "error_outline", msg);
          callbackEmit();
        }
      );
    },
    addMoreProducts() {
      this.$emit('add-more-products');
    }
  },
  async created() {
    setTimeout(() => {
      this.$refs.orderSummary.isClosed = true;
    }, 0);
  }
};
</script>
<style scoped lang="scss">
.cart-details {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
  &.disabled {
    pointer-events: none;
    opacity: 0.5;
  }
  .cart-details-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: $white;
    border: 1px solid $secondary-color-20;
    border-color: $secondary-color-20;
  }
  .cart-details-checkout {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: $white;
    border: 1px solid $secondary-color-20;
    border-color: transparent;
    padding: 24px;
  }
  .cart-total-info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
    padding: 24px;
    border-top: 1px solid $secondary-color-20;
    font-weight: normal;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 1.2em;
  }
}
.express-checkout {
  padding: 32px 24px;
  border-radius: 12px;
  border: 1px solid $secondary-color-20;
  position: relative;
  aspect-ratio: 5/1;
  .express-checkout-headnote {
    font-size: 1em;
    color: $secondary-color-70;
    padding-inline: 8px;
    width: fit-content;
    margin-inline: auto;
    position: absolute;
    top: -10px;
    background: $white;
    left: 0;
    right: 0;
  }
  img {
    height: 45px;
    margin-inline: auto;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
  .express-checkout-footnote {
    font-size: 0.8em;
    color: $secondary-color-70;
    padding-inline: 8px;
    width: fit-content;
    margin-inline: auto;
    position: absolute;
    bottom: -10px;
    background: $white;
    left: 0;
    right: 0;
  }
}
.cart-wishlist {
  padding: 24px;
  border-bottom: 1px solid $secondary-color-20;
  .wishlist-btn {
    padding-block: 12px;
    padding-inline: 24px;
    border-radius: 24px;
    white-space: nowrap;
    border: 1px solid $main-red;
    outline: none;
    background: $white;
    font-weight: normal;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    color: $main-red;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    font-size: 0.9em;
    cursor: pointer;
    line-height: 1;
    &:hover {
      background: $secondary-color-10;
    }
    .material-icons {
      font-size: 1em !important;
      line-height: 1;
    }
  }
}
.cart-sum {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid $secondary-color-20;
  padding-inline: 24px;
  .cart-sum-body {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .cart-sum-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      text-align: left;

      &.bold {
        font-weight: bold;
      }
      .cart-sum-total-label {
        font-family: "Berthold Akzidenz Grotesk Medium";
        color: $secondary-color-90;
        font-weight: bold;
      }
      .cart-sum-subtotal-label {
        color: $secondary-color-60;
        font-weight: bold;
      }

      .cart-sum-disc-label {
        font-weight: bold;
        color: $success-green;
        width: 100%;

        &.nowrap {
          white-space: nowrap;
          text-align: right;
        }
      }
      .cart-sum-disc-icon {
        cursor: pointer;
        color: $main-red;
      }
    }
  }
}
.cart-offer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-inline: 24px;
}
.checkout-btn {
  width: 100%;
  padding: 12px 16px;
  background: $main-red;
  border: none;
  outline: none;
  color: $white;
  align-items: center;
  justify-content: center;
  border-radius: 32px;
  font-family: "Berthold Akzidenz Grotesk Medium";
  cursor: pointer;
  text-align: center;
  box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
  &.disabled {
    pointer-events: none;
    background-color: $secondary-color-20 !important;
    color: $secondary-color-50 !important;
  }
}
@media (min-width: 672px) {
  .cart-details-checkout {
    border-radius: 12px;
    border: 1px solid $secondary-color-20;
    border-color: $secondary-color-20 !important;
  }
  .cart-details-wrapper {
    border-radius: 12px;
    border: 1px solid $secondary-color-20;
    border-color: $secondary-color-20;
  }
}
</style>

