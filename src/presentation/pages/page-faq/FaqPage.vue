<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
			<h1>FAQ</h1>
			<div class="faq-container">
				<base-tab-panel size="lg" @select-tab="toggleSelected">
					<base-tab title="Payment" :isSelected="tabIndex === 1" :key="1">
						<base-accordion accordionTitle="How to pay via Cash On Delivery">
							<div class="accordion-content">
								<ul>
									<li>Select Cash on Delivery on the payment options. Please make sure the delivery address is within the serviceable area. Cash on Delivery is available only in selected areas.</li>
									<li>You will be directed to Order Summary page. Please check the important note below. If you are done, click “Confirm my order”.</li>
									<li>This is a confirmation that your order is now complete. Please check the invoice on your email.</li>
								</ul>
							</div>
						</base-accordion>
						<base-accordion accordionTitle="How to pay via Paymaya (All Visa/Mastercard Credit & Debit Cards)">
							<div class="accordion-content">
								<ul>
									<li>Select PayMaya on the payment options. Selecting PayMaya will automatically direct you to the PayMaya Checkout page.</li>
									<li>Check if amount indicated is correct, and then enter your card details. Click to confirm the payment.</li>
									<li>Wait for the site to process your payment. Do not close the window at this time. Wait for the page to redirect you back to site.</li>
									<li>Check your email for your PayMaya receipt and invoice. There is no need to email it to us as we automatically receive PayMaya notifications once a payment has been made to our account</li>
								</ul>
								<p>All pages that require you to enter your personal information or payment details on our site are secure, using 128-bit SSL encryption.</p>
							</div>
						</base-accordion>
						<base-accordion accordionTitle="How to pay in installment via BILLEASE">
							<div class="accordion-content">
								<p>Billease is a buy now, pay later app that allows you to pay for your purchases in easy bi-weekly or monthly installments either interest-free or interest-bearing even without a debit or credit card!</p>
								<ul>
									<li>Select Billease from the payment options.</li>
									<li>Clicking Complete order will automatically direct you to the Billease Checkout page.</li>
									<li>Choose a payment plan then log in or sign up for a new account.</li>
									<li>Review your installment details, then confirm your purchase via OTP.</li>
								</ul>
								<p>All pages that require you to enter your personal information or payment details on our site are secure, using 128-bit SSL encryption.</p>
							</div>
						</base-accordion>
					</base-tab>
					<base-tab title="Shipping" :isSelected="tabIndex === 2" :key="2">
						<base-accordion accordionTitle="When will my order be processed?">
							<div class="accordion-content">
								<ul>
									<li>For Cash on Delivery, the order will be processed as soon as the order has been placed.</li>
									<li>For Credit and Debit cards, we will process your order once payment has been confirmed.</li>
								</ul>
							</div>
						</base-accordion>
						<base-accordion accordionTitle="How do you ship my orders?">
							<div class="accordion-content">
								<p>We partner with reliable third-party logistics providers, including J&T, 2GO, and Ninjavan, to ensure timely and secure delivery of your orders.</p>
							</div>
						</base-accordion>
						<base-accordion accordionTitle="What are your shipping rates?">
							<div class="accordion-content">
								<p>Shipping rates vary depending on the number of items as well as the shipping location. You can check the shipping rates on the shopping bag summary.</p>
								<p>Standard Delivery:</p>
								<ul>
									<li>NCR: 3 days</li>
									<li>Luzon: 8-10 days</li>
									<li>Visayas: 10-12 days</li>
									<li>Mindanao: 12-14 days</li>
								</ul>
								<p>Estimate delivery times are to be used as a guide only.</p>
								<p>There might be a delay in receiving your orders during sale events, special holidays, and inclement weather.</p>
							</div>
						</base-accordion>
					</base-tab>
					<base-tab
						title="Returns"
						:isSelected="tabIndex === 3"
						:key="3"
					>
						<h3>Returns</h3>
						<p>All items sold at rox.com.ph go through our quality control procedures. We inspect every item before it is shipped, and all goods shipped are fully insured in case of loss or damage.</p>
						<p>However, there are times when the merchandise is damaged, defective, or incorrectly shipped, kindly reach out to us using the chat icon located in the lower right-hand corner of the screen.</p>
					</base-tab>
				</base-tab-panel>
			</div>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
export default {
	name: "FaqPage",
	mixins: [utility],
	components: { LayoutVariantTwo },
	data() {
		return {
			tabIndex: 1,
			loading: true,
		};
	},
	computed: {
		showBack(){
			return window.history.state.back !== null
		}
	},
	methods: {
		toggleSelected(activeCategoryId) {
			this.tabIndex = activeCategoryId;
		},
	},
	async created(){
		if(!this.$store.getters.hasInited){
			await this.refreshMainData();
		}
		this.loading = false;
	}
};
</script>
<style lang="scss" scoped>
h1 {
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	font-size: 24px;
	margin-top: 48px;
	margin-bottom: 24px;
	color: $main-red;
	font-weight: normal !important;
}
.faq-container {
	padding: 24px;
	width: 100%;
	max-width: 800px;
	margin-inline: auto;
}
ul {
	padding-inline: 16px;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
}
li {
	list-style: decimal;
}
p {
	margin-top: 12px;
	text-align: left;
	& + * {
		margin-top: 16px;
	}
}
h3 {
	text-align: left;
}
</style>
