<template>
  <div :class="['payment-container', {'full-width': !isEmpty(orders)}]" v-if="orderNumber">
    <div class="breadcrumbs" v-if="!isEmpty(orders)">
      <span class="breadcrumb-item">Home <i class="material-icons-outlined">chevron_right</i></span>
      <span class="breadcrumb-item">Your Order <i class="material-icons-outlined">chevron_right</i></span>
      <span class="breadcrumb-item active">Checkout</span>
    </div>
    <div class="payment-wrapper">
      <SuccessfulOrderContent
        v-if="!isEmpty(orders)"
        :hide-header="hideHeader"
        :order="orders"
        :order-number="orderNumber"
      />
    </div>
    <div class="suggested-content" v-if="!isEmpty(products)">
      <suggested-products :productsList="products" />
    </div>
  </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { eventService } from "@/bloc/services";
import { getOrder } from "@/connector/v4/productConnector";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import SuggestedProducts from "../../page-product/components/SuggestedProducts.vue";
import SuccessfulOrderContent from "./SuccessfulOrderContent.vue";

export default {
  name: "SuccessfulPayment",
  mixins: [utility],
  components: {
    // BookingContent,
    SuggestedProducts,
    SuccessfulOrderContent,
  },
  props: {
    orderNumber: {
      type: String,
      default: "",
    },
    orderObject: {
      type: Object,
      default: () => {},
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      booking: null,
      order: null,
      orders: []
    };
  },
  watch: {},
  computed: {
    orderDate() {
      if (isEmpty(this.booking)) return "";
      return moment
        .tz(this.booking.placeTime, "Asia/Singapore")
        .format("DD MMM YYYY HH:mm A");
    },
    customerName() {
      if (isEmpty(this.booking)) return "";
      let names = [];
      if (this.booking.customer.firstName)
        names.push(this.booking.customer.firstName);
      if (this.booking.customer.lastName)
        names.push(this.booking.customer.lastName);
      return names.join(" ");
    },
    customerEmail() {
      if (isEmpty(this.booking)) return "";
      return this.booking.customer.email;
    },
    products() {
      if (isEmpty(this.orders)) return [];
      let products = this.$store.getters.getProducts;
      let prds = [];
      for(let n =0; n < this.orders.length; n++){
        let one = this.orders[n];
        for (let i = 0; i < one.orders.length; i++) {
          let items = one.orders[i].items;
          for (let n = 0; n < items.length; n++) {
            let prd = products.find(
              (it) => it.id.toString() == items[n].product.toString()
            );
            if (prd) prds.push(prd);
          }
        }
      }
      return prds;
    },
  },
  methods: {
    formatDate(date) {
      return moment.tz(date, "Asia/Singapore").format("ddd, DD MMMM YYYY");
    },
    formatTimes(d) {
      return (
        moment.tz(d.startDate, "Asia/Singapore").format("HH:mm") +
        " - " +
        moment.tz(d.endDate, "Asia/Singapore").format("HH:mm")
      );
    },
    copy() {
      try {
        this.$refs.copyNumber.focus();
        this.$refs.copyNumber.select();
        document.execCommand("copy");
        this.$refs.copyNumber.blur();
        this.showNotification("success", "done", "Copied");
      } catch (error) {
        this.showNotification("alert", "error_outline", error);
      }
    },
  },
  async created() {
    try {
      if (!isEmpty(this.orderObject)) {
        this.order = this.orderObject;
        this.$emit("init-receipt", this.order);
        return;
      }
      if (!this.$store.getters.hasInited) {
        await this.refreshMainData(true);
      }
      let orderId = this.$route.params.orderId;
      let res = await eventService.getEventDetails(this.orderNumber);
      if (isEmpty(res.orders)) {
        const numbers = this.orderNumber.split('-');
        let allorders = [];
        for(let i=0; i<numbers.length;i++){
          if(!numbers[i]) continue;
          res = await getOrder(numbers[i]);
          if (!isEmpty(res.orders)) {
            let order = res.orders
              .sort((a, b) => {
                return b.id - a.id;
              })
              .find((it) => {
                if (orderId) return it.id == orderId;
                return it.number == this.orderNumber && !isEmpty(it.payments);
              });
            if (!isEmpty(order)) {
              res.orders.map((it) => {
                it.payments = order.payments;
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
            let one = res.orders.find((it) => {
              if (orderId) return it.id == orderId;
              return it.number == numbers[i];
            });
            if(one) allorders = [...allorders, one];
            res.order = one;
          }
        }
        this.orders = allorders;
      } else {
        this.booking = res.orders.find((it) => {
          return it.number == this.orderNumber;
        });
        if (!isEmpty(this.booking)) {
          let refunds = this.booking.payments.filter((p) => {
            return p.status == "REFUNDED";
          });
          this.booking.payments = this.booking.payments.filter((p) => {
            return p.status == "PAID";
          });
          this.booking.payments.map((pm) => {
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
          res.booking = this.booking;
        }
      }
      if (isEmpty(res.orders))
        return this.$emit("init-receipt", {
          success: false,
          message: "Record not found!",
        });

      this.$emit("init-receipt", res);
    } catch (error) {
      this.$emit("init-receipt", error);
    }
  },
};
</script>

<style scoped lang="scss">
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-block: 10px;
  padding-inline: 20px;
  .breadcrumb-item {
    display: flex;
    align-items: center;
    &:is(.active){
      color: $secondary-color-90;
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    }
    &:not(.active){
      color: $secondary-color-50;
    }
    i {
      font-size: 18px !important;
    }
  }
}
.suggested-content {
  width: 100%;
  padding-block: 24px;
}
.payment-container {
  width: 100%;
  height: auto !important;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: $secondary-color-10;
  &:is(.full-width){
    background: transparent !important;
  }
}
@media (min-width: 672px) {
  .payment-container {
    padding: 20px;
    .payment-wrapper {
      height: auto;
      width: 100%;
      max-width: 650px;
      margin: 0 auto;
      background: $white;
      border-radius: 12px;
    }
    &:is(.full-width){
      .payment-wrapper {
        max-width: 100% !important;
      }
    }
  }
}
</style>
