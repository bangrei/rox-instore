<template>
    <div class="section-wrapper">
        <div class="section-head-img">
            <img :src="selectedVoucher.promotion.displayId" :alt="selectedVoucher.promotion.name">
        </div>
        <div class="section-item">
            <div class="section-item-title title-centered">
            <span class="title-large">{{ selectedVoucher.promotion.amountDisplay }} {{ selectedVoucher.promotion.name }}</span>
            <span class="foot-note"><b>{{ selectedVoucher.promotion.number ? 'Voucher Number' : 'Benefit' }}:</b></span>
            <span class="foot-note">{{ voucherNumberOrBenefit }}</span>
            </div>
        </div>
        <div class="section-item inline-justify-between">
            <div class="inline-points">
                <span class="inline-label">Validity</span>
                <span class="inline-subtext">{{ selectedVoucher.promotion.validDateRange }}</span>
            </div>
        </div>
        <div class="section-item">
            <div class="voucher-details-title">Description</div>
            <div class="voucher-details-desc">{{ description }}</div>
        </div>
        <!-- <div class="section-item">
            <div class="voucher-details-title">Denominations</div>
            <div class="denominations">
                <div class="denom" 
                    v-for="denom in denoms"
                    :key="denom"
                    :class="{'active': denom == pointInUse}"
                    @click="setPointUsed(denom)"
                >{{ denom }}</div>
            </div>
        </div> -->
        <div class="section-item inline-justify-between">
            <div class="inline-points">
                <span class="inline-label">Points</span>
                <div class="inline-points-desc">
                    <span class="material-icons inline-icon">stars</span>
                    <span class="inline-text">{{ selectedVoucher.purchasePoint }}</span>
                </div>
            </div>
            <div class="inline-points">
                <span class="inline-label">Time of Redeem</span>
                <span class="inline-subtext">{{ selectedVoucher.redeemedTime || '-' }}</span>
            </div>
        </div>
        <div class="section-item">
            <div class="buy-button"
                :class="{'disabled': selectedVoucher.isExpired || selectedVoucher.redeemedTime}"
                @click="shopNow"
            >{{ (selectedVoucher.isExpired || selectedVoucher.redeemedTime) ? 'Unavailable' : 'Shop Now' }}</div>
        </div>
        <div class="section-item">
            <div class="voucher-details-title">Terms and Conditions</div>
            <div class="voucher-details-desc">
                <div class="tnc-list">
                    <div class="tnc-item" v-for="(tnc, i) in tncList" :key="i">{{ tnc }}</div>
                </div>
            </div>
        </div>
        <div class="padding"></div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
export default {
	name: "MyVoucherDetails",
	mixins: [utility],
	props: {
        selectedVoucher: {
			type: Object,
			default: () => {},
			required: true,
		},
		points: {
			type: Number,
			default: 0,
			required: true,
		},
	},
	data() {
		return {
			pointInUse: 0,
		};
	},
	computed: {
		description() {
            return `Great news! You can now use your accumulated loyalty points to redeem exclusive vouchers on your next purchase. Browse through our range of vouchers and select the one that suits you best. Each voucher has a specific points value, so choose wisely and enjoy the rewards of your loyalty.`;
        },
        tncList() {
            return [
                "Points Collection: Points are earned on qualifying purchases and are subject to our loyalty program terms.",
                "Voucher Validity: Each voucher has its own expiry date; please check the details before redeeming.",
                "Minimum Points Requirement: Vouchers can only be redeemed once you reach a certain number of points.",
                "Non-transferable: Points and vouchers are non-transferable and linked to your user ID.",
            ];
        },
        voucherNumberOrBenefit() {
            if (this.selectedVoucher.promotion.number) return this.selectedVoucher.promotion.number;
            return this.selectedVoucher.promotion.benefitType.split('_').join(' ');
        }
	},
	methods: {
		toggleDetails() {
			this.$emit('toggle-details');
        },
        shopNow() {
            this.$emit('shop-now')
        }
	},
};
</script>
<style scoped lang="scss">
	.padding {
		width: 100%;
		min-height: 32px;
	}
</style>
