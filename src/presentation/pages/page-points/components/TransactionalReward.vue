<template>
	<div class="reward-section" :class="{'active': isActive, 'processing': processing}">
		<div class="reward-side">
			<div class="qr-code-wrapper">
				<qr-code :text="qrText" class="qr-code"></qr-code>
				<div class="qr-code-details">
					<div class="qr-code-details-item">
						<span class="label">Name: </span>
						<span class="text">{{ customer.firstName }} {{ customer.lastName }}</span>
					</div>
					<div class="qr-code-details-item">
						<span class="label">Member since: </span>
						<span class="text">{{ regDate }}</span>
					</div>
				</div>
			</div>
			
			<div class="rewards-details">
				<div class="rewards-details-item">
					<div class="points">
						<div class="points-details">
							<span class="points-icon material-icons">stars</span>
							<span class="points-amount">{{ points }}</span>
						</div>
						<span class="points-label">R.O.X. Points</span>
					</div>
				</div>
			</div>
			<div class="rewards-divider"></div>
			<div class="rewards-info">
				<span class="rewards-info-icon material-icons-outlined">info</span>
				<span class="rewards-info-text">Redeemed rewards will be sent to your My Voucher and registered email.</span>
				<span class="rewards-info-anchor" @click="goTo('MyVoucherPage')">My vouchers</span>
			</div>
			<div class="vouchers-container">
				<div class="pagination" v-if="pagination > 1">
					<div class="page-num"
						v-for="page in pagination"
						:key="page"
						:class="{'active': pageNumber == page -1}"
						@click="selectPage(page - 1)"
					>
						{{ page }}
					</div>
				</div>
				<div class="vouchers-content">
					<div class="empty-data" v-if="isEmpty(filteredPromotions)">
						No data...
					</div>
					<div class="voucher-item"
						:class="{'active': selectedVoucher && voucher.number == selectedVoucher.number}"
						v-for="voucher in filteredPromotions"
						:key="voucher.number"
						@click="selectVoucher(voucher)"
					>
						<div class="voucher-img">
							<img :src="voucher.displayId" :alt="voucher.number">
						</div>
						<div class="voucher-wrapper">
							<div class="voucher-title">{{ voucher.amountDisplay }} {{ voucher.name }}</div>
							<div class="voucher-subtitle">Exp. {{ voucher.expiryTimeDisplay }}</div>
							<div class="voucher-points-wrapper">
								<span class="material-icons voucher-points-icon">stars</span>
								<span class="voucher-points" v-if="voucher.purchasePoint > 0">{{ voucher.purchasePoint }}</span>
								<span class="voucher-subtitle" v-else>Free Voucher</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="section pattern-1" :class="{'auto-height': !isEmpty(selectedVoucher) }">
			<div class="section-wrapper" v-if="!selectedVoucher">
				<div class="section-head">
					<span class="section-head-icon material-icons">stars</span>
					<div class="section-head-label">R.O.X. Points</div>
				</div>
				<div class="section-item">
					<div class="section-item-title">How to Earn?</div>
					<div class="section-item-desc">
						You will gain R.O.X Points when you shop inside R.O.X Community shopping platform.
					</div>
				</div>
				<div class="section-item">
					<div class="section-item-title">How to Burn?</div>
					<div class="section-item-desc">
						You can use R.O.X Points to offset your purchases on our online stores.
					</div>
				</div>
			</div>
			<reward-details v-else-if="isDesktop"
				:selected-voucher="selectedVoucher"
				:points="points"
				:quantity="quantity"
				:denoms="denoms"
				:is-purchased="isPurchased"
				:button-name="buttonName"
				@buy="toggleModal"
				@add-qty="addQty"
				@minus-qty="minusQty"
				@set-point-used="setPointUsed"
			/>
		</div>

		<base-modal 
			:show="showDetailsOnMobile" 
			:full-screen="true"
		>
			<template v-slot:header>
				<div class="modal-header header-flex">
					<span class="close-btn material-icons-outlined" @click="toggleDetails">arrow_back</span>
					<h3>Back</h3>
				</div>
			</template>
			<template v-slot:body>
				<reward-details 
					:selected-voucher="selectedVoucher"
					:points="points"
					:quantity="quantity"
					:denoms="denoms"
					:is-purchased="isPurchased"
					:button-name="buttonName"
					@buy="toggleModal"
					@add-qty="addQty"
					@minus-qty="minusQty"
					@set-point-used="setPointUsed"
				/>
			</template>
		</base-modal>

		<base-modal :show="showModal">
			<template v-slot:header>
				<div class="modal-header header-flex justify-between">
					<h3>Get This Reward</h3>
					<span class="close-btn material-icons-outlined" @click="toggleModal">close</span>
				</div>
			</template>
			<template v-slot:body>
				<div class="modal-body">
					<div class="modal-line">
						<div class="modal-notif" :class="{'show': notif}">
							<span class="modal-notif-icon material-icons-outlined">info</span>
							<span class="modal-notif-text">{{ notif }}</span>
						</div>
					</div>
					<div class="modal-line">
						<div class="modal-line-label">
							<span class="text-disabled">Redeem with</span>
						</div>
						<div class="modal-line-label">
							<span class="text-danger">{{ totalPointUsed }}</span>
							<span class="text-points">R.O.X Points</span>
						</div>
					</div>
					<div class="modal-line">
						<div class="modal-line-label">
							<span class="text-disabled">Leaving you with</span>
						</div>
						<div class="modal-line-label">
							<span class="text-danger">{{ pointsLeft }}</span>
							<span class="text-points">R.O.X Points</span>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<div class="cancel-btn lite" @click="toggleModal">Cancel</div>
					<div class="submit-btn" @click="buyNow">Submit</div>
				</div>
			</template>
        </base-modal>

		<base-modal :show="showSuccessModal" :smallSize="true">
			<template v-slot:header>
				<div class="modal-header header-flex justify-between">
					<h3>Congratulations!</h3>
					<span class="close-btn material-icons-outlined" @click="toggleSuccessModal">close</span>
				</div>
			</template>
			<template v-slot:body>
				<div class="modal-body">
					<div class="modal-line">
						<img class="modal-img-header" :src="require('@/assets/images/success-voucher.svg')" alt="">
					</div>
					<div class="modal-line">
						<div class="modal-line-title">Your voucher is successfully redeemed!</div>
						<div class="modal-line-subtitle">Your rewards will be sent to your <b>registered email address</b>.</div>
					</div>
				</div>
				<div class="modal-footer">
					<div class="cancel-btn lite" @click="toggleSuccessModal">Close</div>
				</div>
			</template>
        </base-modal>
	</div>
</template>

<script>
import moment from 'moment-timezone';
import VueQRCodeComponent from 'vue-qrcode-component';
const qrCode = VueQRCodeComponent;
import utility from "@/presentation/mixins/utility.js";
import { storeService } from "@/bloc/services";
import RewardDetails from './RewardDetails.vue';
import { isEmpty } from "lodash";
export default {
	name: "TransactionalReward",
	mixins: [utility],
	components: {
		qrCode,
		RewardDetails,
	},
	props: {
		customer: {
			type: Object,
			default: () => {},
			required: true,
		},
		points: {
			type: Number,
			default: 0,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			categories: [],
			vouchers: [],
			selectedCategory: null,
			selectedVoucher: null,
			isDestroyed: false,
			quantity: 1,
			pointInUse: 0,
			processing: false,
			denoms: [100, 250, 500, 1000],
			showModal: false,
			showSuccessModal: false,
			notif: "",
			pageNumber: 0,
			pageSize: 5,
			pagerCount: 0,
			promotions: [],
			filteredPromotions: [],
			purchasedVouchers: [],
			isDesktop: true,
			showDetails: false,
		};
	},
	computed: {
		regDate() {
			if (!this.customer.registeredDate) return "-";
			return moment.tz(this.customer.registeredDate,'Asia/Singapore').format('DD MMMM YYYY');
		},
		qrText() {
			return `#${this.customer.id}`;
		},
		pointsLeft() {
			return this.points - this.totalPointUsed
		},
		totalPointUsed() {
			return this.pointInUse * this.quantity;
		},
		pagination() {
			let pages = Math.floor(this.pagerCount / this.pageSize);
			if (this.pagerCount % this.pageSize > 0) pages += 1;
			return pages;
		},
		isPurchased() {
			if (!this.selectedVoucher) return false;
			let nums = this.purchasedVouchers.map((it) => {
				return it.parentNum;
			});
			let qty = this.selectedVoucher.availableQty || 0;
			return nums.includes(this.selectedVoucher.number) || (qty <= 0);
		},
		buttonName() {
			let name = 'Buy Now';
			if (!this.selectedVoucher) return name;
			if (!(this.selectedVoucher.availableQty > 0)) return 'Out of stock';
			//if (this.isPurchased) return 'Purchase';
			if (this.selectedVoucher.isExpired) return 'Unavailable';
			if(!(this.selectedVoucher.purchasePoint > 0)) return 'Get Free Voucher'
			return name;
		},
		showDetailsOnMobile() {
			return !this.isDesktop && !isEmpty(this.selectedVoucher) && this.showDetails
		}
	},
	methods: {
		setFilteredPromotions() {
			if (isEmpty(this.promotions)) {
				this.filteredPromotions = [];
				return;
			}
			let offset = this.pageNumber * this.pageSize;
			let limit = offset + this.pageSize;
			let items = this.promotions.filter((_, i) => {
				return i >= offset && i < limit
			});
			this.filteredPromotions = items;
		},
		async selectPage(page) {
			if (this.pageNumber == page) return;
			this.pageNumber = page;
			this.setFilteredPromotions();
		},
		async retrieveVouchers(p) {
			this.processing = true;
			let getJson = async (pageNum) => {
				return await storeService.retrieveCashVouchers({
					pageNumber: pageNum,
					pageSize: 10000000
				});
			}
			let doFilter = (items) => {
				if (!items || items.length == 0) return [];
				const pattern = /expiry\s+(\d+)\s+months/;
				items.forEach((it) => {
					let now = moment.tz(moment(), 'Asia/Singapore');
					let expiryInMonths = 12;
					let match = it.remarks ? it.remarks.match(pattern) : null;
					if (match) expiryInMonths = match[1];
					let maxExpiry = now.add(expiryInMonths, 'months');
					it.hideIfExpired = moment.tz(it.expiryDate, 'Asia/Singapore').isBefore(maxExpiry);

					it.amountDisplay = this.currency(it.dollarValue);
					it.purchasePoint = it.purchasePoint || 0;
					it.expiryTimeDisplay = moment.tz(it.expiryDate, 'Asia/Singapore').format('DD MMM YYYY');
					it.displayId = it.imageId ? this.getImage(it.imageId, "") : require("@/assets/images/rox-logo-new.png");
				});
				return items.filter((it) => { return !it.hideIfExpired });
			}
			let json = await getJson(p);
			if (!json.success) {
				this.processing = false;
				return this.showNotification("alert", "error_outline", `Something went wrong! ${json.message}`);
			}
			this.processing = false;
			this.promotions = doFilter(json.vouchers || []);
			this.pagerCount = this.promotions.length;
			this.setFilteredPromotions();
		},
		async selectVoucher(item) {
			this.showDetails = false;
			if (this.selectedVoucher && this.selectedVoucher.number == item.number) {
				this.selectedVoucher = null;
				return;
			}
			try {
				this.processing = true;
				let res = await storeService.retrieveBulkVoucherDetails(item.number);
                this.processing = false;
				if (!res.success) {
					this.selectedVoucher = null;
					return this.showNotification("alert", "error_outline", `Something went wrong. ${res.message}`);
				}
				let voucher = res.vouchers[0];
				let now = moment.tz(moment(), 'Asia/Singapore');
                item.isExpired = moment.tz(voucher.expiryDate, 'Asia/Singapore').isSameOrBefore(now);
				item.redeemedTime = voucher.redeemedTime ? moment.tz(voucher.redeemedTime, 'Asia/Singapore').format('DD MMM YYYY') : null;
				this.selectedVoucher = item;
				this.quantity = 1;
				this.denoms = [item.purchasePoint || 0];
				this.pointInUse = this.denoms[0];
				this.showDetails = true;
            } catch (error) {
                this.processing = false;
                this.showNotification("alert", "error_outline", error);
            }
		},
		setPointUsed(amount) {
			this.pointInUse = amount;
		},
		addQty() {
			if (!this.selectedVoucher.availableQty) return this.showNotification("alert", "error_outline", `We're sorry, this voucher out of stock!`);
			if (this.quantity == this.selectedVoucher.availableQty) return this.showNotification("alert", "error_outline", `We're sorry, this voucher has limited stock!`);
			this.quantity++;
		},
		minusQty() {
			if (this.quantity == 1) return;
			this.quantity--;
		},
		toggleDetails() {
			this.showDetails = !this.showDetails;
			if (!this.showDetails) this.selectedVoucher = null;
		},
		toggleModal() {
			if (!this.showModal && this.pointsLeft < 0) {
				return this.showNotification("alert", "error_outline", "Insufficient points");
			}
			this.notif = "";
			this.showModal = !this.showModal;
		},
		toggleSuccessModal() {
			this.showSuccessModal = !this.showSuccessModal;
		},
		async buyNow() {
			try {
				if (!(this.selectedVoucher.availableQty > 0)) {
					this.showNotification("alert", "error_outline", "Cash Voucher is out of stock");
					return;
				}
				let isCash = this.selectedVoucher.purchasePoint > 0;
				if (!isCash) return this.getFreeVoucher();
				this.processing = true;
				let payload = {
					number: this.selectedVoucher.number,
					quantity: this.quantity
				}
				let res = await storeService.buyCashVoucher(payload);
				this.processing = false;
				if (!res.success) {
					this.notif = res.message || `Something went wrong!`;
					return;
				}
				let voucher = res.purchasedVouchers[0];
				voucher.parentNum = this.selectedVoucher.number;
				this.purchasedVouchers.push(voucher);
				this.showDetails = false;
				this.toggleModal();
				this.toggleSuccessModal();
				if (!this.isDesktop) this.selectedVoucher = null;
			} catch (error) {
				this.processing = false;
				this.notif = error;
                this.showNotification("alert", "error_outline", error);
			}
		},
		async getFreeVoucher() {
			try {
				this.processing = true;
				let payload = {
					number: this.selectedVoucher.number,
					quantity: this.quantity
				}
				let res = await storeService.getFreeVoucher(payload);
				this.processing = false;
				if (!res.success) {
					this.notif = res.message || `Something went wrong!`;
					return;
				}
				let voucher = res.gifteedVouchers[0];
				voucher.parentNum = this.selectedVoucher.number;
				this.purchasedVouchers.push(voucher);
				this.showDetails = false;
				this.toggleModal();
				this.toggleSuccessModal();
				if (!this.isDesktop) this.selectedVoucher = null;
			} catch (error) {
				this.processing = false;
				this.notif = error;
                this.showNotification("alert", "error_outline", error);
			}
		},
	},
	async created() {
		try {
			this.isDesktop = window.innerWidth >= 672;
			window.addEventListener('resize', () => {
				this.isDesktop = window.innerWidth >= 672;
			})
			this.retrieveVouchers(this.pageNumber);
		} catch (error) {
			this.showNotification("alert", "error_outline", error);
		}
	},
	beforeUnmount() {
		this.isDestroyed = true;
	},
};
</script>
<style scoped lang="scss">
	.processing {
        position: relative;
		pointer-events: none;
		.section {
			position: relative;
            &::before {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                content: "";
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 4px solid $custom-yellow-color;
                border-left-color: transparent;
                border-right-color: transparent;
                margin: 20% auto;
                animation: spin 1s linear 0.3s infinite;
				z-index: 2;
            }
            &::after {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                content: "";
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 4px solid $custom-blue-color;
                border-top-color: transparent;
                border-bottom-color: transparent;
                margin: 20% auto;
                animation: spin 1.5s ease-in-out infinite;
				z-index: 2;
            }
    	}
		.cancel-btn {
			opacity: 0.7;
			pointer-events: none;
		}
		.submit-btn {
			position: relative;
			opacity: 0.7;
			pointer-events: none;
			&::after {
				min-width: 15px;
				min-height: 15px;
				content: "";
				border-radius: 50%;
				border: 2px solid $white;
				border-left-color: transparent;
				animation: spin 1.5s ease-in-out infinite;
				z-index: 2;
				position: absolute;
				margin-left: 16px;
			}
		}
	}
	.close-btn {
		cursor: pointer;
		&:hover {
			opacity: 0.7;
		}
	}
	.submit-btn,
	.cancel-btn {
        width: 100%;
        padding: 16px;
        background: $primary-color-50;
		border: 1px solid $primary-color-50;
        color: $white;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
		font-weight: 900;
        cursor: pointer;
        text-align: center;
		&:hover {opacity: 0.7;}
		&.lite {
			background: $white;
			color: $primary-color-50;
		}
    }
	.modal-line {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
		.modal-img-header {
			max-width: 150px;
			width: 100%;
			margin: 0 auto;
		}
		.modal-line-title {
			font-size: 1.3em;
			font-weight: bold;
			padding: 12px 0;
			line-height: 1.3;
		}
		.modal-line-subtitle {
			color: $secondary-color-60;
			font-size: 0.8em;
		}
		.modal-line-label {
			display: flex;
			gap: 4px;
			align-items: center;
			.text-danger {
				font-weight: bold;
			}
		}
		& + * {
			padding-top: 16px;
		}
		.modal-notif {
			width: 100%;
			height: 0;
			overflow: hidden;
			background: $alert-light;
			color: $white;
			display: flex;
			gap: 16px;
			align-items: center;
			transition: all 0.5s ease-in-out;
			-webkit-transition: all 0.3s ease-in-out;
			&.show {
				height: auto !important;
				padding: 8px 16px;
			}
			.modal-notif-text {
				width: 100%;
				text-align: left;
			}
		}
	}
	.text-danger { 
		color: $primary-color-60;
	}
	.text-disabled { 
		color: $secondary-color-60;
	}
	.empty-data {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: $secondary-color-10;
		padding: 32px;
	}
</style>
