<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
            <div class="form-con">
                <div class="form-group">
                    <div class="label">First Name</div>
                    <div class="input">
                        <input type="text" v-model="firstName">
                    </div>
                </div>
                <div class="form-group">
                    <div class="label">Last Name</div>
                    <div class="input">
                        <input type="text" v-model="lastName">
                    </div>
                </div>
                <div class="form-group">
                    <div class="label">Date of Birth (DD-MM-YYYY)</div>
                    <div class="input">
                        <input type="date" v-model="dateOfBirth" placeholder="DD-MM-YYYY">
                    </div>
                </div>
                <div class="form-group">
                    <div class="label">Gender</div>
                    <div class="radio-list left-radio">
                        <div class="radio" v-for="radio in genders" :key="radio.name" @click="gender = radio.value">
                            <input name="gender" type="radio" :checked="radio.value == gender">
                            <span class="radio-label">{{ radio.name }}</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="label">Email Address</div>
                    <div class="input">
                        <input type="text" v-model="email" readonly>
                    </div>
                </div>
                <div class="form-group">
                    <div class="label">Phone Number</div>
                    <div class="input">
                        <input type="text" v-model="phone">
                    </div>
                </div>
                <div class="form-group">
                    <div class="checkbox">
                        <input type="checkbox" v-model="marketingEmails">
                        <span class="checkbox-label">Subscribe to R.O.X Community Newsletters & notifications</span>
                    </div>
                </div>
                <div class="button" @click="save()">Save</div>
                <div class="button outlined" @click="toggleDeleteAccount()">Delete Account</div>

                <base-modal :show="askDeleteAccount">
                    <template v-slot:header>
                        <div class="modal-header header-flex">
                            <span class="material-icons-outlined" @click="toggleDeleteAccount()">close</span>
                            <h3>Confirmation</h3>
                        </div>
                    </template>
                    <template v-slot:body>
                        <div class="modal-body">
                            <p>Account deletion is irreversible and your account will no longer be accessible.</p>
                            <p>Would you like to continue?</p>
                        </div>
                        <div class="modal-footer">
                            <div class="actions">
                                <div class="action-button light" @click="toggleDeleteAccount()">Cancel</div>
                                <div class="action-button" @click="deleteMyAccount()">Delete Account </div>
                            </div>
                        </div>
                    </template>
                </base-modal>
            </div>
		</template>
        <template v-slot:footer>
            <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import { homeService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
	name: "SettingPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: false,
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            gender: "",
            marketingEmails: false,
            askDeleteAccount: false,
            deleting: false,
            genders: [
                { name: "Male", value: "MALE" },
                { name: "Female", value: "FEMALE" },
            ]
		};
	},
	watch: {},
	computed: {},
    methods: {
        toggleDeleteAccount() {
            this.askDeleteAccount = !this.askDeleteAccount;
        },
        async deleteMyAccount() {
            try {
                if (this.deleting == true) return;
                this.deleting = true;
                let res = await homeService.deleteCustomerAccount();

                this.toggleDeleteAccount();
                this.deleting = false;
                if (!res.success) {
                    let message = "Something went wrong! " + res.message;
                    return this.showNotification("alert", "error_outline", message);
                }
                this.$store.dispatch("clearLoginToken");
                this.$store.dispatch("clearCustomer");
                this.$router.replace({ name: "LoginPage" });
            } catch (error) {
                this.deleting = false;
                this.showNotification("alert", "error_outline", error);
            }
        },
		setCustomerDetail() {
			this.customer = this.$store.getters.getCustomer;
            if(isEmpty(this.customer)) return;
            this.firstName = this.customer.firstName;
            this.lastName = this.customer.lastName;
            this.email = this.customer.email;
            this.phone = this.customer.phone;
            this.dateOfBirth = this.customer.dateOfBirth;
            this.marketingEmails = this.customer.marketingEmails == true;
            this.gender = this.customer.gender;
		},
        async save() {
            if (this.deleting == true) return;
            let errors = [];
            if(isEmpty(this.firstName)) errors.push("First name is required.");
            if(isEmpty(this.email)) errors.push("Email address is required.");
            // if(!this.isValidEmail(this.email)) errors.push("Email address is not valid.");
            if(!isEmpty(errors)) return this.showNotification("alert", "error_outline", errors[0]);
            let params = {};
            if(this.firstName != this.customer.firstName) params.firstName = this.firstName;
            if(this.lastName != this.customer.lastName) params.lastName = this.lastName;
            if (this.dateOfBirth != this.customer.dateOfBirth) params.dateOfBirth = `${this.dateOfBirth} 00:00:00`;
            if(this.gender != this.customer.gender) params.gender = this.gender;
            if(this.phone != this.customer.phone) {
                if(!this.isValidPhoneNumber(this.phone)) return this.showNotification("alert", "error_outline", "Please enter a correct phone number");
                if(!this.isValidPhone(this.phone)) return this.showNotification("alert", "error_outline", "Please input a valid mobile number");
                params.phone = this.phone;
            }
            if(this.marketingEmails != this.customer.marketingEmails) params.marketingEmails = this.marketingEmails;
            console.log(params);
            if (isEmpty(params)) return this.$router.back();
            let json = await homeService.updateCustomerDetails(params);
            if(!json.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
            this.$router.back();
        },
        isValidPhoneNumber(num){
            let regex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
			return regex.test(num);
        }
	},
	async created() {
		try {
			this.loading = true;
			await this.refreshCustomerData();
			this.setCustomerDetail();
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
    .header-con {
        padding: 16px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 56px;
        border-bottom: 1px solid $secondary-color-20;
        margin-bottom: 24px;
        gap: 24px;

        .back-btn {
            color: $white;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
        }
    }
    .form-con {
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 24px;
        width: 100%;
        text-align: left;
        padding: 16px;

        .form-group {
            width: 100%;

            & + .form-group {
                margin-top: 16px;
            }

            .label {
                font-weight: bold;
                & + .input {
                    margin-top: 12px;
                }
            }
            .input {
                width: 100%;

                input {
                    width: 100%;
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid $secondary-color-20;
                    outline: none;
                    color: $secondary-color-60;

                    &:is([readonly]) {
                        background: $secondary-color-10;
                        cursor: not-allowed;
                    }

                    &:not([readonly]):focus {
                        border-color: $secondary-color-40;
                        color: $secondary-color-90;
                    }
                }
            }

            & + .button {
                margin-top: 24px;
            }
        }
        .button {
            width: 100%;
            border-radius: 12px;
            background: $primary-color-60;
            border: 1px solid $primary-color-60;
            padding: 16px;
            color: $white;
            font-weight: bold;
            text-align: center;
            margin-bottom: 24px;
            cursor: pointer;
            &:hover {
                opacity: 0.7;
            }
            &.outlined {
                border-color: $primary-color-60 !important;
                background: transparent !important;
                color: $primary-color-60;
            }
        }
    }
    @media (min-width: 672px) {
		.header-con {
			padding: 16px 96px;
		}
        .form-con {
			padding: 16px 96px;
		}
        .back-btn {
            cursor: pointer;
        }
        .button {
            cursor: pointer;
        }
	}
</style>