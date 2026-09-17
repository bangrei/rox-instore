<template>
	<div class="section-wrapper">
		<div class="section-head-img">
			<img :src="selectedVoucher.displayId" :alt="selectedVoucher.number">
		</div>
		<div class="section-item">
			<div class="section-item-title title-centered">
				<span class="title-large">{{ selectedVoucher.amountDisplay }} {{ selectedVoucher.name }}</span>
			</div>
			<div class="section-item-subtitle subtitle-centered">
				<div class="subtitle-details">
					<span class="subtitle-icon material-icons">stars</span>
					<span class="subtitle-desc">{{ points }}</span>
				</div>
				<span class="subtitle-label">R.O.X Points available to redeem</span>
			</div>
		</div>
		<div class="section-item inline-justify-between">
			<div class="inline-points">
				<span class="inline-label">Points</span>
				<div class="inline-points-desc">
					<span class="material-icons inline-icon">stars</span>
					<span class="inline-text">{{ selectedVoucher.purchasePoint }}</span>
				</div>
			</div>
			<div class="inline-points">
				<span class="inline-label">Expiry Date</span>
				<span class="inline-subtext">{{ selectedVoucher.expiryTimeDisplay }}</span>
			</div>
		</div>
		<div class="section-item">
			<div class="voucher-details-title">Quantity</div>
			<div class="voucher-quantity-buttons">
				<div class="voucher-quantity-button material-icons" 
					:class="{'disabled': quantity <= 1 || selectedVoucher.isExpired}"
					@click="minusQty"
				>remove</div>
				<div class="voucher-quantity-text">{{  quantity }}</div>
				<div class="voucher-quantity-button material-icons" 
					:class="{'disabled': quantity >= selectedVoucher.usageLimit || selectedVoucher.isExpired}"
					@click="addQty"
				>add</div>
			</div>
		</div>
		<div class="section-item">
			<div class="voucher-details-title">Denominations</div>
			<div class="denominations">
				<div class="denom" 
					v-for="denom in denoms"
					:key="denom"
					:class="{'active': denom == pointInUse}"
					@click="setPointUsed(denom)"
				>{{ denom }}</div>
			</div>
		</div>
		<div class="section-item">
			<div class="buy-button" 
				:class="{'disabled': selectedVoucher.redeemedTime || selectedVoucher.isExpired || !(selectedVoucher.availableQty > 0)}" 
				@click="buy"
			>{{ buttonName }}</div>
		</div>
		<div class="section-item">
			<div class="voucher-details-title">Description</div>
			<div class="voucher-details-desc">{{ description }}</div>
		</div>
		<div class="section-item">
			<div class="voucher-details-title">Terms and Conditions</div>
			<div class="voucher-details-desc">
				<div class="tnc-list">
					<div class="tnc-item" v-for="(tnc,i) in tncList" :key="i">{{ tnc }}</div>
				</div>
			</div>
		</div>
		<div class="padding"></div>
	</div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
export default {
	name: "RewardDetails",
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
		quantity: {
			type: Number,
			default: 1,
			required: true,
		},
		denoms: {
			type: Array,
			default: () => [],
			required: true,
		},
		isPurchased: {
			type: Boolean,
			default: false,
		},
		buttonName: {
			type: String,
			default: "Buy Now"
		}
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
	},
	methods: {
		setPointUsed(amount) {
			this.$emit('set-point-used', amount);
		},
		addQty() {
			this.$emit('add-qty')
		},
		minusQty() {
			this.$emit('minus-qty')
		},
		async buy() {
			this.$emit('buy');
		},
	},
};
</script>
<style scoped lang="scss">
	.padding {
		width: 100%;
		min-height: 32px;
	}
</style>
