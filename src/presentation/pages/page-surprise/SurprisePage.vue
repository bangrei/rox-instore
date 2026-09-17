<template>
	<layout-variant-two :show-main-logo="true" :show-loading-screen="loading">
		<template v-slot:body>
			<div class="surprise-body">
				<div class="title-con">
					<p class="heading-4 bold">{{ surprise.name }}</p>
				</div>
				<div class="surprise-image-con" v-if="surprise.image">
					<img
						class="surprise-image"
						:src="surprise.image"
						alt="surprise image"
					/>
				</div>

				<div class="surprise-desc-wrapper">
					<div class="surprise-desc-title-con">
						<!-- <div class="tooltip">
							<div class="tooltip-wrapper" v-html="surprise.description"></div>
						</div> -->
						<h5 class="primary-color-50" v-html="nudgeDescription"></h5>

						<span class="body-3-normal regular secondary-color-60">
							Scroll below and enter the code
						</span>
					</div>

					<div class="surprise-desc-content-con" v-if="surprise.detail">
						<div class="heading-4" v-html="surprise.detail.name"></div>
						<div class="body-2-normal regular" v-html="surpriseDescription"></div>
						<br />
						<div id="scan-using-app">
							<p>
								Scan using the app
							</p>
							<br />
							<img :src="qrImageSrc" />
						</div>
						<div class="surprise-code-wrapper" v-if="surprise.status != 'CLAIMED'">
							<p class="body-1-normal bold redemption-indicator" :class="{'processing': processing}">
								Code entered by Staff to redeem
							</p>

							<code-boxes
								:totalBoxes="6"
								:isSuccess="isSuccess"
								:isFailed="isFailed"
								:isRedeemed="isRedeemed"
								:showMessage="showMessage"
								:redeemMessage="redeemMessage"
								ref="codeBoxes"
								@submit-code="submitCode"
							/>
						</div>
						<p v-else class="body-1-tight bold already-claimed">
							Already claimed!
						</p>
					</div>
				</div>

				<div
					class="linked-nudge-con"
					v-show="
						nudges && surprise && isPartOfLinkedNudges(surprise, nudges)
					"
				>
					<linked-nudges
						title="Awesome! Now, earn more points by completing the series."
						:nudges="nudges"
						:currentNudge="surprise"
					/>
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import { surpriseService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import CodeBoxes from "@/presentation/components/CodeBoxes.vue";
import LinkedNudges from "@/presentation/components/LinkedNudges.vue";
import utility from "@/presentation/mixins/utility.js";

export default {
	name: "SurprisePage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		CodeBoxes,
		LinkedNudges,
	},
	props: {
		nudgeId: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			qrImageSrc: null,
			loading: false,
			surprise: {},
			isSuccess: false,
			isFailed: false,
			isRedeemed: false,
			showMessage: false,
			redeemMessage: "",
			nudges: [],
			processing: false,
			isDestroyed: false,
		};
	},
	computed: {
		nudgeDescription() {
			if (!this.surprise) return "";
			if (!this.surprise.description) return "";
			return this.surprise.description.split(/\r\n|\r|\t/g).join("<br/>").split(/\n/g).join("br/>");
		},
		surpriseDescription(){
			if (!this.surprise) return "";
			if (!this.surprise.detail) return "";
			if (!this.surprise.detail.type) return "";
			return this.surprise.detail.type.split(/\r\n|\r|\t/g).join("<br/>").split(/\n/g).join("br/>");
		}
	},
	methods: {
		reset() {
			this.loading = false;
			this.isFailed = false;
			this.isSuccess = false;
			this.isRedeemed = false;
			this.showMessage = false;
			this.redeemMessage = "";
			this.processing = false;
		},
		async submitCode(codes) {
			try {
				this.processing = true;
				let pointsEarned = await surpriseService.updateStatus({
					nudge: this.nudgeId,
					type: "CLAIMED",
					code: codes,
				});

				let message = `Awesome! You earned ${pointsEarned} activity points.`;
				if (pointsEarned == 0) message = `Awesome! Surprisingly redeemed.`;
				
				this.isSuccess = true;
				this.showMessage = true;
				this.redeemMessage = "Enjoy your price!";
				this.showNotification(
					"point",
					"star",
					message
				);
				this.surprise.status = "CLAIMED";
				this.reset();
			} catch (error) {
				this.reset();
				this.isFailed = true;
				this.showMessage = true;
				this.redeemMessage = error;
			}
		},
	},
	async created() {
		try {
			this.isDestroyed = false;
			this.loading = true;
			this.surprise = await surpriseService.getDetail(this.nudgeId);
			this.qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=2=500x500&data=${this.nudgeId}${this.$store.getters.getToken}`
			this.nudges = await surpriseService.getNudges({
				authToken: this.$store.getters.getToken,
			});

			if (this.surprise && this.surprise.status == "AWARDED") {
				let pointsEarned = await surpriseService.updateStatus({
					nudge: this.nudgeId,
					type: "READ",
				});

				if (pointsEarned > 0) {
					this.showNotification(
						"point",
						"star",
						`Awesome! You earned ${pointsEarned} activity points.`
					);
				}
			}
			this.loading = false;
			let self = this;
			if (self.surprise && self.surprise.status !== "CLAIMED") {
				const timer = setInterval(async () => {
					let prev = JSON.parse(JSON.stringify(self.surprise));
					self.surprise = await surpriseService.getDetail(self.nudgeId);
					if (!self.surprise) self.surprise = prev;
					if ((self.surprise && self.surprise.status == "CLAIMED") || self.isDestroyed) clearInterval(timer);
				}, 3000);
			}
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
	beforeUnmount() {
		this.isDestroyed = true;
	}
};
</script>

<style scoped lang="scss">
.sd-icon-btn-ghost-lite {
	color: $white;
	background: transparent !important;
}
.surprise-header {
	display: flex;
	justify-content: space-between;
	padding: 16px;
}
.surprise-body {
	width: 100%;
	padding: 16px 0;
}

.title-con {
	padding: 32px 16px;
	text-align: center;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	padding-inline: 24px;
}

.surprise-image {
	width: 100%;
	object-fit: cover;
	aspect-ratio: 16/9;
}

.surprise-desc-title-con {
	background-color: $primary-color-10;
	padding: 16px;
	position: relative;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	font-weight: normal !important;

	.tooltip {
		display: none;
		position: absolute;
		top: 85px;
		left: 24px;
		right: 24px;
		padding: 24px;
		background: $white;
		border-radius: 8px;
		z-index: 2;
		max-width: 900px;
		text-align: left;
		width: calc(100% - 48px);
		margin: 0 auto;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		-webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		.tooltip-wrapper {
			max-height: 300px;
			overflow: hidden;
			overflow-y: auto;
		}
		&::after {
			content: "";
			width: 24px;
			height: 24px;
			background: white;
			z-index: 2;
			top: -10px;
			right: 16px;
			position: absolute;
			transform: rotate(45deg);
		}
	}
	&:hover {
		& .tooltip {
			display: block;
		}
	}

	h5 {
		margin: 0;
		margin-bottom: 8px;
		// -webkit-line-clamp: 5;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		white-space: pre-line;
	}
}

.surprise-image-con {
	margin-bottom: -5px;
	width: 100%;
	max-width: 600px;
	margin-inline: auto;
}
.surprise-desc-wrapper {
	width: 100%;
	max-width: 600px;
	margin-inline: auto;
}

.surprise-desc-content-con {
	padding: 32px 16px;
	text-align: left;

	.already-claimed {
		width: fit-content;
		margin-inline: auto;
		padding-block: 24px;
		font-size: 2em;
	}

	.heading-4 {
		margin-bottom: 24px;
	}
	@keyframes processAnim {
		0% { 
			width: 10%;
			left: 0;
		}
		100% {
			width: 100%;
			left: 100%;
		}
	}
	@-webkit-keyframes processAnim {
		0% { 
			width: 10%;
			left: 0;
		}
		100% { 
			width: 100%; 
			left: 100%;
		}
	}
	.surprise-code-wrapper {
		text-align: center;
		margin-top: 32px;
		.redemption-indicator {
			font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
			font-weight: normal !important;
			padding-bottom: 16px;
			margin-bottom: 16px;
			position: relative;
			&:is(.processing) {
				overflow: hidden;
				max-width: 350px;
				margin-inline: auto;
				&::before, 
				&::after {
					content: "";
					position: absolute;
					left: 0;
					bottom: 0;
					width: 100%;
					height: 3px;
					transition: all 2.5s linear;
					-webkit-transition: all 2.5s linear;
				}
				&::before {
					background: $secondary-color-20;
				}
				&::after {
					background: $primary-color-60;
					animation: processAnim 1.5s infinite;
					-webkit-animation: processAnim 1.5s infinite;
				}
			}
		}
	}
}

.surprise-code-con {
	padding: 16px 20px;
	display: flex;
	justify-content: center;
	gap: 10px;

	.code-box.active {
		background-color: #fffbeb;
		border-radius: 12px;
		padding: 4px 8px;

		&.success {
			border: 1px solid $success-base;
		}

		&.failed {
			border: 1px solid $alert-base;
		}
	}
}

.surprise-code-message {
	padding-bottom: 32px;
}

.linked-nudge-con {
	padding: 16px;
}
@media (min-width: 672px) {
    .surprise-header,
	.surprise-body {
        padding: 24px 7% !important;
    }
	.surprise-desc-content-con {
		padding-inline: 0 !important;
	}
}
div#scan-using-app {
	img {
		margin: 0 auto;
	}

	margin: 0 auto;
	text-align: center;
}
</style>
