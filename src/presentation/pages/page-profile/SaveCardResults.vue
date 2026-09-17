<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
			<div class="cards-container">
				<span v-if="isSuccess">Your card is successfully saved.</span>
				<span v-else-if="!isSuccess && !loading">Something went wrong! Unable to save your card. Please try again</span>
				<button v-if="!loading" class="btn-back" type="button" @click="goTo('SavedCardsPage')">View Saved Cards</button>
			</div>
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

export default {
	name: "SaveCardResults",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: true,
			activeFooterNavId: 4,
			isSuccess: false
		};
	},
	async created() {
		try {
			this.loading = true;
			if (!this.$store.getters.hasInited) {
				await this.refreshMainData()
			} else {
				await this.refreshCustomerData();
			}
			this.isSuccess = this.$route.params.results == "success";
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
.cards-container {
	padding-block: 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;
	width: 100%;
	aspect-ratio: 5/2;
}
.btn-back {
	border-radius: 999px;
	background: $primary-color-60;
	outline: none;
	border: none;
	color: $white;
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
