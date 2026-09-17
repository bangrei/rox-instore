<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
            <base-modal :show="askUnsubscribe">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="material-icons-outlined" @click="toggleUnsubscribe()">close</span>
                        <h3>Confirmation</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <p>
                            Your account will no longer be receiving the email notifications.
                            Go to account settings if you want to re-enable the email notifications.
                        </p>
                        <p>Would you like to continue?</p>
                    </div>
                    <div class="modal-footer">
                        <div class="actions">
                            <div class="action-button light" @click="toggleUnsubscribe()">Cancel</div>
                            <div class="action-button" @click="unsubscribe()">Yes, Unsubscribe</div>
                        </div>
                    </div>
                </template>
            </base-modal>
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

export default {
	name: "UnsubscribePage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			loading: false,
            processing: false,
            askUnsubscribe: false,
            token: ""
		};
	},
	watch: {},
	computed: {},
    methods: {
        toggleUnsubscribe(){
            if(this.askUnsubscribe) return this.leaveNow();
            this.askUnsubscribe = true;
        },
        leaveNow(){
            this.loading = false;
            let page = "Settings";
            if(!this.isLoggedIn()) page = "WelcomePage";
            this.$router.replace({ name: page });
        },
        async unsubscribe() {
            try {
                let params = {
                    marketingEmails: false,
                    token: this.token
                };
                this.processing = true;
                let json = await homeService.updateCustomerDetails(params);
                if(!json.success) this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
                else this.showNotification("success", "done", "Successfully unsubscribed.");
            } catch(error){
                this.showNotification("alert", "error_outline", "Something went wrong! " + error.message);
            } finally {
                this.leaveNow();
            }
        }
	},
	async created() {
		try {
			this.loading = true;
            this.token = this.$route.params.token;
            if(this.isLoggedIn()){
                if(this.token != this.$store.getters.getToken){
                    this.showNotification("alert", "error_outline", "Unsubscribe is prohibited!");
                    return this.leaveNow();
                }
            } else {
                let res = await homeService.getCustomerDetails(this.token);
                if(!res) {
                    this.showNotification("alert", "error_outline", "Invalid account!");
                    return this.leaveNow();
                }
            }
            this.toggleUnsubscribe();
            this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
            this.leaveNow();
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