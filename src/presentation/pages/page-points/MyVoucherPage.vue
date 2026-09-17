<template>
	<layout-variant-two :show-main-logo="false" :show-loading-screen="loading" :hideFooter="isDesktop">
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con default">
					<div class="header-logo-con left">
						<img
							width="35"
							height="35"
							alt="rox logo"
							:src="require('@/assets/images/rox-logo-new.png')"
						/>
					</div>
					<base-desktop-nav :no-search="true" :active-footer-id="-1"></base-desktop-nav>
					<base-header-nav :no-search="true"></base-header-nav>
				</div>
			</div>
		</template>
		<template v-slot:body>
			<div class="rewards-content" v-if="!loading">
				<div class="rewards-legend">
					<div class="rewards-legend-header" @click="goBack()">
						<div class="rewards-legend-arrow material-icons-outlined">arrow_back</div>
						<span>My Vouchers</span>
					</div>
				</div>
				<div class="rewards-wrapper">
                    <div class="reward-section active">
                        <div class="reward-side">
                            <div class="reward-tabs-content">
                                <div class="reward-tabs">
                                    <div class="reward-tab-item"
                                        :class="{'active': activeTabIndex == 0}"
                                        @click="setTab(0)"
                                    >
                                        <div class="reward-tab-item-label">Active Vouchers</div>
                                    </div>
                                    <div class="reward-tab-item"
                                        :class="{'active': activeTabIndex == 1}"
                                        @click="setTab(1)"
                                    >
                                        <div class="reward-tab-item-label">Past Vouchers</div>
                                    </div>
                                    <div class="reward-tab-indicator" :class="{'move-next': activeTabIndex == 1}"></div>
                                </div>
                            </div>
                            <div class="vouchers-container" :class="{'scrollable': myVouchers.length > 10 && isDesktop}">
                                <div class="vouchers-content">
                                    <div class="voucher-item"
                                        v-for="voucher in myVouchers"
                                        :key="voucher.id"
                                        @click="selectVoucher(voucher)"
                                        :class="{'active': selectedVoucher && voucher.id == selectedVoucher.id}"
                                    >
                                        <div class="voucher-img">
                                            <img :src="voucher.promotion.displayId" :alt="voucher.promotion.name">
                                        </div>
                                        <div class="voucher-wrapper">
                                            <div class="voucher-title">{{ voucher.promotion.amountDisplay }} {{ voucher.promotion.name }}</div>
                                            <div class="voucher-footnote">{{ voucher.promotion.validDateRange }}</div>
                                            <div class="voucher-points-wrapper">
                                                <span class="material-icons voucher-points-icon">stars</span>
                                                <span class="voucher-footnote">{{ voucher.promotion.usageLimit }}x usage limit</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="section" :class="{'auto-height': !isEmpty(selectedVoucher), 'processing': processing}">
                            <my-voucher-details v-if="!isEmpty(selectedVoucher)"
                                :selected-voucher="selectedVoucher"
                                :points="points"
                                :button-name="buttonName"
                                @shop-now="shopNow"
                            />
                        </div>
                    </div>
                </div>
			</div>
            <base-modal :show="!isDesktop && !isEmpty(selectedVoucher) && showDetails" :full-screen="true">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="close-btn material-icons-outlined" @click="toggleDetails">arrow_back</span>
                        <h3>My Vouchers</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <my-voucher-details 
                        :selected-voucher="selectedVoucher"
                        :points="points"
                        :button-name="buttonName"
                        @shop-now="shopNow"
                    />
                </template>
            </base-modal>
		</template>
		<template v-slot:footer>
			<base-footer-nav :active-footer-id="-1"></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

import { getTransactionalPoints } from "@/connector/v4/customerConnector";
import { storeService } from "@/bloc/services";
import MyVoucherDetails from "./components/MyVoucherDetails.vue";

export default {
	name: "MyVoucherPage",
	components: {
        LayoutVariantTwo,
        MyVoucherDetails,
	},
	mixins: [utility],
	data() {
		return {
			activeTabIndex: 0,
			loading: false,
			customer: {},
			isDesktop: false,
			transactionalPoints: 0,
            vouchers: [],
            selectedVoucher: null,
            quantity: 1,
            processing: false,
            denoms: [100, 250, 500, 1000],
            pointInUse: 0,
            showDetails: false,
		};
    },
    computed: {
        myVouchers() {
            if (isEmpty(this.vouchers)) return [];
            if (this.activeTabIndex == 0) {
                return this.vouchers.filter((it) => {
                    return it.status == "ACTIVE";
                });
            }

            return this.vouchers.filter((it) => {
                return it.status != "ACTIVE";
            });
        },
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
        }
    },
	methods: {
		resize() {
			this.isDesktop = window.innerWidth >= 672;
		},
		setTab(index) {
			this.activeTabIndex = index;
        },
        toggleDetails() {
			this.showDetails = !this.showDetails;
			if (!this.showDetails) this.selectedVoucher = null;
		},
        async selectVoucher(item) {
            try {
                if (this.selectedVoucher && this.selectedVoucher.id == item.id) {
                    this.selectedVoucher = null;
                    return;
                }
                let now = moment.tz(moment(), 'Asia/Singapore');
                if (item.number) {
                    this.processing = true;
                    let res = await storeService.retrieveCashVoucherDetails(item.promotion.number);
                    this.processing = false;
                    if (!res.success) {
                        this.selectedVoucher = null;
                        return this.showNotification("alert", "error_outline", `Something went wrong. ${res.message}`);
                    }
                    item.isExpired = moment.tz(res.voucher.expiryTime, 'Asia/Singapore').isSameOrBefore(now);
                    item.redeemedTime = res.voucher.redeemedTime ? moment.tz(res.voucher.redeemedTime, 'Asia/Singapore').format('DD MMM YYYY') : null;
                    item.purchasePoint = res.voucher.purchasePoint || 0;
                }
                this.selectedVoucher = item;
                this.showDetails = true;
            } catch (error) {
                this.processing = false;
                this.showNotification("alert", "error_outline", error);
            }
        },
        setPointUsed(amount) {
			this.pointInUse = amount;
        },
        shopNow() {
            if (this.selectedVoucher.isExpired || this.selectedVoucher.redeemedTime) return;
            let outlet = this.$store.getters.getCurrentOutlet;
            let apiCode = isEmpty(outlet) ? -1 : outlet.apiCode;
            return this.goToWithParams('ShopPage', {
                outlet: apiCode
            });
        }
	},
	async created() {
		try {
			this.loading = true;
			if (!this.$store.getters.hasInited) await this.refreshMainData();
			this.customer = this.$store.getters.getCustomer;
			let res = await getTransactionalPoints();
			if (res.success && !isEmpty(res.customer.rewards)) {
                this.transactionalPoints = res.customer.rewards.totalRewardPoints;
                let vouchers = res.customer.vouchers || [];
                if (vouchers.length > 0) {
                    vouchers = vouchers.map((it) => {
                        let tncList = it.promotion.tnc ? it.promotion.tnc.split(/\n/g) : [];
                        let items = [];
                        if (tncList) {
                            tncList.forEach((tnc) => {
                                let item = tnc;
                                if (["-", " "].includes(tnc.substr(0, 1))) {
                                    item = tnc.substr(2);
                                }
                                if (!item) return;
                                items.push(item)
                            });
                        }
                        it.promotion.tncList = items;
                        it.promotion.amountDisplay = this.currency(it.promotion.amount)
                        let validDateRange = [];
                        if (it.promotion.periodFrom) {
                            validDateRange.push(moment.tz(it.promotion.periodFrom, 'Asia/Singapore').format('DD MMM YYYY'));
                        }
                        if (it.promotion.periodTo) {
                            validDateRange.push(moment.tz(it.promotion.periodTo, 'Asia/Singapore').format('DD MMM YYYY'));
                        }
                        if (isEmpty(validDateRange)) validDateRange = ["Unlimited"];
                        it.promotion.validDateRange = validDateRange.join(" to ");
                        let imageId = it.promotion.imageId;
                        it.promotion.displayId = imageId ? this.getImage(imageId, "") : require("@/assets/images/rox-logo-new.png");
                        return it;
                    });
                }
                this.vouchers = vouchers;
			}
			this.loading = false;
			window.addEventListener("resize", () => {
				this.resize();
			});
			setTimeout(() => {
				this.resize();
			}, 50);
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
	.header-con {
		justify-content: space-between;
		gap: 16px;

		h1 {
			font-size: 1.2em;
		}
	}
	.rewards-content {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background: $primary-color-10;
		.rewards-legend {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 24px;
			width: 100%;
			background: $white;
			box-shadow: 0 2px 2px -2px rgba(0, 0, 0, 0.3);
			padding: 16px 24px;
			z-index: 3;

			.rewards-legend-arrow {
				cursor: pointer;
				color: $primary-color-50;
			}

			.rewards-legend-header {
				// font-family: 'Akzidenz Grotesk Super';
				text-align: left;
				font-size: 1.2em;
				font-weight: bold;
				display: flex;
				align-items: center;
				gap: 24px;
			}
		}
		.reward-tabs-content {
			width: calc(100% + 48px);
			display: flex;
			align-items: center;
			z-index: 2;
			.reward-tabs {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				background: $white;
				position: relative;
				box-shadow: 0 2px 2px -2px rgba(0, 0, 0, 0.3);
				.reward-tab-indicator {
					position: absolute;
					bottom: 0;
					height: 2px;
					width: 50%;
					background: $primary-color-60;
					transition: all 0.5s;
					transform: translateX(0%);
					&.move-next {
						transform: translateX(100%) !important;
					}
				}
				.reward-tab-item {
                    flex: 1;
					margin: 0 !important;
					display: flex;
					align-items: center;
					gap: 16px;
					padding: 16px;
					border-bottom: 2px solid transparent;
					cursor: pointer;
					font-weight: bold;
					&:hover {
						opacity: 0.7;
					}
					&.active {
						color: $primary-color-60;
					}
					.reward-tab-item-label {
						width: 100%;
                        text-align: center;
                        white-space: nowrap;
					}
				}
			}
		}
		.rewards-wrapper {
			flex: 4;
			width: 200%;
			height: 100%;
			background: $white;
			display: flex;
			transition: all 0.5s;
			padding: 0;
			&.pull-left {
				transform: translateX(-50%);
			}
			.reward-label {
				font-family: 'Akzidenz Grotesk Super';
				font-weight: bold;
				font-size: 1.2em;
			}
			.rewards-button {
				padding: 16px 64px;
				border-radius: 12px;
				font-weight: bold;
				display: flex;
				align-items: center;
				gap: 8px;
				background: $primary-color-50;
				color: $white;
				cursor: pointer;
			}
		}
	}

    .section {
        &.processing {
            position: relative;
            .section-wrapper {
                opacity: 0;
                pointer-events: none;
            }
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
                border: 4px solid $secondary-color-40;
                border-left-color: transparent;
                border-right-color: transparent;
                margin: 20% auto;
                animation: spin 1s linear 0.3s infinite;
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
                border: 4px solid $primary-color-60;
                border-top-color: transparent;
                border-bottom-color: transparent;
                margin: 20% auto;
                animation: spin 1.5s ease-in-out infinite;
            }
        }
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
	
	@media (min-width: 672px) {
		.points-header {
			padding: 16px 96px;
		}

		.points-content {
			padding: 24px 96px;
		}
	}
</style>
