<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="goTo('EventsPage')">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<div class="heading" v-if="!isEmpty(booking)">
                        <div class="head-date">{{ cancelDate }}</div>
                        <div class="head-info">{{ booking.items.length }} item(s)</div>
                    </div>
                    <span class="button-cancel" v-if="showCancelButton" @click="toggleCancel()">Cancel</span>
                    <span class="status-cancel" v-if="cancelled">CANCELLED</span>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <receipt-content v-if="orderNumber"
                :order-number="orderNumber"
                @init-receipt="initReceipt"
            ></receipt-content>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import ReceiptContent from "./components/ReceiptContent.vue";
import utility from "@/presentation/mixins/utility.js";
import { eventService } from "@/bloc/services";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "ReceiptPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
        ReceiptContent
	},
	data() {
		return {
			loading: false,
            orderNumber: null,
            booking: null,
            order: null,
            showCancellation: false,
		};
	},
	watch: {},
	computed: {
        cancelDate(){
            let data = this.booking || this.order;
            if(isEmpty(data)) return "";
            let date = data.status == "CANCELLED" ? data.cancelTime : data.placeTime;
            return moment.tz(date, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        cancelled(){
            let data = this.booking || this.order;
            if(isEmpty(data)) return false;
            return data.status == "CANCELLED";
        },
        showCancelButton(){
            return !this.loading && !this.cancelled && !isEmpty(this.booking);
        }
    },
	methods: {
        async initReceipt(res){
            if(!isEmpty(res.booking)) this.booking = res.booking;
            if(!isEmpty(res.order)) this.order = res.order;
            if(!res.success) {
                this.loading = false;
                return this.showNotification("alert", "error_outline", res.message);
            }
            /*
            if(!isEmpty(this.booking)) {
                if(this.booking.status !== "CANCELLED") return this.cancel();
            }
            */
            this.loading = false;
            if(!isEmpty(this.booking)) {
                if(this.booking.status !== "CANCELLED") this.toggleCancel();
            }
        },
        toggleCancel(){
            this.showCancellation = !this.showCancellation;
        },
        async cancel(){
            try {
                this.loading = true;
                let res = await eventService.cancelEvent(this.orderNumber);
                this.loading = false;
                this.showCancellation = false;
                if(!res.success) {
                    return this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                }
                this.booking.status = "CANCELLED";
                this.booking.cancelTime = moment();
            } catch(error) {
                this.loading = false;
                this.showNotification("alert", "error_outline", error);
            }
        },
    },
	async created() {
		try {
            this.loading = true;
            this.orderNumber = this.$route.params.number;
            let token = this.$route.params.token || "";
            this.$store.dispatch("setEunoiaToken", token);
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
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
        justify-content: space-between;
        max-height: 56px;
        border-bottom: 1px solid $secondary-color-20;
        background: $white;
        color: $primary-color-60;
        gap: 16px;

        .back-btn {
            //color: $white;
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
            font-family: 'Berthold Akzidenz Grotesk Medium';
            color: $secondary-color-90;
            text-align: left;
        }

        .heading {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            
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
    .button-cancel {
        cursor: pointer;
        color: $link-blue-color;
    }
    .status-cancel {
        background: $primary-color-60;
        color: $white;
        padding: 4px 8px;
        font-size: 0.8em;
    }
    .actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 32px;

        .action-button {
            font-family: 'Berthold Akzidenz Grotesk';
            border-radius: 12px;
            background: $primary-color-60;
            border: 1px solid $primary-color-60;
            padding: 6px 16px;
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