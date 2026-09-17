<template>
    <div class="payment-body">
        <div class="order-header-con" v-if="!hideHeader && orderDate">
            <div class="order-congrats">
                <div class="order-congrats-text">Order placed on</div>
            </div>
            <small>{{ orderDate }}</small>
        </div>
        <div class="order-info">
            <img :src="require('@/assets/images/celebration.png')"/>
            <span class="payment-success">Your payment was successful</span>
            <small>We're preparing your order.</small>
            <small>A confirmation has been sent to your email.</small>
            <button class="back-home" @click="goTo('ShopPage')">Back to Home</button>
        </div>

        <div class="order-cards">
            <div class="order-card">
                <div class="order-card-header">
                    <div class="order-card-header-left">
                        <i class="material-icons-outlined">shopping_bag</i>
                        <div class="order-number-wrapper">
                            <span class="order-number-label">Event</span>
                            <span>{{ booking?.items.length }} ticket{{ booking?.items.length > 1 ? 's' : '' }}</span>
                        </div>
                    </div>
                    <router-link :to="'/booking-details/' + orderNumber" class="order-card-button">See Order</router-link>
                </div>
                <div class="order-card-content">
                    <div class="card-product">
                        <div class="product-img">
                            <img :src="getEventImage"/>
                        </div>
                        <div class="product-info">{{ booking?.items.length }}x</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="shipping-container">
            <div class="shipping-wrapper">
                <div class="payment-accordion">
                    <input type="checkbox" checked>
                    <div class="payment-accordion-title">
                        Payment Summary
                        <i class="material-icons accordion-icon">chevron_right</i>
                    </div>
                    <div class="payment-accordion-content">
                        <div class="payment-accordion-item">
                            <span>Paid With</span>
                            <span>{{ paidWith }}</span>
                        </div>
                        <div class="payment-accordion-item" v-for="(addon, n) in addonsCharges" :key="n">
                            <div class="addons-label-wrapper" v-html="toHTML(addon.desc)"></div>
                            <span>{{ currency(addon.amount) }}</span>
                        </div>
                        <div class="payment-accordion-item"  v-for="(disc, ix) in (booking?.discounts || [])" :key="ix">
                            <span>{{ disc.reason }} {{ disc.percentage > 0 ? ('(' + disc.percentage + '%)') : ''}}</span>
                            <span>-{{ currency(disc.amount) }}</span>
                        </div>
                        <div class="payment-accordion-item">
                            <span>Order Total</span>
                            <span>{{ currency(booking?.subTotal) }}</span>
                        </div>
                        <div class="payment-accordion-item">
                            <b>Total</b>
                            <div class="payment-total-content">
                                <button>{{ paymentStatus }}</button>
                                <span>{{ currency(bookingAmount) }}</span>
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
import { eventService } from "@/bloc/services";

export default {
	name: "SuccessfulOrderContent",
	mixins: [utility],
    props: {
		booking: {
			type: Object,
			default: () => {},
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
            event: {}
        }
	},
	watch: {},
    computed: {
        getEventImage() {
            if (isEmpty(this.event)) return require('@/assets/images/rox-logo-2025.jpeg');;
            let banners = this.event.banners;
            if (isEmpty(banners)) return require('@/assets/images/rox-logo-2025.jpeg');
            return this.$store.getters.cloudinaryURL + banners[0].id;

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
        bookingAmount() {
            if (isEmpty(this.booking)) return 0;
            return this.booking.total;
        },
        addonsCharges() {
            if (isEmpty(this.booking)) return [];
            return this.booking.items?.map((it) => {
                return {
                    amount: it.ticket?.addOnAmount || 0,
                    desc: it.ticket?.additionalInfo
                }
            }).filter((it) => {
                return it.amount > 0;
            });
        },
        orderPayments() {
            const orderJSON = JSON.parse(JSON.stringify({ ...this.booking }));
            let payments = new Set([...orderJSON.payments]);
            return Array.from(payments).filter((value, index, self) =>
                index === self.findIndex((t) => t.trackingId === value.trackingId && t.status === value.status)
            );
        },
        paidWith() {
            let payments = this.orderPayments;
            if (isEmpty(payments)) return "Cash";
            return payments[0].type.replaceAll("_"," ");
        }
    },
    methods: {
        toHTML(str){
            const containsHtml = /<[^>]+>/.test(str);
            if(!containsHtml) return str;
            if(str.startsWith('[')){
                str = str.slice(1);
            }
            if(str.endsWith(']')){
                str = str.slice(0, -1);
            }
            let parts = str.split(/(<\/[^>]+>[^,]*),\s*/g);
            let results = [];
            for (let i = 0; i < parts.length; i += 2) {
                const label = parts[i] || '';
                const closingTag = parts[i + 1] || '';
                results.push((label + closingTag).trim());
            }
            return results?.map((it) => {
                let items = it.trim().split(/(<\/[^>]+>[^:]*):\s*/g);
                let itemMap = [];
                for (let n = 0; n < items.length; n += 2) {
                    const lbl = items[n] || '';
                    const cls = items[n + 1] || '';
                    itemMap.push((lbl + cls).trim());
                }
                return `<div class="addons-label-parts">${itemMap?.join('')}</div>`;
            })?.join('');
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
    },
    async created() {
        let item = this.booking.items ? this.booking.items[0] : null;
        if (!item) return;
        let json = await eventService.getEvents();
        this.event = json.events.find((event) => {
            return event.sessions.filter((sess) => {
                return item.productName == `${event.name} ${sess.period}`
            }).length > 0;
        });
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

            .order-congrats-icon {
                font-size: 2.5em;
                color: $success-green;
            }
            .order-congrats-text {
                font-size: large;
                line-height: 1.2em;
                color: $white;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            }
        }
    }
    .payment-body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        overflow-y: auto;
        background: linear-gradient(#10B981 30%, #FFF);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        font-size: 15px;
    }
    .order-info {
        width: 100%;
        padding-inline: 24px;
        color: $white;
        display: flex;
        flex-direction: column;
        align-items: center;
        small {
            font-size: 15px !important;
        }

        img {
            width: 70px;
            margin-inline: auto;
            object-fit: contain;
        }
        .payment-success {
            color: $white;
            text-align: center;
            font-size: 24px;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            margin-inline: auto;
            width: fit-content;
            display: block;
            padding-block: 16px;
        }
        .back-home {
            background: $secondary-color-70;
            padding: 8px 24px;
            border-radius: 24px;
            outline: none;
            border: none;
            margin-top: 16px;
            color: $white;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            font-size: 17px;
            cursor: pointer;
            line-height: 26px;
            letter-spacing: 0px;
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
        gap: 16px;
        padding-inline: 24px;
        .order-card {
            border-radius: 8px;
            width: 100%;
            background: $white;
            display: flex;
            flex-direction: column;
            padding: 24px;
            gap: 16px;
            border: 1px solid $secondary-color-20;
            .order-card-header {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
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
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;;
                    & + * {
                        color: $secondary-color-70;
                    }
                }
                .order-card-button {
                    outline: none;
                    border: none;
                    border-radius: 24px;
                    background: $primary-color-20;
                    color: $primary-color-60;
                    padding: 6px 24px;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;;
                    cursor: pointer;
                    text-decoration: none;
                }
            }
            .order-card-content {
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                overflow-x: auto;
                display: flex;
                flex-direction: row;
                gap: 16px;
                .card-product {
                    width: 110px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    .product-img {
                        background: $secondary-color-10;
                        aspect-ratio: 1/1;
                        width: 100%;
                        height: 100%;
                        border-radius: 6px;
                        border: 1px solid $secondary-color-10;
                    }
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }
                    .product-info {
                        color: $secondary-color-90;
                    }
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
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;;
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
                            height: fit-content;
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
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;;
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
                flex-direction: column;
                gap: 8px;
                .payment-accordion-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .payment-total-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;;
                    button {
                        outline: none;
                        border: none;
                        background: #10B981;
                        padding: 3px 16px;
                        font-size: small;
                        color: $white;
                        border-radius: 12px;
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;;
                    }
                }
            }
        }
    }
</style>