<template>
	<layout-variant-two :show-loading-screen="loading" :hideFootNote="true" :hideHeader="true">
		<template v-slot:body>
            <div class="slide-down">
				<div class="header-con light">
					<div class="back-btn" @click="hideSideBar()">
                        <span class="material-icons">close</span>
                        <h1 class="heading-5 center">Main Menu</h1>
                    </div>
				</div>
			</div>
            <div class="profile-con" v-if="!isEmpty(customer)">
                <div class="profile-account">
                    <div class="profile-name">{{ customerFullname }}</div>
                    <div class="profile-email">{{ customer.email }}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-label">Events Joined</div>
                    <div class="profile-text">{{ customer.eventsJoined }}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-label">Current Interests</div>
                    <div class="profile-data">
                        <div class="interests">
                            <div class="interest-item" v-for="(interest, i) in customerInterests" :key="i">
                                <span class="material-icons interest-icon">hiking</span>
                                <span>{{ interest }}</span>
                            </div>
                            <div class="interest-empty" v-if="isEmpty(customerInterests)">No interest selected.</div>
                        </div>
                    </div>
                </div>
                <div class="profile-menu">
                    <div class="profile-menu-header">Account</div>
                    <div class="profile-menu-list">
                        <div class="menu-list-item" @click="clickMenu('MyOrderPage')">
                            <div class="item-main">
                                <span class="material-icons-outlined menu-icon">shopping_bag</span>
                                <span>My Orders</span>
                            </div>
                            <span class="material-icons">chevron_right</span>
                        </div>
                        <div class="menu-list-item" @click="clickMenu('Settings')">
                            <div class="item-main">
                                <span class="material-icons-outlined menu-icon">settings</span>
                                <span>Settings</span>
                            </div>
                            <span class="material-icons">chevron_right</span>
                        </div>
                        <div class="menu-list-item" @click="clickMenu('PointsPage')">
                            <div class="item-main">
                                <span class="material-icons-outlined menu-icon">qr_code</span>
                                <span>Rewards with QR</span>
                            </div>
                            <span class="material-icons">chevron_right</span>
                        </div>
                        <div class="menu-list-item" @click="clickMenu('Interests')">
                            <div class="item-main">
                                <span class="material-icons-outlined menu-icon">mood</span>
                                <span>User Interests</span>
                            </div>
                            <span class="material-icons">chevron_right</span>
                        </div>
                        <div class="menu-list-item item-custom" @click="logout">
                            <div class="item-main">
                                <span class="material-icons-outlined menu-icon">logout</span>
                                <span>Log out</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
	name: "BaseMenu",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: false,
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
        customerInterests() {
            if(isEmpty(this.customer)) return [];
            if(isEmpty(this.customer.interests)) return [];
            return this.customer.interests.split(',');
        }
    },
    methods: {
        clickMenu(page) {
            this.hideSideBar();
            this.goTo(page);
        },
        hideSideBar(){
            this.$emit('hide-menu');
        },
		setCustomerDetail() {
			this.customer = this.$store.getters.getCustomer;
		},
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
    .back-btn {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    }

    .profile-con {
        width: 100%;
        display: block;
        padding: 12px 0px;

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
            .interests {
                width: 100%;
                overflow: hidden;
                overflow-x: auto;
                display: flex;
                align-items: center;
                padding: 0 16px;
                gap: 12px;
                flex-wrap: wrap;

                .interest-empty {
                    font-size: 0.95em;
                }

                .interest-item {
                    width: fit-content;
                    border-radius: 12px;
                    padding: 4px 8px;
                    border: 1px solid $secondary-color-40;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    cursor: pointer;

                    .interest-icon {
                        font-size: 16px;

                        & + * {
                            margin-left: 4px;
                        }
                    }
                }
            }
        }

        .profile-menu {
            width: 100%;
            padding: 16px;
            text-align: left;
            margin-top: 32px;

            .profile-menu-header {
                font-size: 1.2em;
                font-weight: bold;

                & + .profile-menu-list {
                    margin-top: 24px;
                }
            }
            .profile-menu-list {
                width: 100%;
                display: block;

                .menu-list-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    text-align: left;
                    position: relative;
                    padding-bottom: 18px;

                    &.item-custom {
                        color: $primary-color-60;
                    }

                    & + .menu-list-item {
                        padding-top: 18px;
                        border-top: 1px solid $secondary-color-10;
                    }

                    .item-main {
                        display: flex;
                        align-items: center;
                        flex: 3;
                        cursor: pointer;

                        & + .material-icons {
                            color: $primary-color-60;
                            cursor: pointer;
                        }
                    }

                    * + * {
                        padding-left: 12px;
                    }
                }
            }
        }
    }

    .home__floating-btn__con {
        position: fixed;
        bottom: 77px;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;

        @media (min-width: 480px) {
            max-width: 480px;
        }

        .support-con {
            border-radius: 50%;
            background-color: $white;
            transition: all 0.2s ease-in-out;
            opacity: 0.6;

            &:hover {
                transform: scale(1.1);
                opacity: 1;
            }
        }
    }
    @media (min-width: 672px) {
        .header-con {
            max-width: 600px !important;
            float: right;
            padding: 24px 36px !important;
        }
        .profile-con {
            max-width: 600px !important;
            float: right;
            padding: 24px;
            background: $white;
            height: 100%;
            overflow: hidden;
            overflow-y: auto;
        }
    }
</style>
