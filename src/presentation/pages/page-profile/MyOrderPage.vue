<template>
  <layout-variant-two :show-loading-screen="loading" :overflow-hidden="true">
    <template v-slot:body>
      <div :class="['container', {'empty': !loading && isEmpty(objects)}]">
        <div class="container__nav">
          <h1><i class="material-icons-outlined">arrow_back</i>Order Center</h1>
          <ul class="tabs">
            <li @click="showAll()" :class="{ active: activeIndex == 0 }">
              All
            </li>
            <li @click="filterOrders(1)" :class="{ active: activeIndex == 1 }">
              In Progress
            </li>
            <li @click="filterOrders(2)" :class="{ active: activeIndex == 2 }">
              Complete
            </li>
            <li @click="filterOrders(3)" :class="{ active: activeIndex == 3 }">
              Return
            </li>
            <li @click="filterOrders(4)" :class="{ active: activeIndex == 4 }">
              Cancel
            </li>
          </ul>
          <div class="button-group">
            <button @click="showOrders('delivery')" :class="{'active': orderType == 'delivery'}">Delivery</button>
            <button @click="showOrders('pickup')" :class="{'active': orderType == 'pickup'}">In-store Pickup</button>
            <button @click="showOrders('event')" :class="{'active': orderType == 'event'}">Events</button>
          </div>
          <div class="content">
            <div
              class="order__item"
              :class="{ active: isCurrentActive(obj) }"
              v-for="(obj, i) in objects"
              :key="i"
            >
              <div class="order__item__body">
                <div class="order__item__body__details">
                  <div class="order__item__body__details__head">
                    <span class="order__item__body__icon material-icons-outlined">{{
                      obj.group == "event"
                        ? "hiking"
                        : "shopping_bag"
                    }}</span>
                    <div class="order__item__body__details__type">
                      <span>{{ obj.group == "event"
                          ? "Events"
                          : "Shop"
                      }}</span>
                      <div class="order__item__body__details__date">
                        {{ obj.date }}
                      </div>
                    </div>
                    <div :class="['order__item__body__details__status', obj.statusClass]">
                      {{ obj.statusDisplay }}
                    </div>
                  </div>
                  <div
                    class="order__item__body__rows"
                    v-for="(row, r) in obj.rows"
                    :key="r"
                  >
                    <div v-if="obj.group != 'event' && showObj(obj, r)">
                      <div class="order__item__body__details__location block">
                        <span class="material-icons-outlined">{{ obj.group == 'delivery' ? 'local_shipping' : 'hiking' }}</span>
                        <div class="location-details">
                          <span class="location-type">{{ obj.group == "delivery" ? 'Delivery' : 'Pickup Instore' }}</span>
                          <span class="location-address">{{ row.outlet?.name || row.storeName }}</span>
                        </div>
                      </div>
                      <div
                        class="order__item__body__details__row"
                        v-for="(item, m) in row.items"
                        :key="m"
                      >
                        <img class="product-img" :src="getImage(item.imageId)">
                        <div class="product-card">
                          <span class="product-brand">{{ row.brand.name }}</span>
                          <span>{{ item.productName }}</span>
                          <span class="product-variant" v-if="item.variantName">{{ item.variantName }}</span>
                          <span class="product-variant" v-if="item.modifiers">{{ item.modifiers?.map((m) => `${m.quantity}x ${m.modifierName}`).join(', ') }}</span>
                          <div class="product-qty">
                            <span>x{{ item.quantity }}</span>
                            <span>{{ currency(item.total) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="obj.group == 'event'">
                      <div
                        class="order__item__body__details__row"
                        v-for="(item, m) in row.items"
                        :key="m"
                      >
                        <img class="product-img" :src="item.imageDisplay">
                        <div class="product-card">
                          <span class="product-event">{{ item.productName }}</span>
                          <div class="product-qty">
                            <span>x{{ item.quantity }}</span>
                            <span>{{ currency(item.total) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="view-more-products">
                        <span></span>
                        <div class="view-more-total">
                          <span class="total-label">Total</span>
                          <span class="total-value">{{ currency(obj.total) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="obj.group != 'event' && obj.viewMore" class="view-more-details">
                    <div class="extra-charges">
                      <span>Sub total</span>
                      <span>{{ currency(obj.subTotal) }}</span>
                    </div>
                    <div class="extra-charges" v-for="(extra, n) in obj.extraCharges" :key="n">
                      <span>{{ extra.name }} {{ extra.percentage ? extra.percentage + '%' : '' }} {{ extra.inclusive ? '(inclusive)' : '' }}</span>
                      <span>{{ currency(extra.amount) }}</span>
                    </div>
                    <div class="extra-charges" v-for="(disc, m) in obj.discounts" :key="m">
                      <span>{{ disc.reason }}</span>
                      <span>{{ currency(disc.amount) }}</span>
                    </div>
                  </div>
                  <div v-if="obj.group != 'event'" class="view-more-products">
                    <span class="view-more-trigger" @click="obj.viewMore = !obj.viewMore">
                      {{obj.viewMore ? 'View Less' : 'View More '}}
                      <i class="material-icons-outlined">{{ obj.viewMore ? 'expand_less' : 'expand_more'}}</i>
                    </span>
                    <div class="view-more-total">
                      <span class="total-label">Total</span>
                      <span class="total-value">{{ currency(obj.total) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="order__item__bottom">
                <router-link :to="(obj.group == 'event' ? '/booking-details/' : '/order-details/') + obj.number" class="order__item__bottom__btn lite">
                  See details
                </router-link>
                <div class="order__item__bottom__btn" @click="buyAgain(obj)">
                  Buy Again
                </div>
              </div>
            </div>
            <div class="order__item" v-if="isEmpty(objects) && !loading">No data found..</div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
  </layout-variant-two>
</template>

<script>
import { storeService, eventService, productService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import { getInventory } from "@/connector/v4/productConnector";

export default {
  name: "MyOrderPage",
  mixins: [utility],
  components: {
    LayoutVariantTwo,
  },
  data() {
    return {
      loading: false,
      orders: [],
      bookings: [],
      activeIndex: 0,
      currentReceipt: null,
      objects: [],
      orderType: "",
    };
  },
  watch: {
    activeIndex() {
      this.currentReceipt = null;
      this.objects = [];
      setTimeout(() => {
        this.setObjects();
      }, 50);
    },
    orderType() {
      this.currentReceipt = null;
      this.objects = [];
      setTimeout(() => {
        this.setObjects();
      }, 50);
    },
  },
  computed: {},
  methods: {
    showObj(obj, index) {
      let isViewMore = obj.viewMore;
      if (!isViewMore && index == 0) {
        return true;
      }
      return isViewMore;
    },
    setObjects() {
      let items = [];
      let orders = this.orders.map((it) => {
        let statusClass = "progress";
        let orderStatus = it.orders[0].status;
        let isInprogress = true;
        let isComplete = orderStatus == "COMPLETED";
        let isCanceled = ["CANCELLED", "CANCELED"].includes(orderStatus);
        let isRefunded = it.payments.some((p) => p.status == "REFUNDED");
        if (["COMPLETED"].includes(orderStatus)) {
          statusClass = "complete";
          isInprogress = false;
          isCanceled = false;
          isRefunded = false;
        }
        if (["CANCELLED","REFUNDED","FAILED_DELIVERY"].includes(orderStatus)) {
          statusClass = "cancel";
          isComplete = false;
          isInprogress = false;
          isCanceled = true;
        }
        if(isCanceled){
          isInprogress = false;
          isComplete = false;
          isRefunded = false;
        }
        if (["RETURNED","RETURN_IN_PROGRESS"].includes(orderStatus)){
          isInprogress = false;
          isCanceled = false;
          isComplete = false;
          isRefunded = true;
          statusClass = "cancel";
        }
        if (isRefunded) {
          isInprogress = false;
          isComplete = false;
          isCanceled = false;
          statusClass = "cancel";
        }
        let discounts = [];
        let extraCharges = [];
        for (let i = 0; i < it.orders.length; i++){
          let extras = JSON.parse(JSON.stringify(it.orders[i].extraCharges));
          let discs = JSON.parse(JSON.stringify(it.orders[i].discounts));
          for (let n = 0; n < extras.length; n++){
            let idx = extraCharges.findIndex((x) => {
              return x.percentage == extras[n].percentage && x.type == extras[n].type && x.name == extras[n].name && x.inclusive == extras[n].inclusive;
            });
            if (idx > -1) {
              extraCharges[idx].amount += extras[n].amount;
            } else {
              extraCharges.push(extras[n]);
            }
          }
          for (let m = 0; m < discs.length; m++) {
            let idx = discounts.findIndex((x) => {
              return x.reason == discounts[m].reason;
            });
            if (idx > -1) {
              discounts[idx].amount += discs[m].amount;
            } else {
              extraCharges.push(discs[m]);
            }
          }
        }
        let item = {
          status: orderStatus,
          statusDisplay: orderStatus.toLowerCase().split("_").join(" "),
          statusClass: statusClass,
          inProgress: isInprogress,
          completed: isComplete,
          canceled: isCanceled,
          refunded: isRefunded,
          type: it.type,
          group: it.orders.some((n) => ["RETAIL_DELIVERY", "DELIVERY"].includes(n.type)) ? "delivery" : "pickup",
          placeTime: it.placeTime,
          date: moment
            .tz(it.placeTime, "Asia/Singapore")
            .format("DD MMM YYYY HH:mm A"),
          number: it.number,
          total: it.total,
          subTotal: it.subTotal,
          details: it,
          rows: [],
          countOrders: 0,
          omisellOrder: false,
          viewMore: false,
          discounts: discounts,
          extraCharges: extraCharges
        };
        if (!isEmpty(it.orders)) {
          it.orders.forEach((o) => {
            item.countOrders += o.items.length;
            let outlet = this.$store.getters.getOutlets.find((ol) => {
              return (
                ol.stores
                  .map((os) => {
                    return os.id;
                  })
                  .indexOf(o.store) > -1
              );
            });
            item.omisellOrder =
              outlet?.enableOmisellIntegration == true && !isEmpty(o.address);
            let row = {
              location: !isEmpty(outlet) ? outlet.name : o.storeName,
              storeName: o.storeName,
              storeId: o.store,
              outlet: outlet,
              items: o.items,
              brand: o.brand,
              total: o.total,
              subTotal: o.subTotal
            };
            // if (item.omisellOrder) row.location = "Delivery";
            item.rows.push(row);
          });
        }
        return item;
      });
      let now = parseInt(moment.tz(moment(), "Asia/Singapore").format("x"));
      let bookings = this.bookings.map((it) => {
        let statusDisplay = "Confirmed";
        let statusClass = "progress";
        let isInprogress = true;
        let isComplete = false;
        let isCanceled = ["CANCELLED", "CANCELED"].includes(it.status);
        let isRefunded = false;

        let eventTimes = it.items
          .map((t) => {
            return t.ticket.endDate;
          })
          .sort((a, b) => {
            return b - a;
          });
        if (!isEmpty(eventTimes)) {
          if (now > eventTimes[0]) {
            statusDisplay = "Completed";
            statusClass = "complete";
            isComplete = true;
            isInprogress = false;
            isCanceled = false;
          }
        }
        switch(it.status){
          case "CANCELLED":
          case "CANCELED":
            isInprogress = false;
            isComplete = false;
            isRefunded = false;
            statusDisplay = "Cancelled";
            statusClass = "cancel";
            break;
          case "REFUNDED":
            isRefunded = true;
            isCanceled = false;
            isInprogress = false;
            isComplete = false;
            statusClass = "cancel";
            statusDisplay = "Returned";
            break;
        }
        let item = {
          statusDisplay: statusDisplay,
          statusClass: statusClass,
          inProgress: isInprogress,
          completed: isComplete,
          canceled: isCanceled,
          refunded: isRefunded,
          status: it.status,
          type: it.type,
          group: "event",
          placeTime: it.placeTime,
          date: moment
            .tz(it.placeTime, "Asia/Singapore")
            .format("DD MMM YYYY HH:mm A"),
          number: it.number,
          total: it.total,
          subTotal: it.subTotal,
          details: it,
          rows: [],
          countOrders: it.items.length,
          omisellOrder: false,
          viewMore: false,
        };
        item.rows.push({
          items: it.items.map((n) => {
            return {
              ...n,
              imageDisplay: !isEmpty(n.banners) ? n.banners[0] : require('@/assets/images/rox-logo-2025.jpeg')
            }
          }),
        });
        return item;
      });

      const all = [...bookings, ...orders];

      switch (this.activeIndex) {
        case 0:
          items = all;
          break;
        case 1:
          items = [...all?.filter((it) => it.inProgress == true)];
          break;
        case 2:
        items = [...all?.filter((it) => it.completed == true)];
          break;
        case 3:
        items = [...all?.filter((it) => it.refunded == true)];
          break;
        case 4:
        items = [...all?.filter((it) => it.canceled == true)];
          break;
      }
      switch (this.orderType) {
        case "delivery":
          items = [...items.filter((it) => it.group == "delivery")];
          break;
        case "pickup":
          items = [...items.filter((it) => it.group == "pickup")];
          break;
        case "event":
          items = [...items.filter((it) => it.group == "event")];
          break;
      }
      items.sort((a, b) => {
        return b.placeTime - a.placeTime;
      });
      this.objects = items;
    },
    isCurrentActive(obj) {
      if (isEmpty(this.currentReceipt)) return false;
      if (this.currentReceipt.type == "TICKET")
        return this.currentReceipt.number == obj.number;
      return this.currentReceipt.details.id == obj.details.id;
    },
    backtoList() {
      this.currentReceipt = null;
    },
    initReceipt() {
      this.loading = false;
    },
    goDetails(order) {
      if (!isEmpty(this.currentReceipt)) {
        if (order.type == "TICKET") {
          if (this.currentReceipt.number == order.number) return;
        } else if (this.currentReceipt.details.id == order.details.id) return;
      }
      this.currentReceipt = order;
      document.querySelector('.container__wrapper').scrollTop = 0;
    },
    showAll() {
      if (this.activeIndex == 0) return;
      this.activeIndex = 0;
    },
    filterOrders(index) {
      if (this.activeIndex == index) return;
      this.activeIndex = index;
    },
    showOrders(type) {
      if (this.orderType == type) {
        this.orderType = "";
        return
      };
      this.orderType = type;
    },
    async retrieveMyOrders() {
      this.orders = [];
      let json = await storeService.retrieveOrders();
      if (!json.success) return;
      this.orders = json.orders;
    },
    async retrieveMyBookings() {
      this.bookings = [];
      let json = await storeService.retrieveBookings();
      if (!json.success) return;
      this.bookings = json.orders;
      if (!isEmpty(this.bookings)) {
        let json = await eventService.getEvents();
        let events = json?.events;
        this.bookings = this.bookings.map((it) => {
          let items = it.items.map((item) => {
            let event = events.find((e) => {
              return e.sessions.some((s) => {
                return s.name == item.ticket.session && e.name == item.ticket.event;
              })
            });
            let banners = event?.banners;
            return {
              ...item,
              banners: banners?.sort((a,b) => a.sortIndex - b.sortIndex).map((b) => {
                return this.getImage(b.id)
              }),
              event: event,
            }
          });
          return {
            ...it,
            ...{ items: items }
          }
        });
      }
    },
    async buyAgainEvent(order) {
      let events = [];
      for (let i = 0; i < order.rows[0].items.length; i++){
        let it = order.rows[0].items[i];
        if (!isEmpty(it.event)) events.push(it);
      }
      if (isEmpty(events)) {
        this.showNotification("alert", "error_outline", `We are sorry, currently unavailable!`);
        return;
      }
      let it = events[0];
      let event = it.event;
      let today = moment();
      let todayMonth = parseInt(moment.tz(today, "Asia/Singapore").format('YYYYMM'));
      let session = event.sessions.find((s) => {
        return s.name == it.ticket.session;
      });
      if(!session){
        session = event.sessions.find((s) => {
          let endMonth = parseInt(moment.tz(s.endDate, "Asia/Singapore").format("YYYYMM"));
          return s.status == "ACTIVE" && endMonth >= todayMonth;
        });
      }
      if(!session){
        this.showNotification("alert", "error_outline", `We are sorry, currently no sessions available!`);
        return;
      }
      let endMonth = parseInt(moment.tz(session.endDate, "Asia/Singapore").format("YYYYMM"));
      let isActive = endMonth >= todayMonth && session.status == "ACTIVE";
      if(!isActive){
        this.showNotification("alert", "error_outline", `We are sorry, this event is no longer available!`);
        return;
      }
      if(session.spotLeft < it.quantity){
        this.showNotification("alert", "error_outline", `We are sorry, no spots left!`);
        return;
      }
      let category = event.categories.length > 0 ? event.categories[0] : "-";
      let categorySlugs = category.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.filter((it) => it !== "").map((it) => it.toLowerCase()).join('-');
      let eventSlugs = this.slugName(event.name);
      this.$router.push({
        name: "EventDetails",
        params: {
          eventId: event.id,
          category: categorySlugs,
          eventName: eventSlugs,
        },
      });
    },
    async buyAgain(order) {
      if (order.group == "event") return this.buyAgainEvent(order);
      let brands = order.rows.map((row) => row.brand);
      let rows = order.rows;
      const js = await productService.retrieveProductsList({
        brands: Array.from(new Set(brands?.map((b) => b.apiCode))),
        pageNumber: 0,
        pageSize: 1000000,
      });
      let productsList = js.products.map((prd) => {
        prd.brands = js.brands.filter((b) => b.apiCode == prd.brand);
        return prd;
      })
      this.$store.dispatch("setProducts", productsList);
      let products = [];
      let type = order.group == "delivery" ? "RETAIL_DELIVERY" : "RETAIL";
      for (let i = 0; i < rows.length; i++){
        let items = rows[i].items;
        let outlet = rows[i].outlet;
        let storeId = rows[i].storeId;
        let brand = rows[i].brand;
        let storeName = rows[i].storeName;
        for (let n = 0; n < items.length; n++){
          let productId = items[n].product;
          let productName = items[n].productName;
          let variantId = items[n].variant;
          let variantName = items[n].variantName;
          let modifiers = items[n].modifiers;
          let qty = items[n].quantity;
          let done = false;
          let inventory = null;
          let product = productsList.find((p) => p.id == productId);
          products = [...products, {
            productId,
            productName,
            product,
            variantId,
            variantName,
            modifiers,
            qty,
            brand,
            outlet,
            storeId,
            storeName,
            type,
            done,
            inventory
          }];
        }
      }
      let currentCarts = this.$store.getters.getCarts;
      let outlets = this.$store.getters.getOutlets;
      let index = 0;
      const nextOrder = () => {
        index += 1;
        reOrder();
      }
      const reOrder = async () => {
        if (isEmpty(products)) return;
        if (index == products.length) return;
        let one = products[index];
        if (!one.product) {
          return nextOrder();
        }
        let outletCode = one.outlet?.apiCode;
        if (!outletCode) {
          let outlet = outlets?.find((o) => o.stores.filter((s) => s.id == one.storeId).length > 0);
          if (!outlet) {
            return nextOrder();
          }
        } else {
          let outlet = outlets?.find((o) => o.apiCode == outletCode);
          if (!outlet) {
            return nextOrder();
          }
        }
        if(one.product.brands.find((b) => b.type != "FOOD")){
          let res = await getInventory(outletCode, one.productId);
          if (!res?.success) {
            return nextOrder();
          }
          let inventory = res.inventories.find((inv) => inv.product.id == one.productId && inv.stock > 0);
          if (!isEmpty(one.variantId)) {
            inventory = res.inventories.find((inv) => inv.product.id == one.productId && inv.variant?.id == one.variantId && inv.stock > 0);
          }
          let maxQty = inventory ? inventory.stock : 0;
          if (maxQty < one.qty) {
            return nextOrder();
          }
          products[index].done = true;
          products[index].inventory = inventory;
        } else {
          products[index].done = true;
        }
        nextOrder();
      }
      await reOrder();
      let unavailableProducts = products.filter((p) => !p.done);
      if (!isEmpty(unavailableProducts)) {
        let prds = unavailableProducts.map((p) => `${p.productName}${p.variantName ? ' ' + p.variantName : ''}`).join(', ');
        let these = unavailableProducts.length > 1 ? `These products: ${prds}` : prds;
        this.showNotification("alert", "error_outline", `${these} currently unavailable!`);
        return;
      }
      let availableProducts = products.filter((p) => p.done == true);
      let newParentCarts = JSON.parse(JSON.stringify(currentCarts));
      for (let a = 0; a < availableProducts.length; a++){
        let one = availableProducts[a];
        let outletCode = one.outlet?.apiCode;
        let prd = one.product;
        let price = prd.price;
        if (prd.promoPrice > 0) price = prd.promoPrice;
        let variantId = one.variantId;
        let modifiers = one.modifiers?.length ? one.modifiers.map((m) => {
          return {
            modifierId: m.modifierId,
            name: m.modifierName,
            quantity: m.quantity,
            price: m.price
          }
        }) : [];
        let modifierGroups = prd.modifierGroups || [];
        let variant = null;
        if (variantId) {
          variant = prd.variants.find((v) => v.id == variantId);
          modifierGroups = variant.modifierGroups;
        }
        if (variant) {
          price = variant.price;
          if (variant.promoPrice > 0) price = variant.promoPrice;
        }
        if(modifiers?.length > 0){
          for(let i = 0; i < modifiers.length; i++){
            price += modifiers[i].price;
          }
        }
        let maxIds = [];
        for(let k in newParentCarts) {
          maxIds = [...maxIds, newParentCarts[k].map((it) => it.id)]
        }
        let maxId = isEmpty(maxIds) ? 0 : (Math.max(...maxIds) + 1) 
        let tempCart = {
          outletStore: {
            ...one.outlet,
            brand: one.brand
          },
          id: maxId + a,
          showEdit: false,
          product: JSON.parse(JSON.stringify(prd)),
          quantity: one.qty,
          variant: variant,
          modifierGroups: modifierGroups,
          price: price,
          accPrice: price,
          specialInstructions: "",
          modifiers: modifiers,
          storeName: one.storeName,
          storeId: one.storeId,
          inventory: one.inventory,
          processing: true,
          freeProduct: "",
          checked: true,
        };
        let newcarts = newParentCarts[outletCode] || [];
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
        newParentCarts[outletCode] = newcarts;
      }
      console.log(newParentCarts);
      for(let k in newParentCarts){
        this.$store.dispatch("setCarts", newParentCarts);
        await this.testOrder(false, () => {
          this.showNotification("success", "done", `Added into cart`);
          document.querySelector(".nav-cart-trigger").click();
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }, (err) => {
          this.showNotification("alert", "error_outline", `Something went wrong! ${err.message}`);
          this.$store.dispatch("setCarts", currentCarts);
        }, false, true, newParentCarts[k], k);
      }
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
  },
  async created() {
    try {
      this.loading = true;
      if (!this.$store.getters.hasInited) {
				await this.refreshMainData(false);
			} else {
        await this.refreshCustomerData();
      }
      await this.retrieveMyOrders();
      await this.retrieveMyBookings();
      this.showAll();
      this.setObjects();
    } catch (error) {
      this.showNotification("alert", "error_outline", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped lang="scss">
.header-con {
  padding: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  max-height: 56px;
  border-bottom: 1px solid $secondary-color-20;
  margin-bottom: 0;
  gap: 12px;

  &.hidden {
    display: none;
  }

  .back-btn {
    color: $secondary-color-60;
    font-size: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    flex: 1;
    font-size: 1.2em;
    font-family: 'Berthold Akzidenz Grotesk Medium';
  }
}
.receipt-con {
  padding: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  max-height: 56px;
  border-bottom: 1px solid $secondary-color-20;
  margin-bottom: 0;
  gap: 12px;
  background: $white;

  & + * {
    flex: 3;

    & .payment-wrapper {
      height: 100%;
    }
  }

  .back-btn {
    color: $secondary-color-60;
    font-size: 1.2em;
  }
  .heading {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .head-date {
      font-size: 1em;
      color: $secondary-color-90;
    }

    .head-info {
      font-size: 0.8em;
      color: $secondary-color-60;
    }
  }
}
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-block: 20px;
  button {
    outline: none;
    border: 1px solid $dark-color-4;
    border-radius: 24px;
    height: 38px;
    color: $dark-color-4;
    font-family: 'Berthold Akzidenz Grotesk Medium';
    padding: 8px 18px;
    cursor: pointer;
    &.active {
      border-color: $primary-color-60;
      color: $primary-color-60;
      background: transparent !important;
    }
  }
}
.container {
  display: flex;
  width: 100%;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  &.empty {
    min-height: calc(100% - 220px);
    overflow: hidden;
  }

  &__nav {
    flex: 1;
    text-align: left;
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    h1 {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      line-height: 38px;
      .material-icons-outlined,
      .material-icons {
        cursor: pointer;
        font-size: 24px !important;
      }
    }
    &.hidden {
      display: none;
    }
  }
  &__wrapper {
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: auto;
    background: $white;
    scroll-behavior: smooth;
    transition: all 0.5s linear;
    -webkit-transition: all 0.5s linear;
    &.hidden {
      display: none;
    }
  }
  &__receipt {
    width: 100%;
    height: fit-content;
    text-align: left;
    display: flex;
    flex-direction: column;
    background: $white;
  }
}
.tabs {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 30px;
  list-style-type: none;
  padding: 10px 0px;
  border-bottom: 2px solid $secondary-color-20;
  position: relative;

  li {
    text-decoration: none;
    list-style: none;
    padding: 0;
    min-width: 50px;
    display: flex;
    justify-content: center;
    position: relative;
    color: $secondary-color-70;
    font-family: 'Berthold Akzidenz Grotesk Medium';
    white-space: nowrap;

    &.active {
      &::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -12px;
        height: 2px;
        background: $primary-color-60;
      }
      color: $primary-color-60;
    }
  }
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $primary-color-60;
    height: 100%;
    min-height: 200px;
    font-family: 'Berthold Akzidenz Grotesk Medium';
  }

  .order {
    &__item {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      -webkit-animation-duration: 0.3s;
      animation-duration: 0.3s;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
      -webkit-animation-name: fadeInDown;
      animation-name: fadeInDown;
      padding: 20px;
      background: $white;
      border-radius: 20px;
      border: 1px solid $secondary-color-20;

      &__body {
        width: 100%;
        display: flex;
        gap: 10px;

        &__icon {
          width: 20px;
        }

        &__details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;

          &__head {
            width: 100%;
            display: flex;
            gap: 10px;
          }
          &__type {
            flex: 1;
            font-family: 'Berthold Akzidenz Grotesk Medium';
          }

          &__rows {
            display: flex;
            gap: 12px;
            flex-direction: column;
          }

          &__status {
            width: fit-content;
            height: 32px;
            padding: 6px 16px;
            border-radius: 500px;
            font-family: 'Berthold Akzidenz Grotesk Medium';
            background: $secondary-color-10;
            text-transform: capitalize;
            &.complete {
              color: rgba(16, 185, 129, 1);
              background: rgba(16, 185, 129, 0.16);
            }
            &.progress {
              color: rgba(22, 177, 255, 1);
              background: rgba(22, 177, 255, 0.08);
            }
          }
          &__date {
            color: $dark-color-3;
            font-family: 'Berthold Akzidenz Grotesk' !important;
          }
          &__location {
            display: flex;
            gap: 10px;
            &.block {
              background: $dark-color-9;
              padding: 10px;
              border-radius: 10px;
            }
            .location-details {
              display: flex;
              flex-direction: column;
              flex: 1;
              .location-type {
                font-weight: normal;
              }
              .location-address {
                font-family: "Berthold Akzidenz Grotesk Medium" !important;
              }
            }

            & + * {
              padding-top: 12px;
            }
          }
          .view-more-products {
            font-size: 13px;
            line-height: 18px;
            color: $dark-color-4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            font-family: "Berthold Akzidenz Grotesk Medium";
            .view-more-trigger {
              display: flex;
              align-items: center;
              gap: 4px;
              cursor: pointer;
              &:hover {
                opacity: 0.7;
              }
            }
            .view-more-total {
              display: flex;
              align-items: center;
              gap: 4px;
              .total-label {
                font-family: "Berthold Akzidenz Grotesk";
                font-size: 15px;
                line-height: 22px;
              }
              .total-value {
                font-family: "Berthold Akzidenz Grotesk Medium";
                font-size: 15px;
                line-height: 22px;
              }
            }
          }
          .view-more-details {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
            .extra-charges {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              flex-wrap: wrap;
            }
          }

          &__row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            .product-img {
              width: 108px;
              aspect-ratio: 3/4;
              object-fit: contain;
            }
            .product-card {
              display: flex;
              flex-direction: column;
              flex: 1;
              gap: 4px;
            }
            .product-event {
              letter-spacing: 0px;
              size: 15px;
              line-height: 22px;
              font-family: "Berthold Akzidenz Grotesk Medium";
            }
            .product-brand {
              text-transform: uppercase;
              color: $main-red;
              letter-spacing: 0.8px;
              size: 12px;
              line-height: 14px;
              font-weight: 600;
            }
            .product-variant {
              color: $dark-color-3;
            }
            .product-qty {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          }
        }
      }
      &__bottom {
        padding: 0;
        display: flex;
        justify-content: flex-end;
        gap: 20px;

        &__label {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0px;

          .label__title {
            font-weight: bold;
            font-size: 1.2em;
          }
          .label__subtitle {
            color: $secondary-color-70;
            font-size: 0.9em;
          }
        }
        &__btn {
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
        }
      }
    }
  }
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 672px) {
  .header-con {
    display: flex !important;
    padding: 16px 24px !important;
    .back-btn {
      cursor: pointer;
    }
  }
  .receipt-con {
    .back-btn {
      cursor: pointer;
    }
  }
  .container {
    &__nav {
      max-width: 640px;
      min-width: 640px;
      margin-inline: auto;

      &.hidden {
        display: flex !important;
      }
    }

    &__wrapper {
      background: $primary-color-20;
    }
    &__receipt {
      max-width: 650px;
      margin: 0 auto;
    }
  }
  .tabs {
    li {
      cursor: pointer;
    }
  }
  .content {
    padding-left: 0 !important;

    .order {
      &__item {
        &__bottom {
          &__btn {
            cursor: pointer;
          }
        }
      }
    }
  }
}
@media (max-width: 800px) {
  .container {
    &__nav {
      max-width: 100% !important;
    }
  }
}
</style>