<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
                    <div class="back-btn" @click="goTo('WelcomePage')">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<h1 class="heading-5 center">Deleted Account</h1>
					<div class="right"></div>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <div class="err" v-if="errorMessage">{{ errorMessage }}</div>
            <div class="profile-con" v-if="!isEmpty(customer)">
                <div class="profile-account">
                    <div class="profile-name">Account Details</div>
                    <div class="profile-email">{{ customerFullname }}</div>
                    <div class="profile-email">{{ customer.email }}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-label">This account was registered on:</div>
                    <div class="profile-text">{{ customer.registeredDate }}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-label">This account was deleted on:</div>
                    <div class="profile-text">{{ customer.deletedDate }}</div>
                </div>
                <div class="profile-item" style="margin-top: 48px;">
                    <div class="profile-label">This page will expire in {{ days }}</div>
                </div>
            </div>
		</template>
		<template v-slot:footer>
			<base-footer-nav :active-footer-id="activeFooterNavId"></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import { homeService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "DeletedAccount",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: false,
			errorMessage: "",
		};
	},
	watch: {},
	computed: {
        customerFullname() {
            if(isEmpty(this.customer)) return;
            let names = [];
            if(this.customer.firstName) names.push(this.customer.firstName);
            if(this.customer.lastName) names.push(this.customer.lastName);
            return names.join(' ');
        },
        days() {
            if (isEmpty(this.customer)) return "";
            let dt = parseInt(moment.tz(this.customer.deletedDate, 'Asia/Singapore').format('YYYYMMDD')) + 3;
            let now = parseInt(moment.tz(moment(), 'Asia/Singapore').format('YYYYMMDD'));
            let days = dt - now;
            if (days < 1) return `${days} day`;
            return `${days} days`;
        }
    },
	methods: {
		async setCustomerDetails() {
            let code = this.$route.params.code;
            let res = await homeService.checkDeleteCustomerAccount(code);
            if (!res.success) {
                this.errorMessage = 'Sorry, we are unable to provide your request! ' + res.message;
                return;
            }
            this.customer = res.customer;
		},
	},
	async created() {
		try {
			this.loading = true;
			await this.refreshMainData(true);
			await this.setCustomerDetails();
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
.err {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    height: 100%;
    padding: 24px;
    color: $secondary-color-50;
    font-size: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center;
}
.header-con {
	padding: 16px;
	color: $white;
	width: 100%;
	display: flex;
	align-items: center;
	max-height: 56px;
    gap: 24px;

    .back-btn {
        cursor: pointer;
    }

	.header-logo-con {
		width: 32px;
		height: 32px;

		.header-logo {
			object-fit: contain;
		}
	}
	.left,
	.right {
		flex: 1;
	}
}

.profile-con {
    width: 100%;
    display: block;
    padding: 12px 10%;

    .profile-account {
        padding: 16px;
        text-align: left;
        width: 100%;

        & + .profile-item {
            margin-top: 32px;
        }

        .profile-name {
            font-weight: bold;
            color: $secondary-color-90;
            font-size: 1.2em;

            & + .profile-email {
                margin-top: 4px;
            }
        }
        .profile-email {
            color: $secondary-color-70;
        }
    }

    .profile-item {
        text-align: left;
        width: 100%;

        & + .profile-item {
            margin-top: 12px;
        }

        .profile-label {
            font-weight: bold;
            color: $secondary-color-50;
            font-size: 1em;
            padding: 0 16px;

            & + .profile-text,
            & + .profile-data {
                margin-top: 4px;
            }
        }
        .profile-text {
            color: $secondary-color-100;
            font-weight: bold;
            padding: 0 16px;
        }
    }
}

@media (min-width: 672px) {
    .profile-con {
        padding: 24px calc(7% - 16px) !important;
    }
}
</style>
