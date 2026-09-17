<template>
	<div class="page__content">
		<div class="page__content__otp">
			<p class="page__content__comment heading-5">Almost done!</p>
			<p class="page__content__title heading-4">
				Please enter your one-time password
			</p>
			<p class="page__content__subheading body-2-normal">
				Enter the 6 digit code we have sent to your email address <a class="anchor no-underline" href="javascript:void()">({{ email }})</a>
			</p>
			<div class="page__content__code">
				<code-boxes
					@submit-code="codeSubmissionHandler"
					:totalBoxes="boxes"
				></code-boxes>
			</div>

			<p
				v-show="disableSendOTP"
				class="page__content__resend body-2-normal"
			>
				Resend code in {{ otpTimer }} seconds
			</p>
			<p
				@click="resendOTPHandler"
				v-show="!disableSendOTP"
				class="page__content__resend body-2-normal"
			>
				Resend OTP code
			</p>
		</div>
		<div class="register-button-con">
			<base-button
				btnLabel="Continue"
				:isRightIcon="true"
				class="sd-btn-primary sd-btn-md body-1-normal medium"
				@click="start"
			/>
		</div>
	</div>
</template>

<script>
import { loginWithOTP, sendOTP } from "@/connector/v4/customerConnector";
import eventStatusesHandler from "@/lib/eventStatusesHandler";
import CodeBoxes from "@/presentation/components/CodeBoxes.vue";
import utility from "@/presentation/mixins/utility.js";
export default {
	components: {
		CodeBoxes,
	},
	mixins: [utility],
	props: {
		email: {
			type: String,
			required: true,
		},
		redirect: {
			type: String,
			required: true,
		},
		congratulateUser: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			boxes: 6,
			disableSendOTP: true,
			otpTimer: 90,
			otpTimerFunction: null,
			enabledButton: false,
			currentOtp: ""
		};
	},
	methods: {
		start() {
			if (!this.enabledButton) return;
			this.loginWithOTP(this.currentOtp, this.email);
		},
		async sendOTP(email) {
			try {
				let otpResponse = await sendOTP(email);
				if (!otpResponse || !otpResponse.success)
					this.showNotification(
						"alert",
						"error_outline",
						"Error occured when sending OTP"
					);
			} catch (error) {
				this.showNotification(
					"alert",
					"error_outline",
					"Error occured when sending OTP"
				);
			}
		},
		codeSubmissionHandler(otpCode) {
			this.currentOtp = otpCode;
			this.enabledButton = true;
		},
		resendOTPHandler() {
			this.disableSendOTP = true;
			this.sendOTP(this.email);
			this.otpTimer = 90;
			this.startOTPTimer();
		},
		startOTPTimer() {
			this.otpTimerFunction = setInterval(() => {
				if (this.otpTimer > 0) this.otpTimer -= 1;
				else this.clearOTPTimer();
			}, 1000);
		},
		clearOTPTimer() {
			clearInterval(this.otpTimerFunction);
			this.disableSendOTP = false;
		},
		async loginWithOTP(otpCode, email) {
			try {
				let login = await loginWithOTP({
					email,
					otp: otpCode,
				});

				// TODO: refactor this into service layer
				if (login.success) {
					this.$store.dispatch("setLoginToken", login.authToken);
					this.$store.dispatch("setCustomer", login.customer);

					window.dataLayer.push({
						event: "login",
						authentication_method: "OTP",
						method: "OTP",
						user_id: email,
					});

					if (this.redirect) {
						return this.$router.push(this.redirect);
					}
					if (this.$route.query.redirect) {
						this.$router.push(this.$route.query.redirect);
					} else {
						if (this.congratulateUser) {
							this.$router.push({
								name: "GetStarted",
								params: {
									registered: true
								},
							});
							return;
						}
						eventStatusesHandler.updateStatuses();

						this.goTo("WelcomePage");
					}
				} else {
					this.enabledButton = false;
					this.showNotification(
						"alert",
						"error_outline",
						"OTP codes are not valid."
					);
				}
			} catch (error) {
				this.showNotification(
					"alert",
					"error_outline",
					"Error logging in"
				);
			}
		},
	},
	async mounted() {
		await this.refreshMainData(true);
		this.startOTPTimer();
		await this.sendOTP(this.email);
	},
	unmounted() {
		this.clearOTPTimer();
	},
};
</script>
<style lang="scss" scoped>
.page {
	&__content {
		text-align: center;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 48px;
		&__otp {
			width: 100%;
			padding: 16px 24px;
		}
		&__comment {
			color: $secondary-color-40;
			margin-top: 24px;
		}
		&__title {
			margin-top: 24px;
		}
		&__subheading {
			margin-top: 16px;
			color: $secondary-color-80;
		}
		&__resend {
			text-align: center;
			color: $link-blue-color;
			cursor: pointer;
			margin-top: 48px;
			font-weight: bold;

			&.disabled {
				cursor: not-allowed;
				color: $secondary-color-40;
			}
		}
		&__code {
			margin-top: 24px;
		}
	}
}
.register-button-con {
	display: flex;
	flex-direction: column;
	margin: 0 auto;
	margin-top: auto;
	width: 100%;
	* {
		flex: 1;
		&.disabled {
			background: $secondary-color-30;
			pointer-events: none;
		}
	}
}
.anchor {
	color: $secondary-color-90;
	font-weight: bold;
}
.no-underline {
	text-decoration: none;
}
@media (min-width: 672px) {
	.page {
		&__content {
			align-items: center;
			justify-content: center;
			text-align: center;
			background-image: url('@/assets/images/registration-bg.png');
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			&__otp {
				border-radius: 12px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
				background: $white;
				margin: 0 auto;
				max-width: 500px;
			}
		}
	}
	.register-button-con {
		margin-top: 0;
		max-width: 500px;
	}
}
</style>
