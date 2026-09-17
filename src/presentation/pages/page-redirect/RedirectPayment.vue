<template>
    <div class="redirect-content">
        <div class="redirect-wrapper">
            <span>{{ message }}</span>
            <div v-if="showButton" class="redirect-btn" @click="goHome()">Go Back</div>
            <div v-else class="processing"></div>
        </div>

        <base-modal :show="tryAgain">
            <template v-slot:header>
                <div class="modal-header header-flex">
                    <span class="material-icons-outlined" @click="toggleTryAgain()">close</span>
                    <h3>Information</h3>
                </div>
            </template>
            <template v-slot:body>
                <div class="modal-body">
                    <p>An error has occured while submitting your order.</p>
                    <p>Would you like to try again?</p>
                </div>
                <div class="modal-footer">
                    <div class="actions">
                        <div class="action-button light" @click="toggleTryAgain()">No</div>
                        <div class="action-button" @click="doAgain()">Yes</div>
                    </div>
                </div>
            </template>
        </base-modal>

        <base-modal :show="isProcessingOrder">
            <template v-slot:header>
                <div class="modal-header header-flex">
                    <h3>Orders Status</h3>
                </div>
            </template>
            <template v-slot:body>
                <div class="modal-body">
                    <div class="outlets-list">
                        <div class="outlet-item" v-for="one in orders" :key="one.cartId">
                            <span>{{ one.outlet.name }}</span>
                            <router-link :to="`/order-summary/${one.orderNumber}`" target="_blank" class="order-number" v-if="one.orderNumber">
                                Receipt #{{ one.orderNumber }}
                            </router-link>
                            <div class="in-progress" v-else-if="one.cartId == cartId && tries > 0">
                                Processing
                                <span class="processing"></span>
                            </div>
                            <div class="failed" v-else-if="isFailed(one)">
                                {{ one.message || 'Failed.' }} 
                                <span class="retry-button" @click="retryOrder(one)">Try Again</span>
                            </div>
                            <div class="waiting" v-else-if="one.cartId != cartId">Waiting</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" v-if="tries == 0">
                    <div class="actions">
                        <div class="action-button light" v-if="!isEmpty(errorOrders)" @click="processOrder">Try Again</div>
                        <div class="action-button" @click="viewAllReceipts">View All Receipts</div>
                    </div>
                </div>
            </template>
        </base-modal>
    </div>
</template>

<script>
import { eventService } from "@/bloc/services";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import { postOutletOrder } from "@/connector/v4/productConnector";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
export default {
    data() {
        return {
            loading: false,
            showButton: false,
            status: "FAILED",
            trackingId: "",
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
            isProcessingOrder: false,
            orders: [],
            errorOrders: [],
        };
    },
    mixins: [utility],
    computed: {
        multipleOutletOrders() {
            if (this.orderType == "event") {
                return [];
            }
            let items = localStorage.getItem("cartIds");
            let json = !isEmpty(items) ? JSON.parse(items) : [];
            return json;
        },
        errorMultipleOutletOrders() {
            if (this.orderType == "event") {
                return [];
            }
            let items = localStorage.getItem("errorCarts");
            let json = !isEmpty(items) ? JSON.parse(items) : {};
            return json;
        },
        currentOrder(){
            if (this.orderType == "event") {
                return null;
            }
            return this.orders?.find((o) => o.cartId == this.cartId);
        }
    },
    methods: {
        goHome() {
            // this.goTo('WelcomePage');
            this.$store.dispatch('setInited', false)
            if (this.orderType == "event") return this.$router.replace({ name: 'EventsPage' });
            this.$router.replace({name: 'CartPage'});
        },
        toggleTryAgain() {
            this.tryAgain = !this.tryAgain;
            if (!isEmpty(this.multipleOutletOrders) && !this.tryAgain) {
                this.processMultipleOutletOrders();
            }
        },
        async doAgain() {
            this.tries = 10;
            this.tryAgain = false;
            this.status = "SUCCESS";
            this.processOrder();
        },
        viewAllReceipts(){
            this.resetCart();
            const hasNumbers = this.orders?.filter((o) => o.orderNumber ? true : false);
            if(!hasNumbers?.length) return;
            const numbers = hasNumbers.map((o) => o.orderNumber);
            return this.goToWithParams("OrderSummary", {
                number: numbers.join("-")
            });
        },
        retryOrder(order){
            localStorage.setItem("errorCarts", JSON.stringify(this.errorOrders));
            localStorage.setItem("cartIds", JSON.stringify(this.orders));
            if(order.type == "MAYA_VAULT"){
                window.location.href = order.successUrl;
            } else {
                window.location.href = order.paymentLink;
            }
        },
        isFailed(order){
            if (this.orderType == "event") {
                return false;
            }
            let errors = this.errorOrders;
            return errors?.filter((err) => err.outlet.apiCode == order.outlet.apiCode).length > 0;
        },
        async processMultipleOutletOrders(orderNumber) {
            let orders = this.multipleOutletOrders;
            let errorCarts = this.errorMultipleOutletOrders;
            let currentIndex = orders.findIndex((o) => o.cartId == this.cartId);
            if (currentIndex > -1) {
                orders[currentIndex].orderNumber = orderNumber;
                orders[currentIndex].executed = true;
                orders[currentIndex].paid = this.amount > 0 ? true : false;
                orders[currentIndex].placed = orderNumber ? true : false;
                if (!orders[currentIndex].paid) {
                    orders[currentIndex].message = "Payment not received yet";
                    errorCarts = {
                        ...errorCarts,
                        [orders[currentIndex].outlet.apiCode]: orders[currentIndex].carts
                    };
                    localStorage.setItem("errorCarts", JSON.stringify(errorCarts));
                }
            }
            this.errorOrders = errorCarts;
            this.orders = orders;
            let oneIndex = orders.findIndex((o) => o.cartId != this.cartId && o.executed !== true);
            if (oneIndex == -1) {
                localStorage.removeItem('cartIds');
                localStorage.removeItem('errorCarts');
                const successOrder = this.orders.filter((o) => o.orderNumber != '');
                if(successOrder.length == this.orders.length) return this.viewAllReceipts();
                this.tries = 0;
                return;
            }
            orders[oneIndex].executed = true;
            localStorage.setItem("cartIds", JSON.stringify(orders));
            if(orders[oneIndex].type == "MAYA_VAULT"){
                window.location.href = orders[oneIndex].successUrl;
            } else {
                window.location.href = orders[oneIndex].paymentLink;
            }
        },
        async processOrder() {
            this.showButton = false;
            this.message = "Please wait...";
            let response = { success: false, message: "Payment failed/cancelled" };
            let orderRequest = {
                draft: false,
                test: false,
                cartId: this.cartId,
                /*
                payment: {
                    amount: parseFloat(this.amount),
                    accountKey: this.accountKey,
                    trackingId: this.trackingId,
                    type: "PAYMAYA",
                    status: this.status == "SUCCESS" ? 'PAID' : 'DRAFT',
                }
                */
            }
            if (this.status !== "SUCCESS") {
                if (!isEmpty(this.multipleOutletOrders)) {
                    return this.processMultipleOutletOrders();
                }
                this.message = response.message;
                this.showButton = true;
                return;
            }

            if (this.orderType == "event") {
                response = await eventService.bookEvent(orderRequest);
            } else {
                response = await postOutletOrder(orderRequest, this.outletCode);
            }

            this.tries--;

            if (!response.success) {
                if (this.tries == 0) {
                    if(this.isProcessingOrder) {
                        let orders = this.multipleOutletOrders;
                        let currentIndex = orders.findIndex((o) => o.cartId == this.cartId);
                        if (currentIndex > -1) {
                            orders[currentIndex].message = `${response.message || 'Failed'}. `;
                        }
                        this.orders = orders;
                        return this.processMultipleOutletOrders();
                    }
                    this.toggleTryAgain();
                    this.showButton = true;
                    this.message = "";
                    return;
                }
                return setTimeout(() => {
                    this.processOrder();
                }, this.timeOut);
            }

            let dataGA = this.generateGA(response);
            window.dataLayer.push(dataGA);
            console.log(this.multipleOutletOrders);
            if (!isEmpty(this.multipleOutletOrders)) {
                return this.processMultipleOutletOrders(response.order.number);
            }

            let page = 'TicketPage';
            if (this.orderType != "event") {
                page = 'OrderSummary';
            }
            this.goToWithParams(page, {
                number: response.order.number
            });
        },
    },
    watch: {},
    async created() {
        this.message = "Please wait...";
        this.outletCode = this.$route.params.outletCode;
        this.amount = this.$route.params.amount || 0;
        this.trackingId = this.$route.params.trackingId;
        this.cartId = this.$route.params.cartId;
        this.accountKey = this.$route.params.accountKey;
        this.orderType = this.$route.params.orderType;
        if (this.amount > 0) this.status = "SUCCESS";

        let self = this;
        let splitted = this.outletCode.split(`${EUNOIA_CONFIG.brandCode}$`);
        let code = splitted[splitted.length - 1];
        this.outletCode = code;
        this.orders = this.multipleOutletOrders;
        this.errorOrders = this.errorMultipleOutletOrders;
        if (!isEmpty(this.orders)) {
            this.isProcessingOrder = this.orders.length > 1;
        }
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
    .outlets-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        .outlet-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            flex-wrap:wrap;
            &:not(:last-child) {
                padding-bottom: 12px;
                border-bottom: 1px solid $secondary-color-20;
            }
        }
        .order-number {
            text-align: right;
            color: $success-green;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            cursor: pointer;
        }
        .in-progress {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            color: $primary-color-60;
            display: block;
        }
        .waiting {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            color: $link-blue-color;
        }
        .failed {
            display: flex;
            align-items: center;
            gap: 10px;
            color: $secondary-color-50;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            .retry-button {
                font-family: 'Berthold Akzidenz Grotesk Medium';
                font-size: 12px;
                border-radius: 24px;
                background: $primary-color-60;
                border: 1px solid $primary-color-60;
                padding-inline: 16px;
                height: 30px;
                display: flex;
                align-items: center;
                color: $white;
                text-align: center;
                cursor: pointer;
            }
        }
    }
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
                border-radius: 12px;
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