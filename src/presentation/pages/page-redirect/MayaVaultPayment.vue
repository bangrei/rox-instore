<template>
    <div class="redirect-content">
        <div class="redirect-wrapper">
            <span>{{ message }}</span>
            <div v-if="showButton" class="redirect-btn" @click="goHome()">Go Back</div>
            <div v-else class="processing"></div>
            <small v-if="subMessage">{{ subMessage }}</small>
        </div>
    </div>
</template>

<script>
import { productService } from "@/bloc/services";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
export default {
    name: "MayaVaultPayment",
    data() {
        return {
            loading: false,
            showButton: false,
            status: "FAILED",
            cartId: "",
            amount: 0,
            accountKey: "",
            currentStoreId: "",
            outletCode: "",
            message: "",
            tryAgain: false,
            tries: 10,
            timeOut: 8000,
            orderType: "",
        };
    },
    mixins: [utility],
    computed: {
        errorMultipleOutletOrders() {
            if (this.orderType == "event") {
                return [];
            }
            let items = localStorage.getItem("errorCarts");
            let json = !isEmpty(items) ? JSON.parse(items) : [];
            return json;
        },
        multipleOutletOrders() {
            let items = localStorage.getItem("cartIds");
            let json = !isEmpty(items) ? JSON.parse(items) : [];
            if(!isEmpty(json)){
                let redirectFE = `${window.location.origin}/redirect/payment`;
                json = json.map((order) => {
                    let successUrl = `${redirectFE}/order/${order.outlet.apiCode}/${order.trackingId}/${order.accountKey}/${order.cartId}/${order.amount}`;
                    let failUrl = `${redirectFE}/order/${order.outlet.apiCode}/${order.trackingId}/${order.accountKey}/${order.cartId}/0`;
                    order.successUrl = successUrl;
                    order.failUrl = failUrl;
                    order.executed = false;
                    return order;
                });
            }
            return json;
        },
        mayaVaultOrders(){
            let orders = this.multipleOutletOrders;
            return orders || [];
        },
        subMessage(){
            let errorCarts = this.errorMultipleOutletOrders;
            if(isEmpty(errorCarts)) return "";
            return errorCarts?.map((it) => {
                return `Unable to proceed payment at outlet ${it.outlet.name}: ${it.error?.message || 'Something went wrong!'}`;
            })?.join('. ');
        }
    },
    methods: {
        goHome() {
            // this.goTo('WelcomePage');
            this.$store.dispatch('setInited', false)
            if (this.orderType == "event") return this.$router.replace({ name: 'EventsPage' });
            this.$router.replace({name: 'CartPage'});
        },
        async processMayaVaultOrders(){
            let orders = this.mayaVaultOrders;
            let errorCarts = this.errorMultipleOutletOrders;
            let successPayments = [];
            let index = 0;
            if(isEmpty(orders)){
                this.message = "Payment failed/cancelled";
                this.showButton = true;
                return
            }
            const createPayment = async () => {
                const order = orders[index];
                const {amount, cardToken, paymentTokenId, cartId, currency, accountKey, trackingId, successUrl} = order;
                let payload = {
                    amount, 
                    cardTokenId: cardToken || 0, 
                    paymentTokenId, 
                    cartId, 
                    currency, 
                    accountKey, 
                    trackingId
                }
                const res = await productService.mayaVaultCreatePayment(payload);
                if(res?.success) {
                    successPayments.push(order);
                } else {
                    errorCarts.push({
                        outlet: order.outlet,
                        carts: order.carts,
                        error: res,
                    });
                    localStorage.setItem("errorCarts", JSON.stringify(errorCarts));
                }
                index++;
                if(index < orders.length) return createPayment();
                if(isEmpty(successPayments)){
                    this.showButton = true;
                    this.message = errorCarts?.map((it) => {
                        return `Unable to proceed payment at outlet ${it.outlet.name}: ${it.error?.message || 'Something went wrong!'}`;
                    })?.join('. ');
                    localStorage.removeItem('cartIds');
                    localStorage.removeItem('errorCarts');
                    return;
                }
                localStorage.setItem("cartIds", JSON.stringify(orders));
                window.location.href = successUrl;
            }
            if (this.orderType == "event") {
                const {amount, token, paymentTokenId, cartId, currency, accountKey, trackingId} = orders;
                let payload = {
                    amount, 
                    cardTokenId: token || 0, 
                    paymentTokenId, 
                    cartId, 
                    currency, 
                    accountKey, 
                    trackingId
                }
                const res = await productService.mayaVaultCreatePayment(payload);
                localStorage.removeItem('cartIds');
                if(res?.success) {
                    successPayments.push(orders);
                }

                let redirectFE = `${window.location.origin}/redirect/payment`;
                if(isEmpty(successPayments)){
                    this.showButton = true;
                    this.message = `Unable to proceed payment. ${res?.message || 'Something went wrong!'}`;
                    return;
                }
                let successUrl = `${redirectFE}/event/${this.outletCode}/${orders.trackingId}/${orders.accountKey}/${orders.cartId}/${orders.amount}`;
                window.location.href = successUrl;
            } else {
                createPayment();
            }
        },
        async processOrder() {
            this.showButton = false;
            this.message = "Please wait...";
            if (this.status !== "SUCCESS") {
                this.message = "Payment failed/cancelled";
                this.showButton = true;
                return;
            }
            this.processMayaVaultOrders();
        },
    },
    watch: {},
    async created() {
        this.message = "Please wait...";
        this.outletCode = this.$route.params.outletCode;
        this.amount = this.$route.params.amount || 0;
        this.cartId = this.$route.params.cartId;
        this.accountKey = this.$route.params.accountKey;
        this.orderType = this.$route.params.orderType;
        if (this.amount > 0) this.status = "SUCCESS";

        let self = this;
        let splitted = this.outletCode.split(`${EUNOIA_CONFIG.brandCode}$`);
        let code = splitted[splitted.length - 1];
        this.outletCode = code;
        await this.refreshMainData(false, () => {
            let outlets = self.$store.getters.getOutlets;
            let outlet = outlets.find((o) => {
                return o.apiCode == code;
            });
            self.$store.dispatch("setCurrentOutlet", outlet);
            self.processOrder();
        }, code);
    }
};
</script>
<style scoped lang="scss">
    @keyframes processingAnim {
        0% { 
            width: 0;
            background: linear-gradient(90deg, $primary-color-60 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $primary-color-60 100%, $secondary-color-20);
        }
        }
    @-webkit-keyframes processingAnim {
        0% {
            width: 0;
            background: linear-gradient(90deg, $primary-color-60 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $primary-color-60 100%, $secondary-color-20);
        }
    }
    .processing {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 250px;
        margin: 0 auto;
        height: 16px;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: $secondary-color-20;
        &::before {
            position: absolute;
            content: "";
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            color: $white;
            margin: 0 auto;
            height: 16px;
            bottom: 0;
            left: 0;
            transition: all 1s;
            -webkit-transition: all 1s;
            animation: processingAnim 1s ease-in-out infinite;
            -webkit-animation: processingAnim 1s ease-in-out infinite;
            z-index: 1;
        }
        &::after {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            content: "";
            z-index: 2;
            background: linear-gradient(90deg, $secondary-color-20, transparent);
        }
    }
    .redirect-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $secondary-color-70;

        .redirect-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 24px;

            .redirect-btn {
                width: 100%;
                max-width: 200px;
                margin: 0 auto;
                padding: 8px 32px;
                text-align: center;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                border-radius: 999px;
                background: $primary-color-60;
                color: $white;
                cursor: pointer;
            }
        }
    }
    .actions {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 24px;

        .action-button {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            flex: 1;
            border-radius: 12px;
            background: $primary-color-60;
            border: 1px solid $primary-color-60;
            padding: 16px;
            color: $white;
            font-weight: bold;
            text-align: center;
            cursor: pointer;

            &.light {
                border: 1px solid $primary-color-60;
                background: $white;
                color: $primary-color-60;
            }
        }
    }
</style>