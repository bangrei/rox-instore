<template>
	<layout-variant-two :autoHeight="proceedRegister">
		<template v-slot:body>
			<div class="register-page-con">
				<register-check-email
					@proceed-otp="handleProceedOTP"
					@proceed-register="handleProceedRegister"
					v-if="checkRegistration && !proceedOTP && !proceedRegister"
					ref="registerCheckEmail"
				></register-check-email>
				<one-time-password
					:email="email"
					:redirect="redirect"
					v-if="proceedOTP"
					:congratulateUser="congratulateUser"
				></one-time-password>

				<template v-if="proceedRegister">
					<img class="img-as-bground" :src="require('@/assets/images/registration-bg.png')" alt="register background"/>
					<register-question></register-question>
					<div class="tnc-wrapper">By clicking "Continue", you agree to the <a :href="tncLink" target="_blank" class="link no-underlined">R.O.X Community Terms of Service</a></div>
					<div class="register-progress-con">
						<base-button
							class="sd-btn-primary sd-btn-lg page__button"
							:isFullWidth="true"
							btnLabel="Continue"
							:isLoading="isLoading"
							:isDisabled="isLoading || !currentAnswer"
							@click="handleClick"
						></base-button>
					</div>
				</template>
			</div>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
//import BaseSlab from "../page-survey/components/BaseSlab.vue";
import RegisterQuestion from "./components/RegisterQuestion.vue";
import RegisterCheckEmail from "./components/RegisterCheckEmail.vue";
import OneTimePassword from "@/presentation/components/OneTimePassword.vue";
import { registerCustomer } from "@/connector/v4/customerConnector";
import { mapGetters } from "vuex";
import utility from "@/presentation/mixins/utility";
import moment from 'moment-timezone';

export default {
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		// BaseSlab,
		RegisterQuestion,
		RegisterCheckEmail,
		OneTimePassword,
	},
	props: {
		passedEmail: {
			type: String,
			default: "",
		},
		redirect: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			email: "",
			checkRegistration: true,
			proceedOTP: false,
			proceedRegister: false,
			isLoading: false,
			congratulateUser: false,
		};
	},
	async created() {
		this.$store.commit("register/changeCurrentIndex", 0);
		this.$store.commit("register/changeCurrentChildIndex", 0);
		this.refreshMainData(true);
		this.$store.dispatch("register/populateWithStaticQuestions");
	},
	mounted() {
		if (this.passedEmail) {
			this.$refs.registerCheckEmail.email = this.passedEmail;
			this.email = this.passedEmail;
			this.proceedRegister = true;
		}
	},
	methods: {
		handleProceedOTP(email) {
			this.proceedOTP = true;
			this.email = email;
		},
		handleProceedRegister(email) {
			this.proceedRegister = true;
			this.email = email;
		},
		async handleClick() {
			if (this.currentQuestion.apiField == "phone") {
				let isValidPhone = this.isValidPhone(this.currentAnswer);

				if (!isValidPhone) {
					this.showNotification(
						"alert",
						"error_outline",
						"Please input a valid mobile number."
					);

					return;
				}
			}

			let mappedAnswers = this.mappedAnswers;
			for (var ans in mappedAnswers) {
				if (!mappedAnswers[ans]) {
					let q = null;
					let msg = "Please fill in all fields!";
					let parent = this.registerQuestions.find((qs) => {
						return qs.children.filter((ch) => { return ch.apiField == ans }).length > 0
					});
					if (parent) {
						q = parent.children.find((ch) => { return ch.apiField == ans });
						if (q && q.required) {
							msg = q.placeholder;
							return this.showNotification(
								"alert",
								"error_outline",
								msg
							);
						}
					}
				}
			}
			let dob = mappedAnswers.dateOfBirth ? moment.tz(mappedAnswers.dateOfBirth, 'Asia/Singapore').format('YYYY-MM-DD') : null;
			mappedAnswers.dateOfBirth = dob;
			if (mappedAnswers.gender && !["MALE","FEMALE"].includes(mappedAnswers.gender)) mappedAnswers.gender = "";
			// do registration
			let registrationParams = {
				...{ email: this.email },
				...mappedAnswers,
			};
			this.isLoading = true;
			await this.registerCustomer(registrationParams);
			this.isLoading = false;
		},
		async registerCustomer(customerParams) {
			try {
				let response = await registerCustomer(customerParams);
				if (response.success) {
					// logging in the customer
					this.proceedRegister = false;
					this.proceedOTP = true;
					this.congratulateUser = true;

					return;
				} else {
					this.showNotification(
						"alert",
						"error_outline",
						response.message
					);
				}
			} catch (error) {
				this.showNotification(
					"alert",
					"error_outline",
					"Network Error"
				);
			}
		},
	},
	computed: {
		tncLink(){
            let url = window.location.origin;
            return `${url}/faq`;
        },
		...mapGetters({
			currentAnswer: "register/getCurrentAnswer",
			mappedAnswers: "register/getMappedAnswers",
			registerQuestions: "register/getQuestions",
			totalIndex: "register/getQuestionsLength",
			currentIndex: "register/getCurrentIndex",
			currentChildIndex: "register/getCurrentChildIndex",
		}),
		currentQuestion() {
			if (this.registerQuestions) {
				return this.registerQuestions[this.currentIndex].children[this.currentChildIndex];
			}
			return null;
		},
	},
};
</script>

<style scoped lang="scss">
	.tnc-wrapper {
		width: 100%;
		padding: 24px 0;
		max-width: 500px;
		margin: 0 auto;
	}
	.register-page-con {
		padding: 24px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.register-progress-con {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
		margin-top: auto;
	}

	.page__button {
		margin-top: 16px;
		font-weight: bold;
	}
	.img-as-bground {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		pointer-events: none;
		object-fit: cover;
		height: 100%;
		z-index: -1;
		margin: auto;
		width: auto;
		height: 100%;
		object-fit: cover;
	}
	@media (min-width: 672px) {
		.register-page-con {
			padding: 24px 0 !important;
			width: 100%;
			max-width: 800px;
			margin: auto;
		}
		.img-as-bground {
			width: 100% !important;
			height: 100%;
			object-fit: contain;
		}
	}
</style>
