<template>
	<div class="reward-section" :class="{'active': isActive}">
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
							<span class="points-icon height material-icons">flag_circle</span>
							<span class="points-amount">{{ points }}</span>
						</div>
						<span class="points-label height">{{ myLevel ? ('/ ' + myLevel.maxPoints) : '' }} R.O.X. Heights</span>
					</div>
				</div>
				<div class="rewards-details-item" v-if="myLevel">
					<img 
						:src="require(`@/assets/images/reward-level-${myLevel.id}.svg`)" 
						alt=""
					/>
				</div>
				<div class="rewards-details-item" v-if="nextLevel">
					<div class="next-level-text">
						<span class="next-level-text-1">{{ nextLevel.minPoints - points }} R.O.X. Heights </span>
						<span class="next-level-text-2">to {{ nextLevel.name }} milestone</span>
					</div>
				</div>
				<div class="rewards-details-item">
					<div class="current-level">
						<div class="current-level-title">{{ myLevel.title }}</div>
						<div class="current-level-desc">You're currently at {{ myLevel.name }}</div>
						<div class="current-level-decoration">
							<span class="material-icons">flag_circle</span>
							<span>{{ myLevel.minPoints }}</span> - <span>{{ myLevel.maxPoints }}</span>
						</div>
					</div>
				</div>
				<div class="rewards-details-item">
					<div class="benefits">
						<div class="benefits-title">All Level Benefits</div>
						<div class="benefits-content">
							<div class="benefit-item" 
								v-for="level in levels" 
								:key="level.id"
								:class="{'selected': selectedLevel && level.id == selectedLevel.id}"
								@click="selectLevel(level)">
								{{ level.name }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="section pattern-2">
			<div class="section-wrapper">
				<h2 style="line-height: 1.2;">How To Earn R.O.X. Heights Points</h2>
				<div class="icons-wrapper">
					<div class="icon-item" v-for="(how, i) in howToEarns" :key="i">
						<img :src="require('@/assets/images/' + how.icon)" :alt="how.label">
						<span v-html="how.label"></span>
					</div>
				</div>
				<div class="benefit-selection">
					<div class="selection-title">{{ selectedLevel.name }} Member Benefits</div>
					<div class="selection-content">
						<div class="selection-desc">In this level, there are bonus and rewards that you can explore. Enjoy the available perks and discounts below:</div>
						<div class="selection-item" v-for="(benefit, i) in selectedLevel.benefits" :key="i">
							<span class="selection-icon material-icons-outlined">grade</span>
							<div class="selection-benefits">
								<span class="benefit-name">{{ benefit.name }}</span>
								<div class="benefit-desc">
									<div style="display: flex;align-items: center;">
										{{ benefit.description }} 
										<span v-if="benefit.withToggle" @click="benefit.toggle = !benefit.toggle" class="selection-icon active material-icons-outlined">arrow_drop_down</span>
									</div>
								</div>
								<div v-if="benefit.withToggle" class="selection-toggle-content" :class="{'active': benefit.toggle}">
									<h2 style="line-height: 1.2;padding-bottom: 8px;margin-top: 24px;">Birthday Discount</h2>
									<div class="icons-wrapper grid-3">
										<div class="icon-item" v-for="(bd, n) in birthdayInfo" :key="n">
											<img :src="require('@/assets/images/' + bd.icon)" :alt="bd.label">
											<span>{{ bd.label }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import moment from 'moment-timezone';
import VueQRCodeComponent from 'vue-qrcode-component';
const qrCode = VueQRCodeComponent;
export default {
	name: "ActivityReward",
	components: {
		qrCode,
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
			levels: [],
			selectedLevel: null,
			howToEarns: [
				{ icon: 'reward-articles-icon.png', label: 'Reading<br/>Articles' },
				{ icon: 'reward-survey-icon.png', label: 'Answering<br/>Surveys' },
				{ icon: 'reward-activities-icon.png', label: 'Participating in<br/>Games and Activities' },
				{ icon: 'reward-booking-icon.png', label: 'Booking<br/>in Events' },
			],
			birthdayInfo: [
				{ icon: 'reward-mail-icon.png', label: 'Receive Email Notification' },
				{ icon: 'reward-gift-icon.png', label: 'Access Your Birthday Badge on Your ROX Community Web App' },
				{ icon: 'reward-discount-icon.png', label: 'Redeem Your Discount at any ROX Store' },
			],
			showBirthdayInfo: false,
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
		myLevel() {
			let levels = this.levels.filter((it) => {
				return this.points >= it.minPoints && this.points <= it.maxPoints;
			});
			if(levels.length == 0) return this.levels[this.levels.length - 1];
			return levels[0];
		},
		nextLevel() {
			let myLevel = this.myLevel;
			if (!myLevel) return this.levels[0];
			return this.levels.find((it) => {
				return it.minPoints > myLevel.maxPoints;
			});
		}
	},
	methods: {
		toggleBirthdayInfo() {
			this.showBirthdayInfo = !this.showBirthdayInfo;
		},
		createLevels() {
			this.levels = this.$store.getters.getActivityLevels;
		},
		selectLevel(level) {
			this.selectedLevel = level;
		}
	},
	created() {
		this.createLevels();
		this.selectedLevel = this.myLevel;
	},
};
</script>
<style scoped lang="scss">
	.current-level {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px 24px;
		border-radius: 8px;
		background: hsla(18, 100%, 39%, 0.12);
		width: 100%;
		gap: 16px;
		.current-level-title {
			color: #C53B00;
			font-weight: bold;
			text-align: center;
			font-family: 'Akzidenz Grotesk Super';
		}
		.current-level-desc {
			color: $secondary-color-70;
		}
		.current-level-decoration {
			border-radius: 16px;
			background: $white;
			padding: 4px 16px;
			font-size: 0.9em;
			display: flex;
			align-items: center;
			gap: 6px;
			color: #CE7E2A;
		}
	}
	.next-level-text {
		width: 100%;
		text-align: center;
		.next-level-text-1 {
			font-weight: bold;
		}
		.next-level-text-2 {
			color: $secondary-color-70;
		}
	}
	.benefits {
		padding: 12px 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		.benefits-title {
			font-weight: bold;
			color: $secondary-color-90;
		}
		.benefits-content {
			width: 100%;
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 16px 0;
			justify-content: center;
			padding-bottom: 32px !important;
			.benefit-item {
				border-radius: 16px;
				border: 1px solid $secondary-color-20;
				padding: 4px 16px;
				font-size: 0.9em;
				cursor: pointer;
				&:hover {
					opacity: 0.7;
				}
				&.selected {
					background: $secondary-color-90;
					border: 1px solid $secondary-color-90;
					color: $white;
				}
			}
		}
	}
	.benefit-selection {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 16px;
		.selection-title {
			font-weight: bold;
			text-align: left;
		}
		.selection-content {
			display: flex;
			flex-direction: column;
			gap: 16px;
			align-items: flex-start;
			.selection-desc {
				text-align: left;
			}
			.selection-item {
				display: flex;
				// align-items: center;
				width: 100%;
				gap: 16px;
				.selection-icon {
					color: $secondary-color-50;
					&.active {
						color: $primary-color-60 !important;
						cursor: pointer;
						font-size: 2.0em !important;
					}
				}
				.selection-benefits {
					display: flex;
					flex: 1;
					flex-direction: column;
					align-items: flex-start;
					justify-content: flex-start;
					.benefit-name {
						font-weight: bold;
						text-align: left;
					}
					.benefit-desc {
						text-align: left;
					}
					.selection-toggle-content {
						width: 0;
						height: 0;
						overflow: hidden;
						transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
						&.active {
							width: 100% !important;
							height: auto !important;
							border: 1px solid $secondary-color-20;
							border-radius: 12px;
							padding: 16px;
						}
					}
				}
			}
		}
	}
	.href {
		cursor: pointer;
		color: $primary-color-60;
	}
	.icons-wrapper {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 16px;
		row-gap: 24px;

		& + * {
			margin-top: 24px;
		}

		&.grid-3 {
			grid-template-columns: 1fr 1fr 1fr !important;
			img {
				& + * {
					max-width: unset !important;
				}
			}
		}

		.icon-item {
			display: flex;
			flex-direction: column;
			gap: 8px;
			align-items: center;

			img {
				max-width: 60px;
				& + * {
					max-width: 150px;
				}
			}
		}
	}
</style>
