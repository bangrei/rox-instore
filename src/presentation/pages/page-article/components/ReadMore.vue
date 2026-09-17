<template>
	<div class="container">
		<p class="heading-4">Earn points by signing in</p>
		<input class="input" placeholder="Type your email" v-model="email" />
		<base-button
			class="cta sd-btn-primary sd-btn-lg"
			btnLabel="Sign in"
			:isLoading="isLoading"
			:isDisabled="isLoading || !email"
			@click="doSignIn"
		></base-button>
		<div class="link">
			<a href="#" @click.prevent="doRegister">Register a new account</a>
		</div>
	</div>
</template>

<script>
import { loginService } from "@/bloc/services";
import utility from "@/presentation/mixins/utility";

export default {
	mixins: [utility],
	data() {
		return {
			email: "",
			isLoading: false,
		};
	},
	methods: {
		async doSignIn() {
			this.isLoading = true;
			this.refreshMainData();

			if (!this.isValidEmail(this.email)) {
				this.showNotification(
					"alert",
					"error_outline",
					"Invalid Email"
				);
				this.isLoading = false;
				return;
			}

			const isCustomerRegistered =
				await loginService.isCustomerRegistered(this.email);
			this.isLoading = false;

			if (isCustomerRegistered) {
				this.$router.push({
					name: "LoginPage",
					params: {
						passedEmail: this.email,
					},
					query: {
						redirect: this.$route.fullPath,
					},
				});
			} else {
				this.goToWithParams("RegisterPage", {
					passedEmail: this.email,
				});
			}
		},
		doRegister() {
			this.goTo("RegisterPage");
		},
	},
};
</script>

<style lang="scss" scoped>
.container {
	height: 320px;
	background-color: $primary-color-10;
	padding: 24px;
}
.tab__containter {
	display: flex;
	column-gap: 32px;
	justify-content: center;
	align-items: center;
	margin-top: 30px;
	background-color: $white;
	border-radius: 12px;
	height: 32px;

	.tab {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.active {
		color: $primary-color-60;
		border-bottom: 2px solid $primary-color-60;
	}
}

.input {
	margin-top: 12px;
	height: 52px;
	border: 0px solid;
	padding: 16px;
	border-radius: 12px;
	width: 100%;
}

.input:focus {
	outline: none;
}

.cta {
	width: 100%;
	margin-top: 32px;
}
a {
	color: inherit;
	text-decoration: none;
}
.link {
	color: $primary-color-100;
	margin-top: 16px;
	&:visited {
		color: $primary-color-100;
	}

	&:hover {
		color: $primary-color-100;
	}

	&:active {
		color: $primary-color-100;
	}
}
</style>
