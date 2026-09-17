<template>
	<layout-variant-two :show-main-logo="false" :show-loading-screen="loading" :hideFooter="isDesktop" :active-menu-index="5">
		<template v-slot:body>
			<div class="rewards-content" v-if="!loading">
				<div class="rewards-legend">
					<div class="rewards-legend-header" @click="goBack()">
						<div class="rewards-legend-arrow material-icons-outlined">arrow_back</div>
						<span>Rewards</span>
					</div>
					<div class="voucher-btn" @click="goTo('MyVoucherPage')">
						<span class="material-icons-outlined">local_activity</span>
						<span>My Vouchers</span>
					</div>
				</div>
				<div class="reward-tabs-content">
					<div class="reward-tabs">
						<!-- <div class="reward-tab-item" 
							:class="{'active': activeTabIndex == 0}"
							@click="setTab(0)">
							<span class="reward-tab-icon material-icons">stars</span>
							<div class="reward-tab-item-label">R.O.X. Points</div>
							<div class="reward-tab-item-badge">{{ transactionalPoints || 0 }}</div>
						</div> -->
						<div class="reward-tab-item" 
							:class="{'active': activeTabIndex == 1}"
							@click="setTab(1)">
							<span class="reward-tab-icon height material-icons">flag_circle</span>
							<div class="reward-tab-item-label">R.O.X. Heights</div>
							<div class="reward-tab-item-badge">{{ myLevel.name }}</div>
						</div>
						<!-- <div class="reward-tab-indicator" :class="{'move-next': activeTabIndex == 1}"></div> -->
					</div>
				</div>
				<div class="rewards-wrapper" :class="{'pull-left': activeTabIndex == 1}">
					<transactional-reward 
						:customer="customer" 
						:points="transactionalPoints"
						:is-active="activeTabIndex == 0"
					/>
					<activity-reward 
						:customer="customer" 
						:points="activityPoints"
						:is-active="activeTabIndex == 1"
					/>
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="5"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

import { getTransactionalPoints } from "@/connector/v4/customerConnector";
import ActivityReward from './components/ActivityReward.vue';
import TransactionalReward from './components/TransactionalReward.vue';

export default {
	name: "PointsPage",
	components: {
		LayoutVariantTwo,
		TransactionalReward,
		ActivityReward
	},
	mixins: [utility],
	data() {
		return {
			activeTabIndex: 1,
			loading: false,
			customer: {},
			pointsList: [
				{
					label: '5',
					info: 'P160 Kaulayaw Cafe Gift voucher located in R.O.X. BGC Store 3rd Floor'
				},
				{
					label: '10',
					info: 'P250 Outdoor Gringos Gift voucher located in R.O.X. BGC Store 3rd Floor'
				},
				{
					label: '15',
					info: 'P300 Power Up Wall Climb Gift voucher located in R.O.X. BGC Store, Ground Floor'
				},
				{
					label: '25',
					info: 'P500 discount voucher for R.O.X. Peak Pursuits registration'
				}
			],
			activities : [
				{
					numbering: 1,
					label: 'Customer  to show the total points accumulated to the R.O.X. BGC Store Cashier Personnel',
					items: [],
				},
				{
					numbering: 2,
					label: 'R.O.X. BGC Cashier Personnel will be given a number code so that each time a customer redeems a voucher, the store personnel in charge will input the code in the web-app to track that the customer has already redeemed a voucher',
					items: [],
				},
				{
					numbering: 3,
					label: 'Customer to exchange points for rewards based on the accumulated points',
					items: [
						{
							numbering: 'a',
							label: 'Example 1',
							items: [
								{
									numbering: 'i',
									label: 'By Feb 27, Total Points earned 25pts, user can redeem the following',
									bullets: [
										'P500 Peak Pursuits Discount Voucher',
										'P300 Power Up Wall Climb Gift Voucher',
										'P250 Outdoor Gringos Gift Voucher',
										'P160 Kaulayaw Cafe Gift Voucher'
									]
								}
							]
						},
						{
							numbering: 'b',
							label: 'Example 2',
							items: [
								{
									numbering: 'i',
									label: 'By Feb 1, total points earned is 10pts, user can redeem the following',
									bullets: [
										'P250 Outdoor Gringos Gift Voucher',
										'P160 Kaulayaw Cafe Gift Voucher'
									]
								},
								{
									numbering: 'ii',
									label: 'Then by Feb 27, total points earned is at 25pts, user can also redeem the following:',
									bullets: [
										'P500 Peak Pursuits Discount Voucher',
										'P300 Power Up Wall Climb Gift Voucher'
									]
								}
							]
						}
					],
				},
				{
					numbering: 4,
					label: 'Customer will scan the corresponding QR Code(s) shown by the R.O.X. BGC store cashier personnel',
					items: [],
				},
				{
					numbering: 5,
					label: 'Customer will be given the physical voucher(s)',
					items: [],
				},
				{
					numbering: 6,
					label: 'Customer will show the voucher to R.O.X. BGC Store representative either at Outdoor Gringos(Meal), Kaulayaw Cafe(Coffee) or Power-up wall climb',
					items: [
						{
							numbering: 'a',
							label: 'For Peak Pursuits redemption, upload photo of the voucher with a unique redemption code(serial number located on the upper right of the voucher) upon registration',
							items: []
						},
					],
				},
				{
					numbering: 7,
					label: 'Store representative will list down the name, email address, and mobile number of the user that has used the voucher',
					items: [],
				},
			],
			notes: [
				{
					numbering: 'a',
					label: 'Vouchers are valid only until December 31, 2023',
				},
				{
					numbering: 'b',
					label: 'Voucher cannot be converted to cash',
				},
				{
					numbering: 'c',
					label: 'Each type of voucher can only be redeemed once',
				},
				{
					numbering: 'd',
					label: 'Points redemption period will end on March 31, 2023',
				},
				{
					numbering: 'e',
					label: 'Claiming of vouchers are on a first come first serve basis, until voucher supplies last only',
				},
				{
					numbering: 'f',
					label: 'One voucher per transaction only',
				},
				{
					numbering: 'g',
					label: 'Not in conjunction with any other existing promo in the stores.',
				},
				{
					numbering: 'h',
					label: 'Actual use of voucher will start on March 20, 2023.',
				}
			],
			isDesktop: false,
			transactionalPoints: 0,
			activityPoints: 0,
		};
	},
	computed: {
		myLevel() {
			let levels = this.$store.getters.getActivityLevels;
			let myPoints = this.activityPoints || 0;
			let myLevels = levels.filter((it) => {
				return myPoints >= it.minPoints && myPoints <= it.maxPoints;
			});
			if(myLevels.length == 0) return levels[levels.length - 1];
			return myLevels[0];
		}
	},
	methods: {
		resize() {
			this.isDesktop = window.innerWidth >= 672;
		},
		setTab(index) {
			this.activeTabIndex = index;
		},
	},
	async created() {
		try {
			this.loading = true;
			if (!this.$store.getters.hasInited) await this.refreshMainData();
			this.customer = this.$store.getters.getCustomer;
			let res = await getTransactionalPoints();
			if (res.success && !isEmpty(res.customer.rewards)) {
				this.transactionalPoints = res.customer.rewards.totalRewardPoints;
				this.customer.rewards = res.customer.rewards;
				this.customer.eunoiaId = res.customer.id;
			}
			this.activityPoints = this.customer?.points || 0;
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
		.voucher-btn {
			padding: 8px 24px;
			background: $primary-color-50;
			color: $white;
			font-weight: bold;
			border-radius: 24px;
			display: flex;
			gap: 12px;
			align-items: center;
			cursor: pointer;
			&:hover {
				opacity: 0.7;
			}
		}
		.reward-tabs-content {
			width: 100%;
			display: flex;
			align-items: center;
			z-index: 2;
			background: $white;
			box-shadow: 0 2px 2px -2px rgba(0, 0, 0, 0.3);
			.reward-tabs {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 16px;
				width: fit-content;
				margin: 0 auto;
				background: $white;
				position: relative;
				padding: 0 24px;
				.reward-tab-indicator {
					position: absolute;
					bottom: 0;
					height: 2px;
					width: 100%;
					max-width: calc(50% - 16px);
					background: $primary-color-60;
					transition: all 0.5s;
					transform: translateX(calc(-50% - 16px));
					&.move-next {
						max-width: 50%;
						transform: translateX(50%);
					}
				}
				.reward-tab-item {
					margin: 0 !important;
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 16px 0;
					border-bottom: 2px solid transparent;
					cursor: pointer;
					font-weight: bold;
					&:hover {
						opacity: 0.7;
					}
					&.active {
						//border-bottom-color: $primary-color-60; 
						color: $primary-color-60;

						.reward-tab-item-badge {
							background: $primary-color-20 !important;
						}
					}

					.reward-tab-item-label {
						text-align: center;
					}

					.reward-tab-icon {
						color: #8A8F69;
						&.height {
							color: #CE7E2A !important;
						}
					}
					.reward-tab-item-badge {
						padding: 4px 10px;
						background: $secondary-color-20;
						border-radius: 12px;
						font-size: 0.8em;
						white-space: nowrap;
					}
				}
			}
		}
		.rewards-wrapper {
			flex: 4;
			width: 200%;
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
	.points-header {
		padding: 16px;
		height: 56px;

		.points-header-left {
			margin-left: auto;
		}
	}

	.points-content {
		padding: 24px;
	}

	.points-logo-con {
		width: fit-content;
		margin: auto;
		margin-bottom: 32px;
		margin-top: -64px;
	}
	.points-logo {
		margin: 0 auto;
	}

	.points-info-con {
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 8px;

		.info-cust-name-con {
			display: flex;
		}

		.info-points {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			.sd-icon-btn {
				padding-top: 0px !important;
				padding-left: 0px !important;
				padding-bottom: 6px !important;
			}
		}
		.info-surprise-con {
			padding: 16px;
			border-radius: 12px;
			background-color: $primary-color-10;
			display: flex;
			flex-direction: column;
			gap: 8px;

			.info-surprise {
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				width: 100%;
			}
			.info-surprise-point-con {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 110px;

				.heading-4 {
					white-space: nowrap;
				}
				.sd-icon-btn {
					padding-top: 0px !important;
				}
			}
		}
	}
	.info-how-to {
		margin-top: 12px;

		.activity-item, .notes-header {
			font-size: 0.875rem;
			width: 100%;
			display: block;
		}
		.notes-header {
			padding: 12px 0;
			padding-top: 24px;
		}
		.activity-item + .activity-item,
		.activity-title + .activity-sub-item {
			margin-top: 12px;
		}
		.act-con {
			width: 100%;
			margin-top: 0 !important;
		}
		.subitem-con {
			width: 100%;
		}
		.activity-title, .sub-title, .subitem-title {
			width: 100%;
			display: flex;
			flex-direction: row;
			align-items: flex-start;
			justify-content: flex-start;
		}
		.activity-num, .sub-num, .subitem-num {
			width: 18px;
		}
		.activity-label, .sub-label, .subitem-label {
			flex: 1;
		}
		.subitem-con, .sub-con {
			padding-left: 18px;
		}
		.bullets {
			width: 100%;
			padding-left: 28px;
		}
		.bullets li {
			width: 100%;
			padding: 0;
			list-style: disc;
		}
		.notes {
			width: 100%;
		}
		.notes + .notes {
			margin-top: 6px !important;
		}
		.activity-item:not(.notes) + .notes {
			margin-top: 32px;
		}
	}
	@media (min-width: 672px) {
		.points-header {
			padding: 16px 96px;
		}

		.points-content {
			padding: 24px 96px;
		}

		.reward-tabs {
			gap: 48px !important;
			padding: 0px !important;
			.reward-tab-item {
				gap: 16px !important;
			}
			.reward-tab-item-badge {
				padding: 4px 16px !important;
			}
			.reward-tab-indicator {
				max-width: calc(50% - 32px) !important;
				transform: translateX(calc(-50% - 32px)) !important;
				&.move-next {
					max-width: calc(50% - 16px) !important;
					transform: translateX(calc(50% + 16px)) !important;
				}
			}
		}
	}
</style>
