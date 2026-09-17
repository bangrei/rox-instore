<template>
	<landing-layout>
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con float" @click="togoBack">
					<div class="material-icons">arrow_back</div>
					<h4>Back</h4>
				</div>
			</div>
		</template>
		<template v-slot:content>
			<template v-if="proceedOTP">
				<div class="otp-con">
					<one-time-password :email="email"></one-time-password>
				</div>
			</template>
			<template v-else>
				<login-email
					@proceed-otp="handleProceedOTP"
					@proceed-register="handleProceedRegister"
					@toggle-loading="toggleLoading"
				></login-email>
				<div class="body-footnote">
					<span>&copy; {{ thisYear }} R.O.X Community</span>
					<div class="footnote-tnc">
						<span class="tnc-item" @click="goTo('TnCPage')">Terms of Use</span>
						<span class="tnc-item" @click="goTo('PolicyPage')">Privacy Policy</span>
					</div>
				</div>
			</template>
		</template>
	</landing-layout>
</template>
<script>
import LandingLayout from "@/components/layout/LandingLayout.vue";
import OneTimePassword from "@/presentation/components/OneTimePassword.vue";
import utility from "@/presentation/mixins/utility.js";
import LoginEmail from "./components/LoginEmail.vue";
export default {
	name: "LoginPage",
	mixins: [utility],
	components: {
		OneTimePassword,
		LoginEmail,
		LandingLayout
	},
	props: {
		passedEmail: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			email: "",
			proceedOTP: false,
			isError: false,
			showBack: false,
			loading: false,
			thisYear: null,
		};
	},
	methods: {
		togoBack() {
			if (this.$route.query.redirect) {
				return this.$router.replace({
					path: this.$route.query.redirect,
					params: this.$route.params
				});
			}
			this.goBack();
		},
		toggleLoading(val) {
			this.loading = val == true;
		},
		async handleProceedOTP(email) {
			this.proceedOTP = true;
			this.email = email;
		},
		async handleProceedRegister(email) {
			let params = { passedEmail: email };
			if (this.$route.query.redirect) params.redirect = this.$route.query.redirect;
			this.goToWithParams("RegisterPage", params);
		},
	},
	async created() {
		this.showBack = this.$route.query.redirect != null;
		const date = new Date();
		this.thisYear = date.getFullYear();
		let serverInited = this.$store.getters.isServerInited;
		this.refreshMainData(serverInited == true);
	},
	mounted() {
		if (this.passedEmail) {
			this.handleProceedOTP(this.passedEmail);
		}
	},
};
</script>

<style lang="scss" scoped>
.otp-con {
	padding: 0 24px;
}
.header-con {
	justify-content: flex-start;
	gap: 16px;
	padding: 24px !important;
	color: $primary-color-60;

	&.float {
		background: transparent;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 2;
		width: fit-content;
	}

	* {
		cursor: pointer;
	}
}
.body-footnote {
	background: $primary-color-90;
	margin-top: auto;
	padding: 16px;
	color: $white;
	display: flex;
	flex-direction: column-reverse;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	font-size: 0.85em;
	&.invisible {
		display: none !important;
	}
	.footnote-tnc {
		display: flex;
		gap: 48px;
		align-items: center;
		.tnc-item {
			font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
			color: $primary-color-60;
			&:hover {
				cursor: pointer;
				color: $white;
			}
		}
	}
}
</style>
