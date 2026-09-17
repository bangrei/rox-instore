<template>
  <div :class="['cart-page', {'empty-cart': isEmpty(validCarts) && !loading}]">
    <div class="cart-container">
      <div class="cart-header">
        <h1 v-if="!loading">Cart ({{ validCarts.length }} item{{ validCarts.length > 1 ? 's' : '' }})</h1>
        <h1 v-else>&nbsp;</h1>
        <div class="cart-select-remove" v-if="!isEmpty(validCarts) && !loading">
          <base-custom-checkbox
            :isChecked="selectAll" 
            :label="'Select All (' + validCarts.length + ')'"
            @toggle-checkbox="toggleSelectAll"
          />
          <span class="remove-all" @click="removeAll">
            Remove All <i class="material-icons-outlined">remove_shopping_cart</i>
          </span>
        </div>
      </div>
      <div class="cart-body">
        <div class="cart-items">
          <div class="shimmer-item" v-for="index in shimmerArray" :key="index">
            <div class="shimmer-image"></div>
            <div class="shimmer-content">
              <div class="shimmer-subtitle"></div>
              <div class="shimmer-title"></div>
              <div class="shimmer-text"></div>
              <div class="shimmer-button"></div>
            </div>
          </div>
          <div class="cart-outlet" v-for="(ou, ix) in outletsList" :key="ou.key">
            <base-custom-checkbox
              :isChecked="ou.checked == true" 
              :label="ou.name"
              @toggle-checkbox="toggleCartOutlet(ix)"
            />
            <div class="cart-item-row" v-for="(cart, cx) in ou.carts" :key="cart.key">
              <base-custom-checkbox v-if="!cart.freeProduct"
                :isChecked="cart.checked == true" 
                @toggle-checkbox="toggleCart(cx, ix)"
              />
              <div v-else style="width: 32px;"></div>
              <CartItem
                :cart="cart"
                :carts="validCarts"
                @cart-inventory="setCartInventory"
                @change-qty="updateQty"
                @change-variant="changeVariant"
                @remove-cart="removeCart"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="empty-con" v-if="isEmpty(carts) && !loading">
      <base-cart-empty/>
    </div>
  </div>
</template>

<script>
import { getTransactionalPoints } from "@/connector/v4/customerConnector";
import { getPromotions } from "@/connector/v4/storeConnector.js";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import CartItem from "./CartItem.vue";
import { productService } from "@/bloc/services";

export default {
  name: "TabCart",
  components: {
    CartItem,
  },
  mixins: [utility],
  data() {
    return {
      loading: true,
      carts: [],
      processing: false,
      promoCode: "",
      isDesktop: true,
      activeTabIndex: 0,
      outletsList: [],
      selectAll: true,
      products: []
    };
  },
  computed: {
    shimmerArray(){
      if(!this.loading) return [];
      return Array.from({length: 3}).map((_, index) => ({index}));
    },
    validCarts() {
      if (isEmpty(this.products)) return [];
      let parentCarts = JSON.parse(JSON.stringify(this.$store.getters.getCarts || {}));
      let carts = [];
      for(let k in parentCarts){
        carts = [...carts, ...parentCarts[k]];
      }
      let outlets = this.$store.getters.getOutlets;
      if (isEmpty(outlets)) return [];
      let storeIds = [];
      for (let i = 0; i < outlets.length; i++){
        storeIds = [...storeIds, ...outlets[i].stores.map((s) => s.id)];
      }
      return carts.filter((c) => {
        if(c.freeProduct) return storeIds.includes(c.storeId);
        return storeIds.includes(c.storeId) && this.products?.map((p) => p.id).includes(c.product.id);
      });
      
    },
    outletsSelection() {
      return this.outletsList.filter((o) => o.checked);
    },
    ableToCheckout() {
      let selections = this.outletsSelection;
      if (selections.length == 0) return false;
      let cartsSelection = selections.filter((o) => {
        return o.carts.filter((c) => c.checked).length > 0;
      });
      return cartsSelection.length > 0;
    },
    total() {
      let orderRequest = this.$store.getters.getOrderRequest;
      if (isEmpty(orderRequest)) return 0;
      return orderRequest.total;
    },
    totalUnselected() {
      let totalUnselected = 0;
      let thisCarts = JSON.parse(JSON.stringify(this.carts?.filter((it) => !it.checked)));
      thisCarts?.forEach((cart) => {
        totalUnselected += cart.accPrice;
      });
      return totalUnselected;
    },
    totalDisplay() {
      let totalAmount = this.total - this.totalUnselected;
      if (totalAmount) return this.currency(totalAmount);
      return 0;
    },
    subTotal() {
      let orderRequest = this.$store.getters.getOrderRequest;
      if (isEmpty(orderRequest)) return 0;
      return orderRequest.subTotal;
    },
    subTotalDisplay() {
      let subtotalAmount = this.subTotal - this.totalUnselected;
      if (subtotalAmount) return this.currency(subtotalAmount);
      return 0;
    },
    extraCharges() {
      return this.$store.getters.getExtraCharges || [];
    },
    outletExtraCharges() {
      let items = this.$store.getters.getOutletExtraCharges || [];
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
    discounts() {
      return this.$store.getters.getDiscounts || [];
    },
    discountPerBrand() {
      return this.$store.getters.getDiscountPerBrand || [];
    },
    appliedPromoCodes() {
      return this.$store.getters.getPromoCodes || [];
    },
  },
  methods: {
    toggleSelectAll() {
      let self = this;
      let originalCarts = JSON.parse(JSON.stringify(this.carts));
      let mappedCarts = this.rebuildCarts(originalCarts);
      let updateCarts = this.carts.map((c) => {
        return {
          ...c,
          checked: !c.checked
        }
      });
      // let skip = updateCarts.filter((c) => c.checked == true).length == 0;
      this.$emit('update-cart', updateCarts, false, () => {
        self.selectAll = !self.selectAll;
        let checked = self.selectAll;
        self.outletsList.forEach((it) => {
          it.checked = checked;
          it.carts.forEach((c) => {
            c.checked = checked;
          });
        });
      }, () => {
        self.$store.dispatch("setCarts", mappedCarts);
      });
    },
    toggleCartOutlet(index) {
      let self = this;
      let originalCarts = JSON.parse(JSON.stringify(this.carts));
      let one = self.outletsList[index];
      let isChecked = !one.checked;
      let updateCarts = this.carts.map((c) => {
        if (c.outletStore?.apiCode == one?.apiCode) {
          c.checked = isChecked;
        }
        return c;
      });
      // let skip = updateCarts.filter((c) => c.checked == true).length == 0;
      this.$emit('update-cart', updateCarts, false, () => {
        let originalCartOutlets = JSON.parse(JSON.stringify(one.carts));
        let carts = originalCartOutlets.map((c) => {
          c.checked = isChecked;
          return c;
        });
        self.outletsList[index] = {
          ...one,
          checked: isChecked,
          carts: carts
        }
      }, () => {
        self.$store.dispatch("setCarts", this.rebuildCarts(originalCarts));
      });
    },
    toggleCart(cartIndex, outletIndex) {
      let self = this;
      let originalCarts = JSON.parse(JSON.stringify(this.carts));
      let one = self.outletsList[outletIndex];
      let originalCartOutlets = JSON.parse(JSON.stringify(one.carts));
      let isChecked = !one.carts[cartIndex].checked;
      let updateCarts = this.carts.map((c) => {
        if (one.carts[cartIndex].id == c.id) c.checked = isChecked;
        return c;
      });
      // let skip = updateCarts.filter((c) => c.checked == true).length == 0;
      this.$emit('update-cart', updateCarts, false, () => {
        let carts = originalCartOutlets.map((c, x) => {
          return {
            ...c,
            checked: x == cartIndex ? isChecked : c.checked
          }
        });
        self.outletsList[outletIndex] = {
          ...one,
          carts: carts
        }
      }, () => {
        self.$store.dispatch("setCarts", this.rebuildCarts(originalCarts));
      });
    },
    async setOutletsList() {
      if (isEmpty(this.carts) || isEmpty(this.products)) {
        this.outletsList = [];
        return;
      }
      let outlets = this.$store.getters.getOutlets;
      // let storeIds = this.carts.map((c) => c.storeId);
      let outletCodes = this.carts.map((c) => c.outletStore?.apiCode);
      this.outletsList = outlets.filter((o) => outletCodes.includes(o.apiCode))?.map((o) => {
        let cartsList = this.carts.filter((c) => {
          if(c.freeProduct) return o.stores.map((s) => s.id).includes(c.storeId);
          return o.stores.map((s) => s.id).includes(c.storeId) && this.products?.map((p) => p.id).includes(c.product.id) && o.stores.map((s) => s.brandCode).includes(c.product.brand)
        });
        return {
          ...o,
          key: Math.random(30),
          checked: true,
          carts: cartsList?.map((crt) => {
            return {
              ...crt,
              key: Math.random(20)
            }
          }),
          isOmisell: o?.enableOmisellIntegration == true && o.stores.filter((s) => s.delivery).length > 0
        }
      });
    },
    cartOutlets() {
      let outletList = this.$store.getters.getOutlets;
      return this.carts.map((cart) => {
        return outletList.find((outlet) => {
          return outlet.stores.filter((s) => s.id == cart.storeId).length > 0;
        });
      });
    },
    checkout() {
      if (!this.isLoggedIn()) {
        return this.$router.push({
          path: "/login",
          query: {
            redirect: `/cart/${this.$route.params.outletCode}/${this.$route.params.cartId}`,
            reinit: true,
          },
        });
      }
      if (this.isOrderOmisell()) {
        let address = this.$store.getters.getDeliveryAddress;
        if (isEmpty(address))
          return this.showNotification(
            "alert",
            "error_outline",
            "Delivery address is required!"
          );
      }
      if (!this.ableToCheckout) return;
      this.$store.dispatch("setCarts", this.rebuildCarts(this.carts));
      this.goTo("CheckoutPage");
    },
    outletByCart(cart) {
      let outletList = this.$store.getters.getOutlets;
      let hq = this.$store.getters.getHeadquarter;
      let outletCart = outletList.find((o) =>
        o.stores.filter((s) => s.id == cart.storeId).length > 0
      );
      if (!outletCart) {
        return cart.outletStore;
      }
      let store = outletCart?.stores?.find((s) => s.id == cart.storeId);
      let brand = hq.headquarter.brand.find(
        (it) => it.apiCode == store?.brandCode
      );
      outletCart = {
        ...outletCart,
        brand: brand,
        isOmisell: outletCart?.enableOmisellIntegration == true && outletCart?.stores.filter((s) => s.delivery).length > 0,
      };
      return outletCart;
    },
    handleCarts(){
      let self = this;
      let carts = this.validCarts;
      carts.map((cart) => self.setCartDisplay(cart));
      self.carts = carts;
    },
    async getCart() {
      let self = this;
      try {
        let products = [];
        let parentCarts = this.$store.getters.getCarts;
        if (isEmpty(parentCarts)) {
          this.outletsList = [];
          this.loading = false;
          self.$emit('cart-loaded', []);
          return;
        }
        for(let k in parentCarts){
          let prds = parentCarts[k] ? parentCarts[k].map((it) => it.product) : []
          products = [...products, ...prds];
        }
        const Ids = products.map((p) => p.id);
        const executedIds = [];
        let productsList = [];
        const fetchPrd = async () => {
          const nextId = Ids.find((id) => !executedIds.includes(id));
          if(!nextId){
            this.products = productsList;
            this.handleCarts();
            return;
          }
          executedIds.push(nextId);
          const json = await productService.retrieveProductsList({
            pageNumber: 0,
            pageSize: products.length || 10,
            brands: products?.map((p) => p.brand),
            productId: nextId
          });
          if(json?.products?.length) {
            productsList = [
              ...productsList, 
              ...json?.products.map((prd) => {
                prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                return prd;
              })
            ];
          }
          await fetchPrd();
        }
        await fetchPrd();

        let discPerBrand = this.$store.getters.getDiscountPerBrand || {};
        let discounts = this.$store.getters.getDiscounts || {};
        if (!isEmpty(discPerBrand)) {
          for(let k in discPerBrand){
            if(!isEmpty(discPerBrand[k])){
              if(!discounts[k]) discounts[k] = [];
              discounts[k] = [
                ...discounts[k],
                ...discPerBrand[k].map((d) => {
                  return d.discount;
                })
              ]
            }
          }
        }

        if (!isEmpty(discounts)) {
          let vouchers = {};
          for(let k in discounts){
            if(!isEmpty(discounts[k])){
              if(!vouchers[k]) vouchers[k] = [];
              vouchers[k] = [
                ...vouchers[k], 
                ...discounts[k].filter((it) => {
                  return it.voucher || it.promotion;
                })
              ]
            }
          }
          if (!isEmpty(vouchers)) {
            const res = await getTransactionalPoints();
            for(let k in vouchers){
              let voucherIds = vouchers[k].map((v) => v.voucher);
              if (res.success && res.customer.vouchers) {
                const resV = res.customer.vouchers;
                resV.forEach((it) => {
                  if (!voucherIds.includes(it.id)) return;
                  it.isCashVoucher = false;
                  it.applied = true;
                  if (it.promotion.publishType) {
                    it.display = {
                      name: it.promotion.name,
                      desc: it.promotion.benefitType
                        .split("_")
                        .join(" ")
                        .toLowerCase(),
                    };
                    self.$store.dispatch("addAppliedVouchers", it);
                  } else {
                    it.isCashVoucher = true;
                    it.display = {
                      name: `${this.currency(it.promotion.amount)} ${
                        it.promotion.name
                      }`,
                      desc: `Cash voucher no. ${it.promotion.number}`,
                    };
                    self.$store.dispatch("addAppliedCashVouchers", it);
                  }
                });
              }
            }
          }
        }
      } finally {
        self.loading = false;
        self.$emit('cart-loaded', self.carts);
        self.setOutletsList();
      }
    },
    async updateQty(qty, cart, callback = undefined) {
      if (!callback) callback = () => { };
      let self = this;
      let cartIndex = self.carts.findIndex((c) => c.id === cart.id);
      let currentCart = self.carts[cartIndex];
      if (qty > currentCart.inventory.stock) {
        self.showNotification(
              "alert",
              "error_outline",
              `We have limited stock. Only ${cart.inventory.stock} pcs left!`
            );
        callback(self.setCartDisplay(currentCart));
        return;
      }
      let oneQty = currentCart.quantity;
      let onePrice = currentCart.price / oneQty;
      self.carts = self.carts.map((c, x) => {
        if (x == cartIndex) {
          return {
            ...c,
            quantity: qty,
            price: onePrice * qty,
            accPrice: onePrice * qty
          }
        }
        return c;
      });
      let parentCarts = self.rebuildCarts(self.carts);
      let outletStore = cart.outletStore;
      let changedCarts = parentCarts[outletStore?.apiCode] || [];
      self.$store.dispatch("setCarts", parentCarts);
      self.processing = true;
      self.testOrder(
        false,
        function () {
          self.processing = false;
          self.setOutletsList();
          callback(self.setCartDisplay(self.carts[cartIndex]));
        },
        function (error) {
          self.processing = false;
          self.carts = self.carts.map((c, x) => {
            if (x == cartIndex) {
              return {
                ...c,
                quantity: oneQty,
                price: onePrice * oneQty,
                accPrice: onePrice * oneQty
              }
            }
            return c;
          });
          self.$store.dispatch("setCarts", self.rebuildCarts(self.carts));
          self.setOutletsList();
          callback(self.setCartDisplay(self.carts[cartIndex]));
          self.showNotification(
            "alert",
            "error_outline",
            `Something went wrong! ${error.message}`
          );
        },
        false,
        true,
        changedCarts,
        outletStore.apiCode
      );
    },
    async removeCart(currentCart, callback = undefined) {
      let self = this;
      if (!callback) callback = () => { };
      if (this.processing) {
        callback(self.setCartDisplay(currentCart));
        return;
      }
      let parentCarts = this.$store.getters.getCarts || {};
      let outletStore = currentCart.outletStore;
      let cartIdx = this.carts.findIndex((cart) => {
        return cart.id == currentCart.id;
      });
      if (cartIdx == -1) {
        callback(self.setCartDisplay(currentCart));
        return
      }
      let countOtherCriteriaProductsInTheCart = 0;
      let promoItems = this.carts.filter((item) => {
        return !isEmpty(item.freeProduct);
      });
      let promoCodesTobeRemoved = [];
      const validatePromotions = async () => {
        let promoItem = promoItems[0];
        promoItems.splice(0, 1);
        let code = this.$store.getters.getOutlets.find((o) => {
          return o.stores.filter((s) => {
            return s.id == promoItem.storeId;
          });
        });
        let res = await getPromotions(code.apiCode);
        let promo = res.success
          ? res.promotions.find((p) => {
              return p.code == promoItem.freeProduct;
            })
          : null;
        if (!isEmpty(promo) && !isEmpty(promo.criteriaProducts)) {
          if (promo.criteriaProducts.includes(currentCart.product.id)) {
            if (!isEmpty(this.carts)) {
              if (!isEmpty(promo.freeProduct)) {
                this.carts.forEach((cart) => {
                  if (
                    promo.criteriaProducts.includes(cart.product.id) &&
                    isEmpty(cart.freeProduct)
                  ) {
                    countOtherCriteriaProductsInTheCart += 1;
                  }
                });
              }
            }
            // dont remove promo code if there any other criteria products in the cart:
            if (countOtherCriteriaProductsInTheCart == 0) {
              promoCodesTobeRemoved.push(promo.code);
              let promoCodes = self.$store.getters.getPromoCodes.filter(
                (cd) => {
                  return cd != promo.code;
                }
              );
              let currentPromocodes = this.$store.getters.getPromoCodes || {};
              this.$store.dispatch("setPromoCodes", {
                ...currentPromocodes,
                [outletStore.apiCode]: promoCodes
              });
            }
          }
        }
        if (!isEmpty(promoItems)) await validatePromotions();
      };
      this.carts.splice(cartIdx, 1);
      // if product is removed, then need to remove free item as well
      if (!isEmpty(promoItems)) await validatePromotions();
      let formattedCarts = !isEmpty(this.carts) ? this.rebuildCarts(this.carts) : {};
      let changedCarts = !isEmpty(formattedCarts) ? formattedCarts[outletStore.apiCode] : [];
      this.$store.dispatch("setCarts", formattedCarts);
      if (isEmpty(this.carts)) {
        this.$store.dispatch("setOrderRequest", {});
        // this.$store.dispatch("setCartId", null);
        this.$store.dispatch("setDiscounts", []);
        this.$store.dispatch("setPromoCodes", []);
        this.$store.dispatch("setDiscountPerBrand", []);
        this.$store.dispatch("setOutletExtraCharges", []);
        this.$store.dispatch("setExtraCharges", []);
      }

      let goProcess = () => {
        this.processing = true;
        this.testOrder(
          false,
          function () {
            self.processing = false;
            parentCarts = self.$store.getters.getCarts;
            let carts = [];
            for(let k in parentCarts) {
              carts = [...carts, ...parentCarts[k]];
            }
            if (!isEmpty(promoCodesTobeRemoved)) {
              carts = carts.filter((c) => {
                return !promoCodesTobeRemoved.includes(c.freeProduct);
              });
            }
            self.carts = carts;
            self.$emit('update-cart', carts, true, () => { }, () => { });
            self.setOutletsList();
            callback(self.setCartDisplay(currentCart));
            let thisOutletCode = self.$route.params.outletCode;
            let cartId = self.$route.params.cartId;
            let cartOutlets = self.cartOutlets().map((co) => {
              return co.apiCode;
            });
            if (!cartOutlets.includes(thisOutletCode)) {
              self.$store.dispatch("setInited", false);
              self.goToWithParams("CartPage", {
                cartId: cartId,
                outletCode: cartOutlets[0],
              });
            }

            // if(isEmpty(self.carts)) self.$store.dispatch("setCartId", null);
          },
          function (error) {
            self.processing = false;
            parentCarts = self.$store.getters.getCarts;
            let carts = [];
            for(let k in parentCarts) {
              carts = [...carts, ...parentCarts[k]];
            }
            if (!isEmpty(carts)) {
              if (!isEmpty(promoCodesTobeRemoved)) {
                carts = carts.filter((c) => {
                  return !promoCodesTobeRemoved.includes(c.freeProduct);
                });
              }
              carts.forEach((cart) => {
                if (cart.id == currentCart.id) {
                  let onePrice = cart.price / cart.quantity;
                  cart.quantity += 1;
                  cart.price = onePrice * cart.quantity;
                  cart.accPrice = onePrice * cart.quantity;
                  currentCart = cart;
                }
              });
            }
            self.carts = carts;
            self.$emit('update-cart', carts, true, () => { }, () => { });
            self.setOutletsList();
            callback(self.setCartDisplay(currentCart));
            if (error.promoCodes) {
              let promoCodes = self.$store.getters.getPromoCodes;
              error.promoCodes.forEach((prm) => {
                let idx = promoCodes.findIndex((cd) => {
                  return cd == prm.code;
                });
                if (idx >= 0) promoCodes.splice(idx, 1);
              });
              let currentPromocode = self.$store.getters.getPromoCodes || {}
              self.$store.dispatch("setPromoCodes", {
                ...currentPromocode,
                [outletStore.apiCode]: promoCodes
              });
              goProcess();
            }
            let mappedCarts = this.rebuildCarts(self.carts);
            self.$store.dispatch("setCarts", mappedCarts);
            if (error.message)
              self.showNotification(
                "alert",
                "error_outline",
                `Something went wrong! ${error.message}`
              );
          },
          false,
          true,
          changedCarts,
          outletStore.apiCode
        );
      };
      goProcess();
    },
    async removeAll() {
      this.$emit('update-cart', [], false, () => {
        this.resetCart();
        this.carts = [];
        this.setOutletsList();
      }, () => { });
    },
    setCartDisplay(cart) {
      cart.outletStore = this.outletByCart(cart);
      cart.checked = cart.checked ? cart.checked : true;
      return cart;
    },
    async executePromo(removeCode, showAlert = true) {
      let self = this;
      let callback =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : function () {};
      let parentPromoCodes = self.$store.getters.getPromoCodes || {};
      for(let outletCode in parentPromoCodes){
        let parentCarts = self.$store.getters.getCarts;
        let carts = parentCarts[outletCode]; 
        await self.testOrder(
          false,
          async function (json) {
            parentCarts = self.$store.getters.getCarts;
            carts = [];
            for(let k in parentCarts){
              carts = [...carts, ...parentCarts[k]];
            }
            let outlets = this.$store.getters.getOutlets;
            if (isEmpty(outlets)) {
              carts = [];
            }
            if (carts.length > 0) {
              carts = carts.filter((c) => {
                return outlets.map((o) => o.apiCode).includes(c.outletStore?.apiCode)
              });
              carts = carts?.map((c) => self.setCartDisplay(c));
            }
            self.carts = carts;
            self.$emit('update-cart', carts, true, () => { }, () => { });
            self.processing = false;
            self.promoCode = "";
            if (removeCode) {
              if (showAlert)
                self.showNotification(
                  "success",
                  "error_outline",
                  `${removeCode} has been removed`
                );
              return;
            }
            if (showAlert)
              self.showNotification(
                "success",
                "error_outline",
                `${self.promoCode} has been applied`
              );
            callback(json);
          },
          function (error) {
            self.processing = false;
            parentPromoCodes[outletCode] = parentPromoCodes[outletCode].filter((it) => {
              return it != self.promoCode;
            });
            self.$store.dispatch("setPromoCodes", parentPromoCodes);
            if (showAlert)
              self.showNotification(
                "alert",
                "error_outline",
                `Something went wrong! ${error.message}`
              );
            callback(error);
          },
          false,
          true,
          carts,
          outletCode
        );
      }
    },
    hasPromoPrice(cart) {
      let products = this.$store.getters.getProducts || [];
      let prd = products.find((it) => it.id == cart.product.id);
      if (!prd) return null;
      if (prd.promoPrice > 0 && prd.price !== prd.originalPrice)
        return this.currency(prd.originalPrice);
      return null;
    },
    setCartInventory(cart, inventory) {
      let index = this.carts.findIndex((c) => c.id == cart.id);
      this.carts[index].inventory = inventory;
      this.$store.dispatch("setCarts", this.rebuildCarts(this.carts));
    },
    async changeVariant(cart, selectedVariant, inv) {
      let self = this;
      let cartIndex = self.carts.findIndex((it) => it.id == cart.id);
      if (selectedVariant.id == self.carts[cartIndex].variant.id) return;
      let price = selectedVariant.price;
      if (selectedVariant.promoPrice > 0) price = selectedVariant.promoPrice;
      self.carts[cartIndex] = {
        ...cart,
        variant: selectedVariant,
        modifiers: [],
        modifierGroups: selectedVariant.modifierGroups,
        price: price * cart.quantity,
        accPrice: price * cart.quantity,
        inventory: inv,
      }
      let parentCarts = self.rebuildCarts(self.carts);
      let outletStore = cart.outletStore;
      let changedCarts = parentCarts[outletStore?.apiCode] || [];
      self.$store.dispatch("setCarts", parentCarts);
      self.processing = true;
      
      self.testOrder(
        false,
        function () {
          self.processing = false;
          self.$emit('update-cart', self.carts, true, () => { }, () => { });
          self.setOutletsList();
        },
        function (error) {
          self.processing = false;
          self.carts[cartIndex] = cart;
          self.setOutletsList();
          self.$emit('update-cart', self.carts, true, () => { }, () => { });
          self.showNotification(
            "alert",
            "error_outline",
            `Something went wrong! ${error.message}`
          );
        },
        false,
        true,
        changedCarts,
        outletStore?.apiCode
      );
    },
    resize(){
      this.isDesktop = window.innerWidth >= 672;
    },
    async initCarts(){
      try {
        await this.getCart();
      } catch (error) {
        this.showNotification("alert", "error_outline", error);
      } finally {
        this.loading = false;
      }
    }
  },
  async created() {
    this.loading = true;
    this.resize();
    window.addEventListener("resize", this.resize);
    if (!this.$store.getters.hasInited) {
      await this.refreshMainData(true);
      this.$store.dispatch("setInited", true);
    }
    await this.initCarts();
  },
  beforeUnmount(){
    window.removeEventListener("resize", this.resize);
  }
};
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
    width: 100%;
    max-width: 200px;
    min-width: 120px;
    aspect-ratio: 5/3;
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
.cart-outlet {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-block: 20px;
  background: $white;
  border: 1px solid $secondary-color-20;
  border-color: transparent;
}
.cart-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  &.empty-cart {
    height: calc(100vh - 250px);
  }
  .empty-con {
    background: $white;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
.free-product {
  color: $secondary-color-50;
  font-size: 0.7em;
  padding: 2px 8px;
  border: 1px solid $secondary-color-20;
  border-radius: 5px;
}
.cart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  h1 {
    font-size: 1.3em;
    text-align: left;
    margin: 0 !important;
  }
}
.cart-header {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding-block: 20px;
  background: $white;
  border-bottom: 1px solid $secondary-color-20;
  white-space: nowrap;
  h1 {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-weight: normal;
  }
  .cart-select-remove {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    white-space: nowrap;
  }
  .remove-all {
    font-size: 0.9em;
    cursor: pointer;
    color: #A855F7;
    font-weight: normal;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    .material-icons,
    .material-icons-outlined {
      font-size: 1em;
    }
  }
}
.cart-body {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  padding-block: 24px;
}
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  .cart-item-row {
    display: flex;
    align-items: flex-start;
  }
}
.cart-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

      & + .cart-sum-item {
        padding-top: 16px;
        border-top: 1px solid $secondary-color-20;
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
.sd-footer {
  height: auto !important;
}
.cart-footer {
  border-top: 1px solid $secondary-color-20;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
}
.cart-total-wrapper {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  font-family: "Berthold Akzidenz Grotesk Medium";

  .total-amount {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon {
      cursor: pointer;
    }
  }
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
  &.disabled {
    pointer-events: none;
    background-color: $secondary-color-20 !important;
    color: $secondary-color-50 !important;
  }
}
.modal-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  &.bordered {
    border-top: 1px solid $secondary-color-10;
    padding: 16px 0;
  }
  .modal-total-label {
    font-family: "Berthold Akzidenz Grotesk Medium";
    color: $secondary-color-90;
    font-weight: bold;
  }
  .modal-subtotal-label {
    color: $secondary-color-60;
    font-weight: bold;
  }

  .modal-disc-label {
    font-weight: bold;
    color: $success-green;
    flex: 3;

    &.nowrap {
      white-space: nowrap;
      flex: unset !important;
    }
  }
  .modal-disc-icon {
    cursor: pointer;
    color: $main-red;
  }
}
.modal-header {
  font-family: "Berthold Akzidenz Grotesk Medium";
  padding: 24px;
}
.promo-info {
  color: $main-red;
}
@media (min-width: 672px) {
  .cart-header {
    padding-bottom: 0 !important;
    background: transparent !important;
    border-bottom-color: transparent !important;
  }
  .cart-body {
    flex-direction: row !important;
    flex: 1;
    .cart-items {
      flex: 3;
    }
    .cart-details {
      flex: 2;
      height: fit-content;
      width: auto;
      display: flex;
      flex-direction: column;
    }
  }
  .cart-outlet {
    padding-inline: 20px;
    border-radius: 10px;
    border-color: $secondary-color-20;
  }
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
  .cart-footer {
    display: none;
  }
  .cart-page {
    .empty-con {
      background: transparent !important;
    }
  }
}
@media (max-width: 821px) {
  .cart-body {
    flex-direction: column !important;
  }
}
</style>

