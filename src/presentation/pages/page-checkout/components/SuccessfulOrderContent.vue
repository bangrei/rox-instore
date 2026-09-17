<template>
    <div class="payment-body">
        <div class="row">
            <div class="order-info">
                 <div class="material-icons-outlined">task_alt</div>
                <span class="payment-success">Your {{ isPaid ? 'payment' : 'order' }} was successful</span>
                <small>A confirmation has been sent to your email.</small>
                <small>Kindly keep an eye for the updates.</small>
                <small style="margin-top: 20px;">{{ orderDate }}</small>
                <router-link to="/shop/fnb" class="back-home">Continue Shopping</router-link>
                <router-link to="/" class="back-home light">Back to Home</router-link>
            </div>
        </div>
        <div class="row">
            <div class="order-cards">
                <div class="order-card-trigger-list">
                    <div :class="['order-card-trigger', {'active': currentOrderNumber == one.number}]" 
                        v-for="one in order" :key="'trigger-' + one.number"
                        @click="activeOrderNumber = one.number">
                        {{ outletOrderName(one) }}
                    </div>
                </div>
                <div :class="['order-card-wrapper', {'active': currentOrderNumber == one.number}]" v-for="one in order" :key="one.number">
                    <div class="order-card">
                        <div class="order-card-container">
                            <div class="order-card-header">
                                <div class="order-card-header-left">
                                    <div class="order-number-wrapper">
                                        <div class="order-number-label">Order Summary</div>
                                        <small class="order-number-sublabel">
                                            Present your Order No. to the merchant to claim your order.
                                        </small>
                                        <div class="order-number-value">
                                            <span>Order No. {{ one.number }}</span>
                                            <router-link :to="'/order-details/' + one.number" class="order-link">
                                                <i class="material-icons">arrow_outward</i>
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="order-card-content">
                                <div class="card-product" v-for="(cart, i) in orderItems(one)" :key="i">
                                    <div class="product-img">
                                        <div class="product-img-wrapper">
                                            <img :src="getProductImage(cart)"/>
                                        </div>
                                        <div class="product-details">
                                            <span class="product-details-name">{{ cart.productName }}</span>
                                            <span class="product-details-variant" v-if="cart.variant">{{ cart.variantName }}</span>
                                            <span class="product-details-variant" v-if="cart.modifiers?.length">{{ cart.modifiers.map((m) => `${m.quantity}x ${m.modifierName}`).join(', ') }}</span>
                                        </div>
                                    </div>
                                    <div class="product-info">{{ currency(cart.total) }}</div>
                                </div>
                                <div class="card-total">
                                    <span class="card-total-label">{{ isPaid ? 'Total' : 'Unpaid' }}</span>
                                    <span class="card-total-value">{{ currency(one.total) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="shipping-container" v-if="isDeliveryOrder">
                <div class="shipping-wrapper">
                    <div class="shipping-label">
                        <span class="material-icons-outlined">{{ isDeliveryOrder ? 'local_shipping' : 'hail' }}</span>
                        <span>{{ isDeliveryOrder ? 'Deliver to my address' : orderTypeDisplay }}</span>
                    </div>
                    <span class="shipping-address" v-if="isDeliveryOrder">{{ deliveryAddressString }}</span>
                    <div class="eta-content">
                        <span>{{ isDeliveryOrder ? 'Delivery ' : 'Fulfillment ' }} estimate by {{ outletEtaDate }}</span>
                        <small>Fullfiled by <b>{{ outletName }}</b></small>
                    </div>
                    <div class="payment-accordion">
                        <input type="checkbox" checked>
                        <div class="payment-accordion-title">
                            Payment Summary
                            <i class="material-icons accordion-icon">chevron_right</i>
                        </div>
                        <div class="payment-accordion-content">
                            <b>Total</b>
                            <div class="payment-total-content">
                                <button>{{ paymentStatus }}</button>
                                <span>{{ currency(totalOrders) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "SuccessfulOrderContent",
	mixins: [utility],
    props: {
		order: {
			type: Array,
			default: () => [],
		},
        orderNumber: {
			type: String,
			default: "",
		},
        hideHeader: {
            type: Boolean,
            default: false,
        }
	},
	data() {
		return {
            activeOrderNumber: "",
        }
	},
	watch: {},
    computed: {
        currentOrderNumber(){
            if(isEmpty(this.order)) return "";
            if(!this.activeOrderNumber){
                return this.order[0].number;
            }
            return this.activeOrderNumber;
        },
        totalOrders(){
            let amount = 0;
            for(let i=0; i<this.order.length;i++){
                amount += this.order[i].total;
            }
            return amount;
        },
        isPaid(){
            if(isEmpty(this.orderPayments)) return false;
            return this.orderPayments.filter((it) => it.status == "PAID").length > 0;
        },
        paymentStatus() {
            if (isEmpty(this.orderPayments)) {
                return this.isDeliveryOrder ? 'Cash on Delivery' : 'Cash';
            }
            let isPaid = this.orderPayments.filter((it) => it.status == "PAID").length > 0;
            let isrefunded = this.orderPayments.filter((it) => it.refunded).length > 0;
            if (isrefunded) return 'Refunded';
            return isPaid ? 'Paid' : 'Unpaid';
        },
        orderType() {
            if(isEmpty(this.order)) return "";
            return this.order[0].orders[0].type;
        },
        isDeliveryOrder() {
            return ["DELIVERY", "RETAIL_DELIVERY"].includes(this.orderType);
        },
        orderTypeDisplay() {
            if (this.isDeliveryOrder) return "Delivery";
            return "Pick up at store";
        },
        deliveryAddress() {
            if (!this.isOmisell) return null;
            if(isEmpty(this.order)) return null;
            let one = this.order.find((it) => {
                return it.orders.filter((o) => !isEmpty(o.address)).length > 0;
            });
            let order = one.orders.find((o) => !isEmpty(o.address));
            if (!order) return null;
            return {
                title: order.address.title,
                string: order.address.string
            }
        },
        deliveryAddressTitle() {
            let addr = this.deliveryAddress;
            if (isEmpty(addr)) return "";
            return addr.title;
            
        },
        deliveryAddressString() {
            if (!this.isOmisell) return "";
            let addr = this.deliveryAddress;
            if (isEmpty(addr)) return "Address: -";
            return addr.string;
        },
        isOmisell() {
            if (isEmpty(this.outletOrder)) return false;
            return this.outletOrder.filter((it) => {
                return it.enableOmisellIntegration == true && it.stores.filter((s) => { return s.delivery }).length > 0
            }).length > 0;
        },
        outletOrder() {
            if(isEmpty(this.order)) return [];
            let outletIds = this.order.map((it) => it.outlet.id);
            return this.$store.getters.getOutlets.filter((it) => {
                return outletIds.includes(it.id);
            });
        },
        outletName(){
            if(isEmpty(this.outletOrder)) return "";
            let names = this.outletOrder.map((it) => it.name);
            return names.join(", ");
        },
        storeName(){
            if(isEmpty(this.order)) return "";
            let names = [];
            for(let i=0; i<this.order.length;i++){
                let name = this.order.orders[0].storeName;
                if(!names.includes(name)) names = [...names, name]
            }
            return names.join(", ");
        },
        outletEtaDate(){
            if(isEmpty(this.order)) return "";
            let orders = this.order[0].orders;
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
        orderDate(){
            if(isEmpty(this.order)) return "";
            return moment.tz(this.order[0].placeTime, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        customerName(){
            if(isEmpty(this.order)) return "";
            let names = [];
            if(this.order[0].customer.firstName) names.push(this.order[0].customer.firstName);
            if(this.order[0].customer.lastName) names.push(this.order[0].customer.lastName);
            return names.join(' ');
        },
        customerEmail(){
            if(isEmpty(this.order)) return "";
            return this.order[0].customer.email;
        },
        outletDiscounts() {
            let items = [];
            for(let i =0; i<this.order.length;i++){
                items = [...items, this.order[i].discounts]
            }
            return items;
        },
        groupedExtraCharges() {
            if (isEmpty(this.order)) return [];
            let orders = [];
            for(let i=0; i< this.order.length;i++){
                orders = [...orders, [...this.validOrder(this.order[i])]]
            }
            if (isEmpty(orders)) return [];
            let charges = [];
            orders.forEach((o) => {
                let extras = o.extraCharges;
                if (!isEmpty(extras)) {
                    extras.forEach((item) => {
                        let it = { ...item }
                        let idx = charges.findIndex((x) => {
                            return x.percentage == it.percentage && x.type == it.type && x.name == it.name && x.inclusive == it.inclusive;
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
            for(let i=0; i<this.order.length;i++){
                const orderJSON = JSON.parse(JSON.stringify({ ...this.order[i] }));
                if (!isEmpty(orderJSON?.orderDiscounts)) {
                    discounts = new Set([...discounts, ...orderJSON.orderDiscounts]);
                }
                const outletDiscounts = JSON.parse(JSON.stringify({ disc: this.outletDiscounts }));
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
            }
            if (isEmpty(discounts)) return [];

            // make discounts unique, eliminate duplicated data:
            let arr = Array.from(discounts).filter((value, index, self) =>
                index === self.findIndex((t) => t.reason === value.reason && t.id == value.id)
            );
            let items = [];
            for (let i = 0; i < arr.length; i++){
                let ix = items.findIndex((it) => it.reason == arr[i].reason);
                if (ix > -1) items[ix].amount += arr[i].amount;
                else items.push(arr[i]);
            }
            return items;
        },
        orderPayments() {
            let payments = [];
            for(let i=0; i<this.order.length;i++){
                const orderJSON = JSON.parse(JSON.stringify({ ...this.order[i] }));
                payments = new Set([...payments, ...orderJSON.payments]);
            }
            return Array.from(payments).filter((value, index, self) =>
                index === self.findIndex((t) => t.trackingId === value.trackingId && t.status === value.status)
            );
        }
    },
    methods: {
        outletOrderName(one){
            const outlet = this.$store.getters.getOutlets.find((it) => it.id == one.outlet.id);
            return outlet ? outlet.name : 'Unknown outlet';
        },
        orderItems(one){
            let items = [];
            for(let i=0; i < one.orders.length;i++){
                items = [...items, ...one.orders[i].items];
            }
            return items;
        },
        productUrl(order, productId, productName) {
            let storeId = order.store;
            let outlet = this.$store.getters.getOutlets?.find((it) => it.stores.filter((s) => s.id == storeId).length > 0);
            if (!outlet) return '/';
            let names = productName.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                if (it.toUpperCase() == it) return it;
                return it.toLowerCase();
            });
            return `/product/${productId}/${names.join('-')}`;
        },
        etaDate(order){
            if(isEmpty(order)) return "";
            let eta = order.etaTime;
            let placeTime = this.order[0].placeTime;
            if(!eta){
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
        getProductImage(cart) {
            let img = cart.imageId;
            let products = this.$store.getters.getProducts;
            let prd = products?.find((it) => it.id == cart.product);
            if (prd) {
                let images = prd.images;
                img = prd.imageId;
                if (!img) img = prd.image2Id;
                if (!img) img = prd.image3Id;
                if (this.hasVariant(cart)) {
                    let variant = prd.variants.find((it) => it.id == cart.variant);
                    if (variant) images = variant.images;
                }
                if (!isEmpty(images)) {
                    images.sort((a, b) => a.sortIndex - b.sortIndex);
                    img = images[0].id;
                }
            }
            if (!img) return require('@/assets/images/rox-logo-2025.jpeg');
            return this.$store.getters.cloudinaryURL + img;
        },
        hasVariant(cart){
            return cart.variant != null;
        },
        getVariant(cart) {
            return cart.variantName;
        },
        hasModifiers(cart){
            return !isEmpty(cart.modifiers);
        },
        getModifiers(cart){
            let modifiers = [];
            if(!isEmpty(cart.modifiers)){
                cart.modifiers.forEach((mod) => {
                    modifiers.push(`${mod.quantity}x ${mod.modifierName}`);
                });
            }
            return modifiers.join(', ');
        },
        formatDate(date){
            return moment.tz(date,'Asia/Singapore').format("ddd, DD MMMM YYYY");
        },
        formatTimes(d){
            return moment.tz(d.startDate,'Asia/Singapore').format("HH:mm") + " - " + moment.tz(d.endDate,'Asia/Singapore').format("HH:mm");
        },
        copy(){
            try {
                this.$refs.copyNumber.focus();
                this.$refs.copyNumber.select();
                document.execCommand('copy');
                this.$refs.copyNumber.blur();
                this.showNotification("success", "done", "Copied");
            } catch(error) {
                this.showNotification("alert", "error_outline", error);
            }
        },
        hasPromoPrice(cart) {
            let products = this.$store.getters.getProducts || [];
            let prd = products.find(it => it.id == cart.product);
            if (!prd) return null;
            let price = cart.total / cart.quantity;
            if (prd.promoPrice > 0 && price !== prd.originalPrice) return this.currency(prd.originalPrice * cart.quantity);
            return null;
        }
    }
};
</script>
<style scoped lang="scss">
    .order-header-con {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0px;
        padding: 24px;
        color: $secondary-color-60;
        font-size: 1.2em;
        text-align: center;
        color: $white;

        .order-congrats {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            small {
                font-size: 15px;
            }
            .order-congrats-icon {
                font-size: 2.5em;
                color: $success-green;
            }
            .order-congrats-text {
                font-size: 18px;
                line-height: 1.2em;
                color: $white;
                font-weight: bold;
            }
        }
    }
    .payment-body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: grid;
        gap: 20px;
        font-size: 15px;
    }
    .row {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 100%;
        overflow: hidden;
    }
    .order-info {
        margin-top: 40px;
        width: 100%;
        padding-inline: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        small {
            font-size: 15px !important;
        }
        img {
            width: 70px;
            margin-inline: auto;
            object-fit: contain;
        }
        .material-icons-outlined, .material-icons {
            color: $main-red;
            font-size: 6em !important;
        }
        .payment-success {
            text-align: center;
            font-size: 18px;
            margin-inline: auto;
            width: fit-content;
            display: block;
            padding-block: 16px;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        }
        .back-home {
            background: $main-red;
            color: $white;
            padding: 8px 24px;
            border-radius: 999px;
            outline: none;
            border: 1px solid transparent;
            margin-top: 16px;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            cursor: pointer;
            text-decoration: none;
            min-width: 220px;
            text-align: center;
            &:is(.light){
                color: $main-red !important;
                background: transparent !important;
                border-color: $main-red !important;
            }
        }

        .order-header {
            font-family: 'Berthold Akzidenz Grotesk';
            width: fit-content;
            margin: 0 auto;
            display: block;
            font-size: 0.9em;
        }
        .order-number {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            width: fit-content;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            font-size: 2em;
            color: $primary-color-60;
            padding: 16px;
            gap: 35px;
            position: relative;

            .copy-ticket {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                width: 100%;
                position: relative;

                input {
                    border: none;
                    margin: 0 auto;
                    text-align: right;
                    background: transparent;
                    color: $primary-color-60;
                    outline: none;
                    width: 100%;
                    opacity: 0;
                    position: absolute;
                }
            }
            .copy-icon {
                cursor: pointer;
                position: absolute;
                right: -24px;
                top: 0;
            }
        }
        .order-date {
            font-family: 'Berthold Akzidenz Grotesk';
            width: fit-content;
            margin: 0 auto;
            display: block;
            font-size: 0.8em;
            color: $secondary-color-60;
        }
    }
    .order-cards {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0;
        padding-inline: 24px;
        .order-card-trigger-list {
            width: 100%;
            display: flex;
            align-items: center;
            max-width: 100%;
            overflow-x: auto;
            border-radius: 20px 20px 0 0;
        }
        .order-card-trigger {
            cursor: pointer;
            width: fit-content;
            padding: 10px 20px;
            border-radius: 20px 20px 0 0;
            background: $secondary-color-20;
            display: flex;
            align-items: center;
            text-align: left;
            white-space: nowrap;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            &:is(.active){
                background: $main-red;
                color: $white;
            }
        }
        .order-card-container {
            width: 100%;
            max-height: 500px;
            overflow: hidden;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            padding: 12px;
        }
        .order-card {
            border-radius: 0 0 20px 20px;
            width: 100%;
            background: $white;
            display: none;
            gap: 16px;
            border: 1px solid $secondary-color-20;
            .order-card-header {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                .order-card-header-left {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .order-number-wrapper {
                    display: flex;
                    flex-direction: column;
                }
                .order-number-label {
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                .order-number-sublabel {
                    font-size: 14px;
                }
                .order-number-value {
                    font-size: 20px;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    color: $main-red;
                    margin-block: 10px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    .order-link {
                        text-decoration: none;
                        cursor: pointer;
                        outline: none;
                        color: $main-red;
                        .material-icons, .material-icons-outlined {
                            font-size: 18px !important;
                            margin-left: 4px;
                        }
                    }
                }
                .order-card-button {
                    outline: none;
                    border: none;
                    border-radius: 24px;
                    background: $primary-color-20;
                    color: $main-red;
                    padding: 6px 24px;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    cursor: pointer;
                    text-decoration: none;
                    width: fit-content;
                    text-align: center;
                }
            }
            .order-card-content {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 20px;
                .card-product {
                    display: flex;
                    gap: 10px;
                    justify-content: space-between;
                    width: 100%;
                    .product-img {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        gap: 10px;
                    }
                    .product-img-wrapper {
                        border: 1px solid $secondary-color-30;
                        border-radius: 8px;
                        width: 100px;
                        aspect-ratio: 4/3;
                    }
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }
                    .product-info {
                        color: $secondary-color-90;
                        text-align: right;
                    }
                    .product-details {
                        display: flex;
                        flex-direction: column;
                        .product-details-name {
                            font-size: 16px;
                            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                        }
                        .product-details-variant {
                            font-size: 14px;
                        }
                    }
                }
                .card-total {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding-top: 20px;
                    border-top: 1px solid $secondary-color-20;
                    .card-total-label {
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    }
                    .card-total-value {
                        text-align: right;
                    }
                }
            }
        }
        .order-card-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            &:is(.active){
                .order-card {
                    display: flex;
                    flex-direction: column;
                    padding: 8px;
                }
            }
        }
    }
    .shipping-container {
        padding-inline: 24px;
        width: 100%;
        margin-bottom: 24px;
        .shipping-wrapper {
            width: 100%;
            padding-block: 24px;
            border-radius: 8px;
            background: $white;
            display: flex;
            flex-direction: column;
            gap: 12px;
            border: 1px solid $secondary-color-20;
        }
        .shipping-label {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            color: $secondary-color-60;
            position: relative;
            padding-bottom: 12px;
            padding-inline: 24px;
            &::before {
                content: "";
                position: absolute;
                bottom: 0;
                height: 3px;
                left: 24px;
                right: 24px;
                background: repeating-linear-gradient(
                    to right,
                    $primary-color-60 0,
                    $primary-color-60 15px,
                    $white 15px,
                    $info-light 25px,
                    $white 40px,
                );
            }
        }
        .shipping-address {
            padding-inline: 24px;
        }
        .eta-content {
            background: rgba(16, 185, 129, 0.08);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-weight: bold;
            small {
                font-weight: normal;
                color: $secondary-color-60;
            }
        }
        .payment-accordion {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-top: 8px;
            position: relative;
            input {
                position: absolute;
                right: 24px;
                z-index: 2;
                width: 30px;
                height: 20px;
                opacity: 0;
                cursor: pointer;
                &:hover {
                    & + .payment-accordion-title .accordion-icon {
                        opacity: 0.6;
                    }
                }
                &:checked {
                    & + .payment-accordion-title {
                        & .accordion-icon {
                            transform: rotate(90deg);
                            -webkit-transform: rotate(90deg);
                        }
                        & + .payment-accordion-content {
                            height: 30px;
                            width: 100%;
                        }
                    }
                }
            }
            .payment-accordion-title {
                padding-inline: 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: bold;
                font-size: 1em;
                padding-bottom: 12px;
                border-bottom: 1px solid $secondary-color-20;
                .accordion-icon {
                    pointer-events: none;
                    transition: all 0.3s ease-in-out;
                    -webkit-transition: all 0.3s ease-in-out;
                }
            }
            .payment-accordion-content {
                height: 0;
                overflow: hidden;
                transition: all 0.2s ease-in-out;
                -webkit-transition: all 0.2s ease-in-out;
                padding-inline: 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .payment-total-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: bold;
                    button {
                        outline: none;
                        border: none;
                        background: #10B981;
                        padding: 3px 16px;
                        font-size: small;
                        color: $white;
                        border-radius: 12px;
                        font-weight: bold;
                    }
                }
            }
        }
    }
    @media (min-width: 672px) {
        .payment-body {
            grid-template-columns: 1fr 1fr;
        }
    }
    @media (min-width: 672px) and (max-width: 820px) {
        .payment-body {
            grid-template-columns: 1fr !important;
        }
    }
</style>