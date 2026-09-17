<template>
	<div class="payment-container" v-if="orderNumber">
        <div class="payment-wrapper">
            <order-content :hide-header="hideHeader" :order="order" :order-number="orderNumber"></order-content>
        </div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { eventService } from "@/bloc/services";
import OrderContent from './OrderContent.vue';
import { getOrder } from "@/connector/v4/productConnector";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "ReceiptContent",
	mixins: [utility],
    components: {
        OrderContent
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
        }
	},
	data() {
		return {
            booking: null,
            order: null,
		};
	},
	watch: {},
	computed: {
        orderDate(){
            if(isEmpty(this.booking)) return "";
            return moment.tz(this.booking.placeTime, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        customerName(){
            if(isEmpty(this.booking)) return "";
            let names = [];
            if(this.booking.customer.firstName) names.push(this.booking.customer.firstName);
            if(this.booking.customer.lastName) names.push(this.booking.customer.lastName);
            return names.join(' ');
        },
        customerEmail(){
            if(isEmpty(this.booking)) return "";
            return this.booking.customer.email;
        },
    },
	methods: {
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
        }
    },
	async created() {
		try {
            if(!isEmpty(this.orderObject)){
                this.order = this.orderObject;
                this.$emit("init-receipt", this.order);
                return;
            }
            await this.refreshMainData(true);
            let orderId = this.$route.params.orderId;
            let res = await eventService.getEventDetails(this.orderNumber);
            if(isEmpty(res.orders)) {
                res = await getOrder(this.orderNumber);
                if(!isEmpty(res.orders)){
                    let order = res.orders.sort((a,b) => { return b.id - a.id }).find((it) => {
                        if(orderId) return it.id == orderId;
                        return it.number == this.orderNumber && !isEmpty(it.payments);
                    });
                    if(!isEmpty(order)){
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
                                pm.refunded = refunds.filter((ref) => {
                                    return ref.type == pm.type;
                                }).length > 0;
                                switch(type){
                                    case "PAYMAYA":
                                        pm.logo = require('@/assets/images/paymaya-logo.png');
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
                    this.order = res.orders.find((it) => {
                        if(orderId) return it.id == orderId;
                        return it.number == this.orderNumber
                    });
                    res.order = this.order;
                }
            } else {
                this.booking = res.orders.find((it) => {
                    return it.number == this.orderNumber
                });
                if(!isEmpty(this.booking)) {
                    let refunds = this.booking.payments.filter((p) => {
                        return p.status == "REFUNDED";
                    });
                    this.booking.payments = this.booking.payments.filter((p) => {
                        return p.status == "PAID";
                    });
                    this.booking.payments.map((pm) => {
                        let type = pm.type.toUpperCase();
                        pm.refunded = refunds.filter((ref) => {
                            return ref.type == pm.type;
                        }).length > 0;
                        switch(type){
                            case "PAYMAYA":
                                pm.logo = require('@/assets/images/paymaya-logo.png');
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
            if(isEmpty(res.orders)) return this.$emit("init-receipt", {success: false, message: "Record not found!"});
            
            this.$emit("init-receipt", res);
		} catch (error) {
			this.$emit("init-receipt", error);
		}
	},
};
</script>

<style scoped lang="scss">
    .payment-container {
        width: 100%;
        height: auto !important;
        display: flex;
        flex-direction: column;
        text-align: left;
    }
    @media (min-width: 672px) {
        .payment-container {
            // background: $primary-color-20;
            padding-block: 16px;

            .payment-wrapper {
                height: auto;
                width: 100%;
                max-width: 650px;
                margin: 0 auto;
                background: $white;
            }
        }
	}
</style>