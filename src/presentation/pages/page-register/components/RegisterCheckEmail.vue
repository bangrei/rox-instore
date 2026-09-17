<template>
	<div class="page-email">
		<p class="page-email__title heading-4">What is your Email Address?</p>
		<p class="page-email__subheading body-2-normal">
			We value your data. No spam, no scam.
		</p>
		<input
			class="page-email__input"
			placeholder="Your Email"
			v-model="email"
			@keypress.enter="checkRegistrationFlow(email)"
		/>
		<base-button
			btnLabel="Continue"
			class="sd-btn-primary sd-btn-md page-email__button"
			:isLoading="isLoading"
			:isDisabled="isLoading || !email"
			@click="checkRegistrationFlow(email)"
		></base-button>
	</div>
	<div></div>
</template>
<script>
import utility from "@/presentation/mixins/utility";
import { loginService } from "@/bloc/services";
export default {
	emits: ["proceed-otp", "proceed-register"],
	mixins: [utility],
	data() {
		return {
			email: "",
			isLoading: false,
		};
	},
	methods: {
		async checkRegistrationFlow(email) {
			try {
				this.isLoading = true;
				this.refreshMainData(true);

				// check email validity
				if (!this.isValidEmail(email)) {
					this.showNotification(
						"alert",
						"error_outline",
						"Invalid Email"
					);
					this.isLoading = false;
					return;
				}

				const isRegistered = await loginService.isCustomerRegistered(
					email
				);
				this.isLoading = false;

				if (isRegistered) {
					this.$emit("proceed-otp", email);
				} else {
					this.$emit("proceed-register", email);
				}
			} catch (error) {
				this.showNotification("alert", "error_outline", error);
				this.isLoading = false;
			}
		},
	},
	created() {
		this.$store.commit("register/resetAllAnswers");
	}
};
</script>

<style scoped lang="scss">
.page-email {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	max-width: 500px;
	margin: 0 auto;
	&__number {
		color: $secondary-color-40;
		margin-top: 50px;
	}
	&__title {
		color: $secondary-color-100;
	}
	&__subheading {
		color: $secondary-color-40;
		margin-top: 16px;
	}

	&__answer {
		margin-top: 24px;
	}
	&__input {
		border: none;
		height: 52px;
		width: 100%;
		background: $primary-color-10;
		border-radius: 12px;
		padding: 16px;
		margin-top: 24px;
	}
	&__button {
		margin-top: auto;
		width: 100%;
		height: 40px;
	}
}
</style>
