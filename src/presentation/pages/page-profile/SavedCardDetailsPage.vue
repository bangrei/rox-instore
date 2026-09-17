<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
			<div class="saved-cards-page" v-if="!isEmpty(customer) && !loading">
				<div class="page-nav">
					<span class="material-icons" @click="goBack()">arrow_back</span>
					<span>Credit/Debit Card</span>
				</div>
				<div class="cards-container">
					<div class="card-item" v-if="card">
						<div class="card-type">
							<img v-if="['VISA'].includes(card.cardType)" :src="require('@/assets/images/visa-logo.png')" width="32" height="12" alt=""/>
							<img v-else-if="['MASTER_CARD','MASTERCARD'].includes(card.cardType)" :src="require('@/assets/images/mastercard-logo.svg')" width="32" height="24" alt=""/>
							<span v-else class="material-icons-outlined">credit_card</span>
						</div>
						<span class="card-number">{{ card.bankName || card.bankCardType || 'Unknown' }}</span>
						<span class="card-number">**** **** **** {{ card.maskedAccountNumber }}</span>
						<span :class="['card-status', {'not-active': !isActiveCard}]">{{ isActiveCard ? 'Active' : 'Not Active' }}</span>
					</div>
					<div class="card-item empty" v-else>
						<i class="material-icons-outlined">search_off</i>
						<span class="card-number">Card not found</span>
					</div>
					<div class="card-info" v-if="card">
						<span class="card-info-title">Card Type</span>
						<span class="card-info-type">{{ (card.cardType || 'Unknown').replace('_', ' ') }}</span>
						<button type="button" class="btn-delete" @click="toggleAsk(true)">Delete</button>
					</div>
				</div>
			</div>
			<base-modal :show="askDelete">
				<template v-slot:header>
					<div class="modal-header header-justify">
						<h3>Delete Card</h3>
						<span class="material-icons-outlined btn-close" @click="toggleAsk(false)">close</span>
					</div>
				</template>
				<template v-slot:body>
					<div class="modal-body">
						<p>Are you sure to delete this card?</p>
					</div>
					<div class="modal-footer">
						<div class="actions">
							<div class="action-button light" @click="toggleAsk(false)">Cancel</div>
							<div class="action-button" @click="deleteMyCard()">Yes, Delete Card</div>
						</div>
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
import { getEunoiaCustomerDetails, deleteCard } from "@/connector/v4/customerConnector";

export default {
	name: "SavedCardDetailsPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: true,
			activeFooterNavId: 4,
      card: null,
			cardId: null,
			askDelete: false,
			isDeleted: false
		};
	},
	watch: {},
	computed: {
		isActiveCard(){
			if(!this.card) return false;
			if(this.isDeleted) return false;
			return this.card.isActive;
		},
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
		}
	},
	methods: {
		toggleAsk(val){
			this.askDelete = this.isDeleted ? false : val == true;
		},
		async deleteMyCard(){
			const res = await deleteCard(this.cardId);
			this.askDelete = false;
			if(!res?.success){
				this.showNotification("alert", "error_outline", `Something went wrong! ${res.message || ''}`);
				return;
			}
			this.isDeleted = true;
			this.showNotification("success", "done", `Your card has been deleted!`);
			this.$router.replace({ name: "SavedCardsPage" });
		},
		async setCustomerDetail() {
			this.customer = this.$store.getters.getCustomer;
			let paymentAccounts = this.$store.getters.getPaymentAccounts;
			const res = await getEunoiaCustomerDetails();
			let tokenizedCards = res?.customer?.creditCardTokens || [];
			if(!isEmpty(tokenizedCards)) {
				tokenizedCards = tokenizedCards.map((card) => {
					return {
						...card,
						isActive: paymentAccounts.map((pm) => pm.key).includes(card.accountKey)
					}
				});
			}
			this.card = tokenizedCards.find((it) => it.id == this.cardId);
			this.loading = false;
		},
	},
	async created() {
		try {
			this.loading = true;
			this.cardId = this.$route.params.id;
			if (!this.$store.getters.hasInited) {
				await this.refreshMainData()
			} else {
				await this.refreshCustomerData();
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
	flex-direction: column;
	gap: 10px;
	background: $white;
	position: relative;
	&.empty {
		align-items: center;
		justify-content: center;
		.material-icons,
		.material-icons-outlined {
			color: $secondary-color-50;
			font-size: 3em !important;
		}
	}
	.card-type {
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		margin-bottom: 16px;
	}
	.card-number {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: $secondary-color-80;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	}
	.card-status {
		border-radius: 999px;
		padding: 3px 16px;
		border: 1px solid $success-green;
		color: $success-green;
		position: absolute;
		right: 24px;
		top: 24px;
		font-size: small;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		&.not-active {
			border: 1px solid $main-red !important;
			color: $main-red !important;
		}
	}
}
.card-info {
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 5px;
	align-items: flex-start;
	.card-info-title {
		color: $secondary-color-50;
	}
	.card-info-type {
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	}
}
.btn-delete {
	cursor: pointer;
	width: fit-content;
	margin-inline: auto;
	color: $main-red;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	border: none;
	background: transparent;
	margin-top: 16px;
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
