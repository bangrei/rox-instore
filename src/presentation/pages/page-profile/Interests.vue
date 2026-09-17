<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="goBack">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<h1 class="heading-5 center">User Interests</h1>
					<div class="right"></div>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <div class="container">
                <div class="interests-wrapper">
                    <div class="interest-title">Choose <span>three of more</span> categories that represent what you want to see.</div>
                    <div class="interests-content">
                        <div class="interest-item" 
                            v-for="(interest, i) in interests" 
                            :key="i"
                            :class="{'selected-item': isSelected(interest)}"
                            @click="select(interest)">
                            <span v-if="isSelected(interest)" class="material-icons interest-icon">check</span>
                            <span>{{ interest }}</span>
                        </div>
                    </div>
                </div>
                <div class="button-group">
                    <div class="button light" @click="goBack()">Cancel</div>
                    <div class="button" @click="save()">Save</div>
                </div>
            </div>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import { homeService } from "@/bloc/services";

export default {
	name: "InterestsPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: false,
            interests: [],
            selectedInterests: []
		};
	},
	watch: {},
	computed: {},
	methods: {
		setCustomerDetail() {
            this.interests = ["Hiking","Cycling","Running","Camping","Water Sports","Climbing"];
			this.customer = this.$store.getters.getCustomer;
            if(isEmpty(this.customer)) return;
            if(isEmpty(this.customer.interests)) return;
            this.selectedInterests = this.customer.interests.split(",").map((it) => {
                return it.trim();
            });
		},
        isSelected(interest){
            if(!interest) return false;
            return this.selectedInterests.indexOf(interest) != -1;
        },
        select(interest){
            if(!interest) return;
            let exists = this.selectedInterests.indexOf(interest);
            if(exists != -1){
                this.selectedInterests.splice(exists, 1);
                return;
            }
            this.selectedInterests.push(interest);
        },
        async save(){
            let params = {
                interests: this.selectedInterests.join(",")
            };
            let json = await homeService.updateCustomerDetails(params);
            if(!json.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
            this.$router.back();
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
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
        }
    }
    .container {
        width: 100%;
        height: 100%;
        text-align: left;
        display: block;

        .interests-wrapper {
            height: calc(100% - 100px);
            overflow: hidden;
            overflow-y: auto;
            width: 100%;

            .interest-title {
                font-weight: bold;
                display: block;
                padding: 16px;
                color: $secondary-color-60;

                span {
                    color: $primary-color-60;
                }
            }

            .interests-content {
                width: 100%;
                display: flex;
                padding: 0 8px;
                flex-direction: row;
                flex-wrap: wrap;

                .interest-item {
                    gap: 10;
                    width: fit-content;
                    border-radius: 12px;
                    padding: 4px 8px;
                    border: 1px solid $secondary-color-40;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    text-align: left;
                    margin: 8px;

                    &.selected-item {
                        background: $primary-color-20;
                        border-color: transparent;
                        color: $primary-color-60;
                    }

                    .interest-icon {
                        font-size: 16px;
                        color: $primary-color-60;

                        & + * {
                            margin-left: 4px;
                            white-space: nowrap;
                        }
                    }
                }
            }
        }

        .button-group {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 32px 16px;

            .button {
                flex: 1;
                border-radius: 12px;
                background: $primary-color-60;
                padding: 8px;
                color: $white;
                font-weight: bold;
                text-align: center;
                cursor: pointer;

                &.light {
                    border: 1px solid $primary-color-60;
                    background: transparent;
                    color: $primary-color-60;
                }

                & + * {
                    margin-left: 16px;
                }
            }
        }
    }

    @media (min-width: 672px) {
		.header-con {
            padding: 16px 96px;
        }
        .container {
            padding: 16px 96px;

            .button-group {
                .button {
                    cursor: pointer;
                }
            }
        }
	}
</style>