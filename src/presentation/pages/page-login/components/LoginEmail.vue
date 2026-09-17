<template>
	<div class="page__login">
		<div class="page__content">
			<p class="page__content__title heading-4">
				{{ welcomeMessage }}
			</p>
			<p class="page__content__subtitle" v-if="!useLogin">
				Enter your email to receive a verification code.
			</p>
			<p class="page__content__label body-1-normal medium">E-mail</p>
			<input
				class="page__content__input"
				placeholder="Your Email"
				v-model="email"
			/>
		</div>
		<div class="spacer"></div>
		<base-button
			:btnLabel="useLogin ? 'Login or Sign Up' : 'Create account'"
			class="sd-btn-primary sd-btn-sm medium prev-btn page__button"
			:isLoading="isLoading"
			:isDisabled="isLoading || !email"
			@click="loginFlow(email)"
		></base-button>
		<div class="page__info">
			<span>{{ useLogin ? 'Don\'t' : 'Already' }} have an account?</span>
			<span class="page__info__signup" @click="toggleUseLogin()">{{ useLogin ? 'Sign up here' : 'Log in' }}</span>
		</div>
		<div class="page__or" v-if="facebookId || googleWebAppId">OR</div>
		<div class="page__icons" v-if="facebookId || googleWebAppId">
			<span v-if="facebookId" class="page__icons__icon custom" @click="loginFacebook()">
				<i class="custom-facebook"></i>
			</span>
			<span v-if="googleWebAppId" class="page__icons__icon custom" @click="loginGoogle()">
				<i class="custom-google"></i>
			</span>
		</div>
		<div :class="['loading-content', {'processing': isLoading}]"></div>
	</div>
</template>
<script>
import { loginService } from "@/bloc/services";
import { generateLoginToken, loginWithOTP, registerCustomer } from "@/connector/v4/customerConnector";
import utility from "@/presentation/mixins/utility";
import { googleSdkLoaded } from "vue3-google-login";
// import eventStatusesHandler from "@/lib/eventStatusesHandler";
import moment from 'moment-timezone';

export default {
	mixins: [utility],
	data() {
		return {
			email: "",
			isLoading: false,
			useLogin: true,
			googleWebAppId: "",
			facebookId: "",
			FBPage: null,
		};
	},
	computed: {
		welcomeMessage() {
			let msg = this.useLogin ? 'Welcome back' : 'Create your account';
			if (window.location.toString().indexOf('?redirect=') > -1) {
				msg = 'Login to Join the Adventure!';
			}
			return msg;
		}
	},
	methods: {
		toggleUseLogin() {
			this.useLogin = !this.useLogin;
		},
		async loginFlow(email) {
			try {
				this.isLoading = true;

				if (!this.isValidEmail(email)) {
					this.showNotification(
						"alert",
						"error_outline",
						"Invalid Email"
					);
					this.isLoading = false;
					return;
				}

				const isCustomerRegistered =
					await loginService.isCustomerRegistered(email);
				this.isLoading = false;

				if (isCustomerRegistered) {
					this.$emit("proceed-otp", email);
				} else {
					this.$emit("proceed-register", email);
				}
			} catch (error) {
				this.showNotification("alert", "error_outline", error);
				this.isLoading = false;
			}
		},
		toggleLoading(val) {
			this.$emit('toggle-loading', val == true);
			this.isLoading = val == true;
		},
		loginFacebook() {
			var self = this;
			self.toggleLoading(true);
			if (!self.FBPage) {
				self.FBPage = window.FB;
				self.$store.dispatch("setFBLogin", self.FBPage);
				self.FBPage.init({
					appId: self.facebookId,
					cookie: true,
					xfbml: true,
					version: "v18.0"
				});
			}
			self.FBPage.getLoginStatus(function (res) {
				if (res.status === "connected") {
					self.handleFacebookLogin(res.authResponse)
				} else {
					let permisions = [
						"email",
						"public_profile",
						"user_birthday",
						"user_gender",
					];

					self.FBPage.init({
						appId: self.facebookId,
						cookie: true,
						xfbml: true,
						version: "v18.0"
					});

					self.FBPage.login(function (res) {
						if (res.status === "connected") {
							return self.handleFacebookLogin(res.authResponse)
						}
						self.toggleLoading(false);
					}, {scope: permisions.join(",")})
				}
			});
		},
		async loginWithSocialMedia(data, authResponse) {
			let callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
			this.toggleLoading(true);
			let token = await generateLoginToken({
				email: data.email,
				token: authResponse.accessToken,
			});
			if (!token.success) {
				this.toggleLoading(false);
				let msg = `Access credentials are not valid! ${token.message}`
				if (callback) return callback({ success: false, message: msg });
				return this.showNotification("alert", "error_outline", msg);
			}
			let login = await loginWithOTP({
				email: data.email,
				otp: authResponse.accessToken,
			});
			if (!login.success) {
				this.toggleLoading(false);
				let msg = `Something went wrong! ${login.message}`
				if (callback) return callback({ success: false, message: msg });
				return this.showNotification("alert", "error_outline", msg);
			}
			this.$store.dispatch("setLoginToken", login.authToken);
			this.$store.dispatch("setCustomer", login.customer);

			window.dataLayer.push({
				event: "login",
				authentication_method: authResponse.method,
				method: authResponse.method,
				user_id: data.email,
			});

			if (callback) {
				this.toggleLoading(false);
				return callback({ success: true });
			}
			if (this.$route.query.reinit) this.$store.dispatch("setInited", false);
			if (this.$route.query.redirect) {
				return this.$router.replace(this.$route.query.redirect);
			}
			// eventStatusesHandler.updateStatuses();
			this.$router.replace({
				name: 'WelcomePage'
			});
		},
		async registerWithSocialMedia(data, authResponse) {
			let dob = data.birthday ? moment.tz(data.birthday, 'Asia/Singapore').format('YYYY-MM-DD') : null;
			let registrationParams = {
				email: data.email,
				firstName: data.first_name,
				lastName: data.last_name,
				passToken: authResponse.accessToken
			}
			if (dob) registrationParams.dateOfBirth = dob;
			if (data.gender) registrationParams.gender = data.gender.toUpperCase();
			this.toggleLoading(true);
			let response = await registerCustomer(registrationParams);
			this.toggleLoading(false);
			
			if (!response.success) {
				return this.showNotification(
					"alert",
					"error_outline",
					response.message
				);
			}
			this.$store.dispatch("setLoginToken", registrationParams.passToken);
			this.$store.dispatch("setCustomer", response.customer);
			if (this.$route.query.reinit) this.$store.dispatch("setInited", false);
			if (this.$route.query.redirect) {
				return this.$router.push(this.$route.query.redirect);
			}
			this.$router.replace({
				name: "GetStarted",
				params: {
					registered: true
				},
			});
		},
		async handleFacebookLogin(authResponse) {
			console.log('login FB', authResponse);
			var self = this;
			this.toggleLoading(true);
			await self.FBPage.api('me?fields=id,name,first_name,last_name,birthday,email,gender', async function (data) {
				if (data.error) {
					self.toggleLoading(false);
					return self.showNotification(
						"alert",
						"error_outline",
						`Something went wrong! ${data.error.message}`
					);
				}
				if (!data.email) {
					self.toggleLoading(false);
					return;
				}
				let authRes = { ...authResponse, ...{ method: "Facebook" } };
				const isCustomerRegistered = await loginService.isCustomerRegistered(data.email);
				if (isCustomerRegistered) {
					return self.loginWithSocialMedia(data, authRes);
				}
				self.registerWithSocialMedia(data, authRes);
			});
		},
		async loginGoogle() {
			let self = this;
			self.toggleLoading(true);
			googleSdkLoaded((google) => {
				const auth2 = google.accounts.oauth2.initTokenClient({
					client_id: self.googleWebAppId,
					scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
					prompt: 'consent',
					callback: (response) => {
						self.handleGoogleLogin(response);
					},
					error_callback: (error) => {
						self.toggleLoading(false);
						console.log(error);
						self.showNotification("alert", "error_outline", `Failed to login. ${error.message}`);
					}
				});
				auth2.requestAccessToken();
			});
		},
		async handleGoogleLogin(res) {
			if (res.error) {
				this.toggleLoading(false);
				return this.showNotification("alert", "error_outline", res.error);
			}
			const authResponse = { ...res, ...{ accessToken: res.access_token, method: "Google" } }
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${res.access_token}`);
			const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers
			});
			const data = await response.json();
			const isCustomerRegistered = await loginService.isCustomerRegistered(data.email);
			let names = data.name ? data.name.split(" ") : [];
			let firstName = names.length > 0 ? names[0] : data.given_name;
			let lastName = data.family_name;
			if (names.length > 1) {
				names.splice(0, 1);
				lastName = names.join(" ");
			}
			const params = {
				email: data.email,
				first_name: firstName,
				last_name: lastName,
				birthday: null,
				gender: null,
			}
			if (isCustomerRegistered) return this.loginWithSocialMedia(params, authResponse);
			this.registerWithSocialMedia(params, authResponse);
		}
	},
	async created() {
		if (this.$route.params.signup) this.useLogin = false;
		await this.refreshMainData(true);
		let hq = this.$store.getters.getHeadquarter;
		if (!hq) return;
		if (!hq.headquarter) return;
		// this.facebookId = "1016271646116573";
		this.facebookId = hq.headquarter.facebookId;
		// this.googleWebAppId = "910996503171-gs855l0f6q4hap6dd9pb0s99jcuttivp.apps.googleusercontent.com";
		this.googleWebAppId = hq.headquarter.googleWebAppId;
		if (this.facebookId) {
			let self = this;
			window.fbAsyncInit = function () {
				self.FBPage = window.FB;
				self.$store.dispatch("setFBLogin", self.FBPage);
				self.FBPage.init({
					appId: self.facebookId,
					cookie: true,
					xfbml: true,
					version: "v18.0"
				});
				/*
				self.FBPage.getLoginStatus(function (res) {
					console.log(res);
					if (res && res.authResponse) {
						self.handleFacebookLogin(res.authResponse);
					}
				});

				self.FBPage.AppEvents.logPageView();
				*/
			};

			(function (d, s, id) {
				let js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) {
					return;
				}
				js = d.createElement(s);
				js.id = id;
				js.src = "https://connect.facebook.net/en_US/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		}
	}
};
</script>

<style lang="scss" scoped>
	.page {
		&__login {
			width: 100%;
			display: flex;
			flex-direction: column;
			z-index: 2;
			gap: 10px;
			padding: 32px;
		}
		&__button {
			margin: auto 0 auto 0;
			margin-bottom: 12px;
			height: 40px;
			font-weight: bold;
		}
		&__banner {
			height: 200px;
			position: relative;
			overflow: hidden;

			// TODO: find better way to style this
			img {
				position: absolute;
				max-width: 420px;
				height: 100%;
				width: 112%;
				min-height: 400px;
				min-width: 100%;
				top: -240px;
				left: -20px;
				transform: scale(1.2);
			}
		}
		&__content {
			padding: 0;
			text-align: left;

			&__logo {
				width: 80px;
				height: 80px;
				margin: 0 auto;
				margin-bottom: 16px;
			}
			&__title {
				margin-top: 24px;
				color: $secondary-color-100;
				text-align: center;
				font-family: 'Berthold Akzidenz Grotesk Medium';
			}
			&__subtitle {
				margin-top: 8px;
				color: $secondary-color-70;
				text-align: center;
				font-size: 0.9em;
			}
			&__subheading {
				color: $secondary-color-40;
				margin-top: 16px;
			}
			&__answer {
				margin-top: 24px;
			}
			&__label {
				margin-top: 24px;
				font-weight: bold;
			}
			&__input {
				border: none;
				height: 52px;
				width: 100%;
				background: $primary-color-10;
				border-radius: 12px;
				padding: 16px;
				margin-top: 8px;
				outline: none;
				&:active, &:focus {
					border: 1px solid $primary-color-30;
				}
			}
		}
		&__info {
			width: 100%;
			display: flex;
			gap: 16px;
			align-items: center;
			color: $secondary-color-70;
			justify-content: center;

			&__signup {
				color: $primary-color-60;
				font-weight: bold;
				cursor: pointer;
			}
		}
		&__or {
			position: relative;
			display: flex;
			align-items: center;
			width: 100%;
			gap: 12px;
			color: $secondary-color-70;
			font-size: 0.8em;

			&::before, &::after {
				content: "";
				flex: 1;
				height: 1px;
				background: $secondary-color-20;
			}
		}
		&__icons {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12px;

			&__icon {
				border-radius: 50%;
				border: 1px solid $secondary-color-20;
				padding: 6px;
				cursor: pointer;
				width: 40px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				.custom-facebook {
					background: #4267B2;
					width: 27px;
					height: 27px;
					max-height: 27px;
					max-width: 27px;
					border-radius: 50%;
					position: relative;
					overflow: hidden;
					display: flex;
					align-items: center;
					justify-content: center;

					&::after {
						content: "f";
						position: absolute;
						color: #fff;
						font-size: 2.2em;
						font-family: Arial, Helvetica, sans-serif;
						font-weight: bold;
						left: 0;
						right: 0;
						top: 8px;
						margin: auto;
						font-style: normal;

					}
				}
				
				.custom-google {
					position: relative;
					border-top: 5px solid #ea4335;
					border-right: 5px solid #4285f4;
					border-left: 5px solid #fbbc05;
					border-bottom: 5px solid #34a853;
					border-radius: 50%;
					width: 27px;
					height: 27px;
					&::before {
						content: "";
						position: absolute;
						top: 50%;
						right: -5px;
						transform: translateY(-50%);
						height: 5px;
						width: 14px;
						background-color: #4285f4;
					}
					&::after {
						content: "";
						position: absolute;
						border-top: 14px solid transparent;
						border-right: 10px solid #fff;
						top: -8px;
						right: -5px;
						height: 0;
						width: 0;
					}
				}

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}
	@keyframes processingAnim {
		0% { 
			width: 0;
			background: linear-gradient(90deg, $main-red 0%, $secondary-color-20);
		}
		100% { 
			width: 100%;
			background: linear-gradient(90deg, $main-red 100%, $secondary-color-20);
		}
	}
	@-webkit-keyframes processingAnim {
		0% {
			width: 0;
			background: linear-gradient(90deg, $main-red 0%, $secondary-color-20);
		}
		100% { 
			width: 100%;
			background: linear-gradient(90deg, $main-red 100%, $secondary-color-20);
		}
	}
	.loading-content {
		width: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		&:is(.processing) {
			width: 100%;
			max-width: 150px;
			margin: 0 auto;
			margin-top: 32px;
			height: 10px;
			border-radius: 16px;
			display: flex;
			justify-content: center;
			align-items: center;
			background: $secondary-color-20;
			&::before {
				position: absolute;
				content: "";
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 16px;
				color: $white;
				margin: 0 auto;
				height: 10px;
				bottom: 0;
				left: 0;
				transition: all 1s;
				-webkit-transition: all 1s;
				animation: processingAnim 1s ease-in-out infinite;
				-webkit-animation: processingAnim 1s ease-in-out infinite;
				z-index: 1;
			}
			&::after {
				display: flex;
				align-items: center;
				justify-content: center;
				position: absolute;
				left: 0;
				right: 0;
				top: 30px;
				bottom: 0;
				margin: auto;
				content: "Loading";
				z-index: 2;
				background: linear-gradient(90deg, $secondary-color-20, transparent);
				font-size: small;
				font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
				color: $secondary-color-60;
			}
		}
	}
	@media (min-width: 672px) {
		.page {
			&__login {
				display: flex;
				flex-direction: column;
			}
			&__button {
				margin: auto 24px 24px 24px;
				margin-top: auto;
				height: 40px;
			}
			&__content {
				padding: 0px 0px;
				width: 100%;
				max-width: 672px;
				margin: 0 auto;
				text-align: left;
			}
			&__button {
				width: 100%;
				max-width: 672px;
				margin: 0 auto;
			}
			&__info {
				padding: 12px 0px;
				gap: 12px;
			}
		}
	}
</style>
