<!-- template for error page and thank you page -->
<template>
	<div class="sd-base-con">
		<div class="sd-main-con" :class="{'fit-height': fitHeight}">
			<slot name="body">
				<div class="content-con">
					<div class="icon-con">
						<base-icon v-if="isCongrats == true"
							class="sd-icon-btn-ghost sd-icon-btn-sm unset-cursor align-middle"
							:iconName="iconName"
							iconSize="xxlg"
							iconStyle="outlined"
						></base-icon>
						<img v-else
							width="200"
							height="200"
							alt="rxc logo"
							:src="require('@/assets/images/404-icon.png')"
						/>
					</div>

					<div class="text-con">
						<h4 class="heading-4 primary-color-80">{{ title }}</h4>
						<span v-if="spotUsername" class="user-title">{{ spotUsername }}</span>
						<h4 class="heading-4">{{ subTitle }}</h4>
						<span v-if="highlightedTitle" class="highlighted-title">{{ highlightedTitle }}</span>

						<p
							class="body-1-normal regular secondary-color-60 instruction-text"
						>
							{{ instruction }}
						</p>
					</div>
				</div>

				<div class="button-con">
					<base-button v-if="showReview"
						btnLabel="Review my Result"
						class="sd-btn-secondary sd-btn-lg body-1-normal medium"
						:isFullWidth="true"
						@click="goReview"
					></base-button>
					<base-button
						:btnLabel="buttonText"
						:isFullWidth="true"
						class="sd-btn-primary sd-btn-lg body-1-normal medium"
						@click="goToHome"
					/>
				</div>
			</slot>
		</div>
	</div>
</template>

<script>
export default {
	name: "MessagePageLayout",
	props: {
		title: {
			type: String,
			default: "",
		},
		subTitle: {
			type: String,
			default: "",
		},
		spotUsername: {
			type: String,
			default: "",
		},
		highlightedTitle: {
			type: String,
			default: "",
		},
		instruction: {
			type: String,
			default: "",
		},
		buttonText: {
			type: String,
			default: "",
		},
		iconName: {
			type: String,
			default: "",
		},
		goToPage: {
			type: String,
			default: "EventsPage",
		},
		isCongrats: {
			type: Boolean,
			default: false,
		},
		fitHeight: {
			type: Boolean,
			default: false,
		},
		showReview: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		goReview() {
			this.$emit('do-review');
		},
		goToHome() {
			this.$router.push({
				name: this.goToPage,
			});
		},
	},
};
</script>

<style scoped lang="scss">
	.sd-main-con {
		width: 100%;
		position: relative;
		&:not(.fit-height){
			height: 100vh;
		}
		&:is(.fit-height) {
			position: relative;
			margin: auto 0;
			.content-con {
				position: relative;
				transform: unset !important;
				left: 0;
				top: 0;
				height: fit-content;
				margin: 0 auto;
			}
			.button-con {
				position: relative;
				margin-top: 24px;
			}
		}
	}

	.content-con {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		padding: 0 16px;
	}

	.text-con {
		padding: 16px 0 24px;

		.instruction-text {
			padding-top: 26px;
		}
	}

	.button-con {
		position: fixed;
		bottom: 16px;
		left: 0;
		width: 100%;
		padding: 0 16px;
	}

	.icon-con {
		img {
			width: 200px;
			height: 200px;
			margin: auto;
		}
	}

	.highlighted-title {
		text-transform: uppercase;
		color: $primary-color-60;
		font-weight: 900;
	}

	.user-title {
		color: $secondary-color-60;
		font-weight: 900;
		padding-bottom: 24px;
		display: block;
	}

	@media (min-width: 480px) {
		.sd-main-con {
			max-width: 480px;
		}
		.button-con {
			max-width: 480px;
			margin: 0 auto;
			left: 0;
			right: 0;
		}
	}

	@media (min-width: 672px) {
		.sd-main-con {
			max-width: 672px;
		}
		.button-con {
			max-width: 672px;
			margin: 0 auto;
			left: 0;
			right: 0;
		}
	}
</style>
