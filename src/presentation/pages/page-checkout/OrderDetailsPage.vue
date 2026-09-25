<template>
  <layout-variant-two :show-loading-screen="loading">
    <template v-slot:body>
      <div class="order-container">
        <div class="order-content">
          <div class="order-info-wrapper">
            <div class="nav" @click="goBack">
              <i class="material-icons">arrow_back</i>
              Order Details
            </div>
						<div :class="['order-info', {'tracker': isDeliveryOrder, 'instore': !isDeliveryOrder}]">
							<div class="order-track" v-if="isDeliveryOrder">
								<div :class="['track-item', {'active' : statusIndex == 1, 'passed': statusIndex > 1}]">
									Order Placed
								</div>
								<div :class="['track-item', {'active' : statusIndex == 2, 'passed': statusIndex > 2}]">
									Waiting fo courier
								</div>
								<div :class="['track-item', {'active' : statusIndex == 3, 'passed': statusIndex > 3}]">
									In Transit
								</div>
								<div :class="['track-item', {'active' : statusIndex == 4, 'passed': statusIndex >= 4}]">
									Completed
								</div>
							</div>
							<div class="order-status-con">
								<p class="order-status-display">{{ orderStatusDisplay }}</p>
								<div class="eta-con">
									<small>{{ isDeliveryOrder ? 'Arrival Estimation' : 'Pickup Instore'}}</small>
									<span>{{ outletEtaDate }}</span>
								</div>
								<div class="order-number-wrapper">
									<span class="number">Invoice {{ orderNumber }}</span>
									<!-- <router-link class="order-link" :to="'/receipt/' + orderNumber">See Invoice</router-link> -->
                  <button class="order-link" @click="toggleShowInvoice">See Invoice</button>
								</div>
								<div class="order-number-wrapper">
									<span>Time Placed</span>
									<span>{{ orderDate }}</span>
								</div>
							</div>
							
						</div>
            <div class="order-info" v-if="!isEmpty(order)">
              <div class="order-card" v-for="(ord, o) in groupedOrders" :key="o">
                <div class="order-info-header">
                  <span class="order-label">Product Details</span>
                  <span class="outlet">
                    {{ ord.outlet?.name || ord.storeName }}
                    <i class="material-icons">chevron_right</i>
                  </span>
                </div>
                <div class="product-wrapper" v-for="(item, i) in ord.items" :key="i">
                  <div class="product">
                    <div class="product-img">
                      <img :src="item.imageDisplay" :alt="item.productName" />
                    </div>
                    <div class="product-info">
                      <span class="product-brand">{{ item.brand.name }}</span>
                      <span class="product-name">{{ item.productName }}</span>
                      <span class="product-variant" v-if="item.variantName">{{
                        item.variantName
                      }}</span>
                      <span class="product-variant" v-if="item.modifierName">{{
                        item.modifierName
                      }}</span>
                      <div class="pricing">
                        <span class="product-qty">{{ item.quantity }}x</span>
                        <span>{{ item.total == 0 && item.promotion ? 'Free item' : currency(item.total) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="product-actions" v-if="!(item.total == 0 && item.promotion)">
                    <span class="buying" v-if="isReordering(item.product)">Processing...</span>
                    <button type="button" :class="['btn-action', {'disabled': isReordering(item.product)}]" @click="buyAgain(item, ord)">Buy Again</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="order-info-wrapper">
            <div class="order-info">
              <div class="order-info-header" style="margin-bottom: 10px">
                <span class="order-label">Fulfillment Info</span>
              </div>
              <div class="item-row">
                <span class="label">Fulfillmeny Option</span>
                <span class="text">{{ orderTypeDisplay }}</span>
              </div>
              <div class="item-row">
                <span class="label">Assigned Store</span>
                <div class="text inline">
                  <span class="text-inline" v-for="(store, sx) in assignedStores" :key="sx">{{ store }}</span>
                </div>
              </div>
              <div class="item-row" v-if="isDeliveryOrder">
                <span class="label">Address</span>
                <span class="text">{{
                  order?.orders[0].storeAddress?.string
                }}</span>
              </div>
              <br />
              <small>
                For any inquiries regarding your order, feel free to reach out
                to us. We're here to help!
              </small>
            </div>
            <div class="order-info">
              <div class="order-info-header">
                <span class="order-label">Payment Summary</span>
              </div>
							<div class="item-row" v-if="!loading" style="margin-top: 16px;">
								<span class="label">Payment</span>
								<span class="text">{{ paidWith }}</span>
							</div>
							<div class="item-row" v-if="!loading">
								<span class="label">Sub total ({{ countItems }} item{{ countItems > 1 ? 's' : '' }})</span>
								<span class="text">{{ currency(order?.subTotal || 0) }}</span>
							</div>
							<div class="item-row" v-for="(extra, x) in groupedExtraCharges" :key="x">
								<span class="label">{{ extra.name }} {{ extra.percentage ? extra.percentage + '%' : '' }} {{ extra.inclusive ? '(inclusive)' : ''}}</span>
								<span class="text">{{ currency(extra.amount) }}</span>
							</div>
							<div class="item-row" v-for="(disc, x) in groupedDiscounts" :key="x">
								<span class="label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</span>
								<span class="text">-{{ currency(disc.amount) }}</span>
							</div>
							<div class="item-row total" v-if="!loading">
								<span class="label">Total ({{ isPaid(order) ? 'Paid' : 'Unpaid' }})</span>
								<span class="text">{{ currency(order?.total || 0) }}</span>
							</div>
            </div>
          </div>
        </div>
				<div class="suggested-content" v-if="!isEmpty(products)">
					<suggested-products :productsList="products" />
				</div>

        <base-modal :show="showInvoice">
          <template v-slot:header>
            <div class="modal-header header-flex justify-between">
              <h3>Invoice</h3>
              <span class="material-icons-outlined close-btn" @click="toggleShowInvoice">close</span>
            </div>
          </template>
          <template v-slot:body>
            <div class="modal-body">
              <div class="loading" v-if="loadingInvoice">Loading...</div>
              <receipt-content v-if="showInvoice"
                :order-number="orderNumber"
                @init-receipt="initInvoice"
              />
            </div>
          </template>
        </base-modal>
      </div>
    </template>
  </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import { getOrder, getInventory } from "@/connector/v4/productConnector";
import SuggestedProducts from "../page-product/components/SuggestedProducts.vue";
import ReceiptContent from "./components/ReceiptContent.vue";
import { productService } from "@/bloc/services";

export default {
  name: "OrderDetailsPage",
  mixins: [utility],
  components: {
		LayoutVariantTwo,
		SuggestedProducts,
    ReceiptContent,
  },
  data() {
    return {
      loading: false,
      orderNumber: null,
      booking: null,
      order: null,
			showCancellation: false,
      reorderingIds: [],
      showInvoice: false,
      loadingInvoice: true
    };
  },
  watch: {},
	computed: {
		paidWith() {
			if (isEmpty(this.order)) return;
			if (isEmpty(this.order.payments)) return this.isDeliveryOrder ? "Cash On Delivery" : "Cash";
			const orderJSON = JSON.parse(JSON.stringify({ ...this.order }));
			let payments = new Set([...orderJSON.payments]);
			let pm = Array.from(payments).filter((value, index, self) =>
				index === self.findIndex((t) => t.trackingId === value.trackingId && t.status === value.status)
			);
      if(isEmpty(pm)) return "Unpaid";
      const card = pm[0].creditCardToken;
      if(!isEmpty(card)){
        let cardNames = [];
        if(pm.paymentDisplay) cardNames.push(pm.paymentDisplay);
        if(card.cardType) cardNames.push(card.cardType)
        if(card.maskedAccountNumber) cardNames.push(`****${card.maskedAccountNumber}`);
        if(cardNames?.length > 0) return cardNames.join(' ');
      }
      if(pm.paymentDisplay) return pm.paymentDisplay;
			return pm[0].type.replaceAll("_", " ");
		},
		products() {
      if (isEmpty(this.order)) return [];
      let products = this.$store.getters.getProducts;
      let prds = [];
      for (let i = 0; i < this.order.orders.length; i++) {
        let items = this.order.orders[i].items;
        for (let n = 0; n < items.length; n++) {
          let prd = products.find(
            (it) => it.id.toString() == items[n].product.toString()
          );
          if (prd) prds.push(prd);
        }
      }
      return prds;
    },
		orderDate() {
			if (isEmpty(this.order)) return "";
			return moment.tz(this.order.placeTime, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
		},
		outletEtaDate(){
			if(isEmpty(this.order)) return "";
			let orders = this.order.orders;
			orders = orders.map((it) => {
					it.etaDisplay = this.etaDate(it);
					return it;
			}).filter((it) => {
					return it.etaDisplay != "";
			}).sort((a,b) => {
					return a.etaDisplay.localeCompare(b.etaDisplay);
			});
			if(isEmpty(orders)) return "";
			return orders[0].etaDisplay;
		},
		statusIndex() {
			if (isEmpty(this.order)) return 0;
			let status = this.order.orders[0].status;
			switch (status) {
				case "COMPLETED":
					return 4;
				case "READY":
				case "PREPARATION":
				case "QUEUED":
					return 3;
				case "ASSIGNING_DRIVER":
					return 2;
				case "PLACED":
					return 1;
				default:
					return 0;
			}
		},
		orderStatusDisplay() {
			if (isEmpty(this.order)) return "";
			let status = this.order.orders[0].status;
      let collectAtStore = false;
      for(let i = 0; i < this.order.orders.length; i++){
        if(this.order.orders[i].collectAtStore) collectAtStore = true;
      }
      if(collectAtStore) return 'Picked up';
      if(!status) return "Unknown";
      return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
		},
		countItems() {
			if (isEmpty(this.order)) return 0;
			let count = 0;
			let orders = this.order.orders;
			for (let i = 0; i < orders.length; i++){
				count += orders[i].items.length;
			}
			return count;
		},
    paymentStatus() {
      if (isEmpty(this.orderPayments)) {
        return this.isDeliveryOrder ? "Cash on Delivery" : "Cash";
      }
      let isPaid =
        this.orderPayments.filter((it) => it.status == "PAID").length > 0;
      let isrefunded =
        this.orderPayments.filter((it) => it.refunded).length > 0;
      if (isrefunded) return "Refunded";
      return isPaid ? "Paid" : "Unpaid";
    },
    orderType() {
      if (isEmpty(this.order)) return "";
      return this.order.orders[0].type;
    },
    isDeliveryOrder() {
      return ["DELIVERY", "RETAIL_DELIVERY"].includes(this.orderType);
    },
    orderTypeDisplay() {
      if (isEmpty(this.order)) return "";
      if (this.isDeliveryOrder) return "Delivery";
      return "Pick up Instore";
    },
    outletDiscounts() {
      return this.order?.discounts || [];
    },
    groupedExtraCharges() {
      if (isEmpty(this.order)) return [];
      let orders = [...this.validOrder(this.order)];
      if (isEmpty(orders)) return [];
      let charges = [];
      orders.forEach((o) => {
        let extras = o.extraCharges;
        if (!isEmpty(extras)) {
          extras.forEach((item) => {
            let it = { ...item };
            let idx = charges.findIndex((x) => {
              return (
                x.percentage == it.percentage &&
                x.type == it.type &&
                x.name == it.name &&
                x.inclusive == it.inclusive
              );
            });
            if (idx > -1) {
              charges[idx].amount += it.amount;
            } else {
              charges = [...charges, ...[it]];
            }
          });
        }
      });
      return charges;
    },
    groupedDiscounts() {
      let discounts = [];
      const orderJSON = JSON.parse(JSON.stringify({ ...this.order }));
      if (!isEmpty(orderJSON?.orderDiscounts)) {
        discounts = new Set([...discounts, ...orderJSON.orderDiscounts]);
      }
      const outletDiscounts = JSON.parse(
        JSON.stringify({ disc: this.outletDiscounts })
      );
      if (!isEmpty(outletDiscounts)) {
        discounts = new Set([...discounts, ...outletDiscounts.disc]);
      }
      if (!isEmpty(orderJSON)) {
        const orders = [...this.validOrder(orderJSON)];
        orders.forEach((o) => {
          if (!isEmpty(o.discounts)) {
            discounts = new Set([...discounts, ...o.discounts]);
          }
        });
      }
      if (isEmpty(discounts)) return [];

      // make discounts unique, eliminate duplicated data:
      let arr = Array.from(discounts).filter(
        (value, index, self) =>
          index ===
          self.findIndex((t) => t.reason === value.reason && t.id == value.id)
      );
      let items = [];
      for (let i = 0; i < arr.length; i++) {
        let ix = items.findIndex((it) => it.reason == arr[i].reason);
        if (ix > -1) items[ix].amount += arr[i].amount;
        else items.push(arr[i]);
      }
      return items;
    },
    assignedStores() {
      let stores = [];
      if (isEmpty(this.order?.orders)) return [];
      for (let i = 0; i < this.order.orders.length; i++){
        let ord = this.order.orders[i];
        let name = ord.outlet?.name || ord.storeName;
        if(stores.includes(name)) continue;
        stores = [...stores, name];
      }
      return stores;
    },
    groupedOrders(){
      if (isEmpty(this.order?.orders)) return [];
      let orders = [];
      const parentOrders = this.order.orders.map((one) => {
        return {
          ...one,
          items: one.items.map((it) => {
            return {
              ...it,
              brand: one.brand,
              modifierName: it.modifiers.map((m) => {
                return `${m.quantity}x ${m.modifierName}`
              })?.join(', ')
            }
          })
        }
      });
      for (let i = 0; i < parentOrders.length; i++){
        let ord = parentOrders[i];
        let name = ord.outlet?.apiCode || ord.storeName;
        let ix = orders.findIndex((it) => {
          let code = it.outlet?.apiCode || it.storeName
          return code == name;
        });
        if(ix > -1) {
          orders[ix].items = [...orders[ix].items, ...ord.items];
        } else {
          orders.push(ord);
        }
      }
      return orders;
    }
  },
	methods: {
    isPaid(order){
      if(!order) return false;
      return order.payments?.filter((pm) => pm.status == "PAID").length > 0;
    },
    toggleShowInvoice(){
      this.showInvoice = !this.showInvoice;
      if(this.showInvoice) this.loadingInvoice = true;
    },
    initInvoice(res){
      this.loadingInvoice = false;
      if(!res?.success) {
        this.showNotification("alert", "error_outline", res.message);
      }
    },
		etaDate(order){
			if(isEmpty(order)) return "";
			let eta = order.etaTime;
			let placeTime = this.order.placeTime;
			if (!eta) {
				let store = this.$store.getters.getStoreList.find((s) => { return s.id == order.store });
				if (store) eta = placeTime + ((store.transitTime + store.kitchenPrepTime + store.bufferTime) * 360);
			}
			if(!eta) return "";
			return moment.tz(eta, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
		},
		validOrder(order){
			if(order.orders) return order.orders;
			return [order];
		},
    async fetchOrder() {
      const res = await getOrder(this.orderNumber);
      const products = this.$store.getters.getProducts;
      if (!isEmpty(res.orders)) {
        let order = res.orders
          .sort((a, b) => {
            return b.id - a.id;
          })
          .find((it) => {
            return it.number == this.orderNumber && !isEmpty(it.payments);
          });
        if (!isEmpty(order)) {
          res.orders = res.orders.map((it) => {
            it.payments = it.payments?.length > 0 ? it.payments : order.payments;
            let refunds = it.payments.filter((p) => {
              return p.status == "REFUNDED";
            });
            it.payments = it.payments.filter((p) => {
              return p.status == "PAID";
            });
            it.payments.map((pm) => {
              let type = pm.type.toUpperCase();
              pm.refunded =
                refunds.filter((ref) => {
                  return ref.type == pm.type;
                }).length > 0;
              switch (type) {
                case "PAYMAYA":
                  pm.logo = require("@/assets/images/paymaya-logo.png");
                  break;
                default:
                  pm.logo = "";
                  break;
              }
              return pm;
            });
            return it;
          });
        }
        let outlets = this.$store.getters.getOutlets;
        this.order = res.orders.find((it) => {
          return it.number == this.orderNumber;
        });
        if (isEmpty(this.order)) return;
        this.order.orders.map((it) => {
          it.outlet = outlets.find((o) => {
            return o.stores.filter((s) => s.id == it.store).length > 0;
          });
          it.items.map((item) => {
            let prd = products.find((p) => p.id == item.product);
            let img = item.imageId;
            if(item.variant){
              let variant = prd?.variants?.find((v) => v.id == item.variant);
              if(variant && !isEmpty(variant?.images)){
                variant?.images.sort((a,b) => a.sortIndex - b.sortIndex);
                img = variant.images[0];
              }
            }
            item.imageDisplay = this.getImage(img);
            return item;
          });
          return it;
        });
      }
    },
    stopReorderingId(id){
      this.reorderingIds = this.reorderingIds.filter((it) => it != id);
    },
    isReordering(id){
      return this.reorderingIds.includes(id);
    },
    modifierClicked(modifierGroups, modifierId) {
      let mgs = modifierGroups.map((it) => this.prepareModifierGroup(it));
      mgs.some(function (it) {
        if (it.minModifiers === it.maxModifiers && it.maxModifiers === 1) {
          it.modifiers.forEach(function (modifier) {
            if (modifier.maxQuantity === 1) {
              if (modifier.id === modifierId) {
                modifier.selectedAmount = 1;
                it.selectedModifiers.push(modifier);
              } else {
                modifier.selectedAmount = 0;
              }
            }
          });
        } else {
          it.modifiers.forEach(function (modifier) {
            if (modifier.maxQuantity === 1) {
              if (modifier.id === modifierId) {
                if (modifier.selectedAmount > 0) {
                  modifier.selectedAmount -= 1;
                  it.totalSelectedAmount -= 1;
                  it.max = false;
                } else {
                  if (it.totalSelectedAmount < it.maxModifiers) {
                    modifier.selectedAmount += 1;
                    it.totalSelectedAmount += 1;
                    it.selectedModifiers.push(modifier);
                  }
                  if(it.totalSelectedAmount === it.maxModifiers) {
                    it.max = true;
                  }
                }
              }
            }
          });
        }
        return true;
      });
      return mgs;
    },
    prepareModifierGroup(modifierGroup) {
      modifierGroup.selectedModifiers = [];
      modifierGroup.totalSelectedAmount = 0;
      if (modifierGroup.modifiers && modifierGroup.modifiers.length > 0) {
          modifierGroup.modifiers.forEach(function (modifier) {
              if (modifier.maxQuantity === 1) {
                  if (modifier.preSelected) {
                      modifier.selectedAmount = 1;
                      modifierGroup.selectedModifiers.push(modifier);
                      modifierGroup.totalSelectedAmount = 1;
                  } else {
                      modifier.selectedAmount = 0;
                  }
              } else {
                  modifier.selectedAmount = 0;
              }
              modifierGroup.totalSelectedAmount += modifier.selectedAmount;
              modifierGroup.max = false;
          });
      }
      return modifierGroup;
    },
    async buyAgain(item, parent) {
      let these = `${item.productName}`;
      let currentId = item.product;
      if (item.variantName) these = `${these} ${item.variantName}`;
      this.reorderingIds = [...this.reorderingIds, item.product];
      let products = this.$store.getters.getProducts;
      let product = products?.find((p) => p.id == item.product);
      if(!product){
        const json = await productService.retrieveProductsList({
          productId: item.product,
          pageNumber: 0,
          pageSize: 1,
        });
        product = json?.products?.find((p) => p.id == item.product);
        if(product){
          product.brands = json.brands.filter((b) => b.apiCode == product.brand);
        }
      }
      if (!product) {
        this.stopReorderingId(currentId);
        this.showNotification("alert", "error_outline", `${these} currently unavailable!`);
        return;
      }
      let currentCarts = this.$store.getters.getCarts;
      let outlets = this.$store.getters.getOutlets;
      let outlet = outlets?.find((o) => o.apiCode == parent.outlet.apiCode);
      if (!outlet) {
        this.stopReorderingId(currentId);
        this.showNotification("alert", "error_outline", `${these} currently unavailable!`);
        return;
      }
      let inventory = null;
      if(product.brands.find((b) => b.type != "FOOD")){
        let res = await getInventory(outlet.apiCode, item.product);
        if (!res?.success) {
          this.stopReorderingId(currentId);
          this.showNotification("alert", "error_outline", `${these} currently out of stock!`);
          return;
        }
        inventory = res.inventories.find((inv) => inv.product.id == item.product && inv.stock > 0);
        if (!isEmpty(item.variant)) {
          inventory = res.inventories.find((inv) => inv.product.id == item.product && inv.variant?.id == item.variant && inv.stock > 0);
        }
        let maxQty = inventory ? inventory.stock : 0;
        if (maxQty < item.quantity) {
          this.stopReorderingId(currentId);
          this.showNotification("alert", "error_outline", `${these} currently out of stock!`);
          return;
        }
        product.inventory = inventory;
      }
      let newParentCarts = JSON.parse(JSON.stringify(currentCarts));
      let newcarts = newParentCarts[outlet.apiCode] || [];
      let price = product.price;
      if (product.promoPrice > 0) price = product.promoPrice;
      let variantId = item.variant;
      let variant = null;
      if (variantId) {
        variant = product.variants.find((v) => v.id == variantId);
      }
      if (variant) {
        price = variant.price;
        if (variant.promoPrice > 0) price = variant.promoPrice;
      }
      if(item.modifiers){
        for(let i = 0; i < item.modifiers.length; i++){
          price += item.modifiers[i].price;
        }
      }
      let maxIds = [];
      for(let k in newParentCarts) {
        maxIds = [...maxIds, newParentCarts[k].map((it) => it.id)]
      }
      let maxId = isEmpty(maxIds) ? 0 : (Math.max(...maxIds) + 1) 
      let tempCart = {
        outletStore: {
          ...outlet,
          brand: parent.brand
        },
        id: maxId,
        showEdit: false,
        product: JSON.parse(JSON.stringify(product)),
        quantity: item.quantity,
        variant: variant,
        modifierGroups: [],
        price: price,
        accPrice: price,
        specialInstructions: "",
        modifiers: [],
        storeName: parent.storeName,
        storeId: parent.store,
        inventory: inventory,
        processing: true,
        freeProduct: "",
        checked: true,
      };
      if(item.modifiers?.length > 0){
        tempCart.modifiers = item.modifiers.map((m) => ({modifierId: m.modifierId, name: m.modifierName, price: m.price, quantity: m.quantity}));
        item.modifiers.forEach((mod) => {
          tempCart.modifierGroups = this.modifierClicked(product.modifierGroups, mod.modifierId);
        })
      }
      let findCartIndex = newcarts.findIndex((cx) => {
        if (tempCart.variant) {
          return cx.product.id == tempCart.product.id && cx.variant.id == tempCart.variant.id;
        }
        return cx.product.id == tempCart.product.id;
      });
      if (findCartIndex > -1) {
        newcarts[findCartIndex].quantity += tempCart.quantity;
        newcarts[findCartIndex].price += tempCart.price;
        newcarts[findCartIndex].accPrice += tempCart.accPrice;
      } else {
        newcarts.push(tempCart);
      }
      this.$store.dispatch("setCarts", {
        ...newParentCarts,
        [outlet.apiCode]: newcarts
      });
      this.testOrder(false, () => {
        this.stopReorderingId(currentId);
        this.showNotification("success", "done", `Added into cart`);
        document.querySelector(".nav-cart-trigger").click();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, (err) => {
        this.stopReorderingId(currentId);
        this.showNotification("alert", "error_outline", `Something went wrong! ${err.message}`);
        this.$store.dispatch("setCarts", currentCarts);
      }, false, true, newcarts, outlet.apiCode);
    }
  },
  async created() {
    try {
      this.loading = true;
      this.orderNumber = this.$route.params.number;
      if (!this.$store.getters.hasInited) {
        await this.refreshMainData();
      }
      await this.fetchOrder();
    } catch (error) {
      this.showNotification("alert", "error_outline", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped lang="scss">
.close-btn {
  cursor: pointer;
}
.modal-body {
  padding: 0 !important;
}
@keyframes fetching {
  100% {
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
  }
}
@-webkit-keyframes fetching {
  100% {
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
  }
}
.loading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  margin-top: 32px;
  gap: 8px;
  font-size: 14px;
  &::before {
    content: "";
    min-width: 25px;
    min-height: 25px;
    border: 2px solid $secondary-color-20;
    border-left-color: transparent;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
    -webkit-transition: all 0.3s ease-in-out;
    animation: fetching 1s linear infinite;
    -webkit-animation: fetching 1s linear infinite;
  }
}
.suggested-content {
  width: 100%;
  padding-block: 24px;
}
.order-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-block: 32px;
  padding-inline: 24px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Berthold Akzidenz Grotesk Medium';
  font-size: 28px;
  line-height: 38px;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
}
.order-content {
  width: 100%;
  display: flex;
  gap: 24px;
  flex-direction: column;
}
.order-info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: fit-content;
}
.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: $white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid $secondary-color-20;
	&.tracker {
		border: 1px solid $main-blue;
		padding-inline: 0 !important;
		padding-bottom: 0 !important;
		gap: 24px;
	}
  &.instore {
    border-radius: 0px;
    border-color: transparent;
    background: $bg-green !important;
    padding-inline: 0 !important;
		padding-block: 0 !important;
		gap: 24px;
    width: calc(100% + 48px);
    margin-left: -24px;
    .order-status-con {
      background: $bg-green !important;
    }
    .order-status-display {
      color: $main-green !important;
    }
  }
  .order-info-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: 'Berthold Akzidenz Grotesk Medium';
    flex-wrap: wrap;
  }
  .order-label {
    font-size: 18px;
    line-height: 28px;
  }
  .outlet {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    line-height: 28px;
    text-align: right;
    .material-icons {
      color: $primary-color-60;
      font-size: 1.2em !important;
    }
  }
}
.order-track {
	width: 100%;
	align-items: flex-start;
	display: flex;
	gap: 0px;
	.track-item {
		flex: 1;
		position: relative;
		display: flex;
		flex-direction: column;
		border-top: 2px solid $secondary-color-30;
		padding-top: 16px;
		color: $secondary-color-50;
		font-size: 0.9em;
		&:first-child {
			border-image: linear-gradient(to right, $white 50%, $secondary-color-30 50%);
			border-image-slice: 1;
		}
		&:last-child {
			border-image: linear-gradient(to right, $secondary-color-30 50%, $white 50%);
			border-image-slice: 1;
		}
		&::before {
			content: "radio_button_unchecked";
			font-family: "Material Icons Outlined";
			width: 26px;
			height: 26px;
			border-radius: 50%;
			background: $white;
			position: absolute;
			margin-inline: auto;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			top: -13px;
			border: 4px solid $white;
			white-space: nowrap;
			word-wrap: normal;
			direction: ltr;
			text-rendering: optimizeLegibility;
			-webkit-font-smoothing: antialiased;
			color: $secondary-color-30;
			font-size: 1.4em;
		}
		&.active {
			color: $main-blue;
			&::before {
				color: $main-blue;
				content: "radio_button_checked" !important;
			}
		}
		&.passed {
			color: $main-blue;
			&::before {
				color: $main-blue;
				content: "check_circle" !important;
			}
		}
	}
}
.order-status-con {
	background: rgba(22, 177, 255, 0.08);
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-inline: 24px;
	padding-bottom: 24px;
	.order-status-display {
		width: 100%;
		text-align: left;
		padding-top: 16px;
		color: $main-blue;
		font-weight: bold;
		font-size: 1.3em;
	}
	.eta-con {
		padding: 12px;
		border-radius: 8px;
		background: rgba(82, 82, 82, 0.08);
		color: $secondary-color-90;
		display: flex;
		flex-direction: column;
		gap: 0;
		align-items: flex-start;
		justify-content: flex-start;
		margin-bottom: 8px;
		span {
			font-size: 0.9em;
			font-weight: bold;
		}
	}
}
.order-number-wrapper {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	outline: none;
	.number {
    font-size: 15px;
    line-height: 22px;
		font-family: 'Berthold Akzidenz Grotesk';
	}
	.order-link {
		color: $primary-color-60;
		font-family: 'Berthold Akzidenz Grotesk Medium';
		text-decoration: none;
		font-size: 15px;
    line-height: 22px;
    border: none;
    cursor: pointer;
    background: transparent;
	}
}
.order-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  .product-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .product {
    display: flex;
    gap: 20px;
    justify-content: flex-start;
    align-items: flex-start;
  }
  .product-img {
    min-width: 100px;
    max-width: 100px;
    aspect-ratio: 1/1;
    border: 1px solid $secondary-color-20;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 100%;
      object-fit: contain;
    }
  }
  .product-info {
    flex: 3;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .product-brand {
      color: $primary-color-60;
      font-weight: bold;
      font-size: 12px;
      line-height: 14px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .product-name {
      font-weight: normal;
      width: 100%;
      text-align: left;
    }
    .product-variant {
      color: $secondary-color-60;
    }
    .pricing {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 15px !important;
      line-height: 22px;
    }
  }
  & + .order-card {
    .order-info-header {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid $secondary-color-20;
    }
  }
  .product-actions {
    width: 100%;
    padding: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
    .btn-action {
      outline: none;
      border: none;
      cursor: pointer;
      background-color: $primary-color-60;
      color: $white;
      text-decoration: none;
      padding: 7px 17px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      height: 38px;
      font-family: "Berthold Akzidenz Grotesk Medium";
      &:not(.lite){
        box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
      }
      &.lite {
        color: $primary-color-60 !important;
        background: $white !important;
      }
      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
    .buying {
      font-family: "Berthold Akzidenz Grotesk Medium";
      color: $primary-color-60;
    }
  }
}
.item-row {
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  margin-top: 10px;
  .label {
    text-align: left;
  }
  .text {
    font-family: 'Berthold Akzidenz Grotesk Medium';
    text-align: right;
    &.inline {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      .text-inline + .text-inline {
        position: relative;
        display: flex !important;
        align-items: center;
        gap: 6px;
        &::before {
          content: "";
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: $secondary-color-70;
        }
      }
    }
  }
	&.total {
		padding-top: 10px;
		border-top: 1px solid $secondary-color-20;
		& .label, & .text {
			font-family: 'Berthold Akzidenz Grotesk Medium';
			font-size: 18px;
      line-height: 28px;
		}
	}
}
@media (min-width: 672px) {
  .order-container {
    padding-inline: 7%;
    background: $secondary-color-10;
    aspect-ratio: 3/2;
  }
  .order-content {
    flex-direction: row !important;
  }
  .order-info {
    &.instore {
      border-radius: 12px;
      border: 1px solid $main-green !important;
      width: 100%;
      margin-left: 0;
    }
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .order-content {
    flex-direction: column !important;
  }
}
</style>
