<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
			<div class="saved-cards-page" v-if="!isEmpty(customer) && !loading">
				<div class="page-nav">
					<span class="material-icons" @click="goBack()">arrow_back</span>
					<span>Saved Cards</span>
				</div>
				<div class="cards-container">
					<button type="button" class="btn-add" @click="isOpenModal = true">
						Add New Credit/Debit Card&nbsp;
						<span class="material-icons-outlined">account_balance_wallet</span>
					</button>
					<div class="card-item" v-for="card in savedCards" :key="card.id">
						<div class="card-type">
							<img v-if="['VISA'].includes(card.cardType)" :src="require('@/assets/images/visa-logo.png')" width="32" height="12" alt=""/>
							<img v-else-if="['MASTER_CARD','MASTERCARD'].includes(card.cardType)" :src="require('@/assets/images/mastercard-logo.svg')" width="32" height="24" alt=""/>
							<span v-else class="material-icons-outlined">credit_card</span>
							{{ ['MASTER_CARD','MASTERCARD','VISA'].includes(card.cardType) ? card.bankName : (card.cardType || 'Unknown') }}
						</div>
						<router-link :to="'/saved-cards/' + card.id" class="card-number">
							<span>**** **** **** {{ card.maskedAccountNumber }}</span>
							<span class="material-icons">chevron_right</span>
						</router-link>
					</div>
				</div>
			</div>
			<base-modal :show="isOpenModal">
				<template v-slot:header>
					<div class="modal-header header-flex justify-between">
						<h3>
							<img v-lazy="require('@/assets/images/maya-logo.svg')" alt="Paymaya Vault"/>
							<span>Add New Credit/Debit Card</span>
						</h3>
						<span class="material-icons-outlined btn-close" @click="isOpenModal = false">close</span>
					</div>
				</template>
				<template v-slot:body>
						<div class="modal-body">
								<div v-if="isSavingCard">
										<span class="material-icons-outlined spinning">refresh</span>
								</div>
								<div id="iframe-paymaya" v-else></div>
						</div>
				</template>
		</base-modal>
		</template>
		<template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="activeFooterNavId"></base-footer-nav> -->
      <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import { getEunoiaCustomerDetails } from "@/connector/v4/customerConnector";
import { mayaVaultSaveCard } from "@/connector/v4/productConnector";
import paymayaSdkClient from "paymaya-js-sdk";

export default {
	name: "SavedCardsPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: true,
			activeFooterNavId: 4,
      savedCards: [],
			isOpenModal: false,
			isSavingCard: false
		};
	},
	watch: {
		isOpenModal(val){
			if(!val) return;
			setTimeout(() => {
				this.addCard();
			}, 200)
		}
	},
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
		},
		membershipDateInfo() {
			if (isEmpty(this.customer)) return "";
			let date = moment(this.customer.registeredDate).format("MMM DD, YYYY");
			return `Membership active since ${date}`;
		},
		mayaVaultAccount(){
			let paymentAccounts = this.$store.getters.getPaymentAccounts;
			return paymentAccounts?.find((it) => it.type == "MAYA_VAULT");
		},
		isMayaVaultEnabled(){
			if(this.mayaVaultAccount){
				return true;
			}
			return false;
		}
	},
	methods: {
		addCard(){
			let self = this;
      const iframeContainer = document.getElementById("iframe-paymaya");
			paymayaSdkClient.createCreditCardForm(iframeContainer, {
				buttonText: "Save Card",
				showLogo: false,
			}).addTransactionHandler((paymentTokenId) => {
				self.saveCard(paymentTokenId);
			})
		},
		async saveCard(paymentTokenId){
			try {
				this.isSavingCard = true;
				let redirectFE = `${window.location.origin}/save-card`;
				let successUrl = `${redirectFE}/success`;
				let failUrl = `${redirectFE}/failed`;
				let payload = {
					accountKey: this.mayaVaultAccount.key,
					paymentTokenId,
					successUrl,
					failUrl,
				}
				const res = await mayaVaultSaveCard(payload);
				console.log(res);
				if(!res?.success){
					this.showNotification("alert", "error_outline", `Something went wrong! ${res.message || ''}`);
					return
				}
				if(res?.verificationUrl){
					return window.location.href = res.verificationUrl;
				}
				this.showNotification("success", "done", `Your card is successfully saved!`);
				this.savedCards = [res.cardToken, ...this.savedCards];
			} catch(error){
				this.showNotification("alert", "error_outline", `Something went wrong! ${error.message || ''}`);
			} finally {
				this.isSavingCard = false;
				this.isOpenModal = false;
			}
		},
		async setCustomerDetail() {
			this.customer = this.$store.getters.getCustomer;
			let paymentAccounts = this.$store.getters.getPaymentAccounts;
			const res = await getEunoiaCustomerDetails();
			let tokenizedCards = res?.customer?.creditCardTokens || [];
			if(!isEmpty(tokenizedCards)) {
				tokenizedCards = tokenizedCards.filter((card) => {
					return paymentAccounts.map((pm) => pm.key).includes(card.accountKey)
				});
			}
			this.savedCards = tokenizedCards;
			this.loading = false;
		},
	},
	async created() {
		try {
			this.loading = true;
			if (!this.$store.getters.hasInited) {
				await this.refreshMainData()
			} else {
				await this.refreshCustomerData();
			}
			if(this.mayaVaultAccount){
				let isSandbox = process.env.NODE_ENV != "production";
				paymayaSdkClient.init(this.mayaVaultAccount.publicKey, isSandbox);
			}
			this.setCustomerDetail();
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
.btn-close {
	cursor: pointer;
}
.page-nav {
	display: flex;
	align-items: center;
	gap: 10px;
	padding-block: 24px;
	font-size: 1.5em;
	font-weight: normal;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	border-bottom: 1px solid $secondary-color-20;
	width: 100%;
	cursor: pointer;
	&:hover{
		opacity: 0.7;
	}
}
.saved-cards-page {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: baseline;
	justify-content: baseline;
	max-width: 850px;
	margin-inline: auto;
	padding-inline: 20px;
}
.cards-container {
	padding-block: 24px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 100%;
}
.card-item {
	width: 100%;
	padding: 24px;
	border-radius: 20px;
	border: 1px solid $secondary-color-20;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	background: $white;
	.card-type {
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.card-number {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		text-decoration: none;
		color: $secondary-color-80;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		&:hover{
			opacity: 0.7;
		}
	}
}
.btn-add {
	border-radius: 999px;
	border: 1px solid $secondary-color-50;
	padding: 8px 24px;
	display: flex;
	align-items: center;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	cursor: pointer;
	width: fit-content;
	margin-inline: auto;
	&:hover {
		opacity: 0.7;
	}
}
@media (min-width: 672px) {
	.saved-cards-page {
		padding-inline: 7% !important;
	}
}
</style>
