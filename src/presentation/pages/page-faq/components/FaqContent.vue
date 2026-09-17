<template>
	<div class="page">
		<div class="page__title heading-4">Frequently Asked Questions</div>
		<div class="page__accordions">
			<base-accordion v-for="(faq, i) in faqs" v-bind:key="i"
				:accordionTitle="faq.title"
				class="page__accordion"
			>
				<div class="faq-contents" v-for="(content, a) in faq.contents" v-bind:key="a">
					<div class="faq-content-title">
						<div class="faq-content-num" v-if="content.numbering">{{ content.numbering }}.</div>
						<div class="faq-content-label">{{ content.title }}</div>
					</div>
					<div class="faq-content-items" v-for="(item, b) in content.items" v-bind:key="b">
						<div class="faq-content-title">
							<div class="faq-content-num" v-if="item.numbering">{{ item.numbering }}.</div>
							<div class="faq-content-label">{{ item.title }}</div>
						</div>
					</div>
				</div>
			</base-accordion>
		</div>
		<div class="page__filler"></div>
	</div>
</template>

<script>
export default {
	name: "FaqContent",
	data() {
		return {
			faqs: [
				{
					title: 'How To Order',
					contents: [
						{
							numbering: '1',
							title: 'Click on the item you want to purchase.',
							items: []
						},
						{
							numbering: '2',
							title: 'Select the quantity and size from the drop-down located at the product page. You may also check our size chart for reference.',
							items: []
						},
						{
							numbering: '3',
							title: 'Click the “Add to Bag” button. A pop-up will appear confirming that your product has been successfully added to your shopping bag. Click “Proceed to checkout”.',
							items: []
						},
						{
							numbering: '4',
							title: 'Log-in to your account or create a new one if you haven’t registered yet.',
							items: []
						},
						{
							numbering: '5',
							title: 'Fill-up the necessary information and click “Proceed to checkout”.',
							items: []
						},
						{
							numbering: '6',
							title: 'Read through the Terms and Conditions and tick the box if you agree. Click “Proceed to checkout”.',
							items: []
						},
						{
							numbering: '7',
							title: 'Select your preferred payment method.',
							items: []
						},
						{
							numbering: '8',
							title: 'Once done, you will be receiving a confirmation email that your order has been placed successfully.',
							items: []
						},
					]
				},
				{
					title: 'Payment Instructions',
					contents: [
						{
							numbering: '1',
							title: 'HOW TO PAY VIA CASH ON DELIVERY',
							items: [
								{
									numbering: 'i',
									title: 'Select Cash on Delivery on the payment options. Please make sure the delivery address is within the serviceable area. Cash on Delivery is available only in selected areas.'
								},
								{
									numbering: 'ii',
									title: 'You will be directed to Order Summary page. Please check the important note below. If you are done, click “Confirm my order”.'
								},
								{
									numbering: 'iii',
									title: 'This is a confirmation that your order is now complete. Please check the invoice on your email.'
								}
							]
						},
						{
							numbering: '2',
							title: 'HOW TO PAY VIA PAYMAYA (ALL VISA/MASTERCARD CREDIT AND DEBIT CARDS)',
							items: [
								{
									numbering: '',
									title: 'Select PayMaya on the payment options. Selecting PayMaya will automatically direct you to the PayMaya Checkout page.'
								},
								{
									numbering: '',
									title: 'Check if amount indicated is correct, and then enter your card details. Click to confirm the payment.'
								},
								{
									numbering: '',
									title: 'Wait for the site to process your payment. Do not close the window at this time. Wait for the page to redirect you back to site.'
								},
								{
									numbering: '',
									title: 'Check your email for your PayMaya receipt and invoice. There is no need to email it to us as we automatically receive PayMaya notifications once a payment has been made to our account.'
								},
							]
						}
					]
				},
				{
					title: 'Shipping & Tracking',
					contents: [
						{
							numbering: '1',
							title: 'WHEN WILL MY ORDERS BE PROCESSED?',
							items: [
								{
									numbering: '',
									title: 'For Cash on Delivery, the order will be processed as soon as the order has been placed.'
								},
								{
									numbering: '',
									title: 'For Credit and Debit cards, we will process your order once payment has been confirmed.'
								}
							]
						},
						{
							numbering: '2',
							title: 'HOW DO YOU SHIP MY ORDERS?',
							items: [
								{
									numbering: '',
									title: 'The shipping courier will depend on where the order will be sent to.'
								},
								{
									numbering: '',
									title: 'Metro Manila deliveries – Private couriers'
								},
								{
									numbering: '',
									title: 'Provincial – Flash Express, J&T, WSI and LBC'
								}
							]
						},
						{
							numbering: '3',
							title: 'WHAT ARE YOUR SHIPPING RATES?',
							items: [
								{
									numbering: '',
									title: 'Shipping rates vary depending on the number of items as well as the shipping location. You can check the shipping rates on the shopping bag summary.'
								},
								{
									numbering: '',
									title: 'Standard delivery time'
								},
								{
									numbering: '',
									title: 'AreaEstimated Delivery TimeMetro Manila7 business daysLuzon10 business daysVisayas & Mindanao14 business days'
								},
								{
									numbering: '',
									title: 'Estimated delivery times are to be used as a guide only and commence from the date of dispatch.'
								},
								{
									numbering: '',
									title: 'There might be a delay in receiving your orders during sale events, special holidays, and inclement weather.'
								}
							]
						}
					]
				},
				{
					title: 'Return & Exchange Policy',
					contents: [
						{
							numbering: '',
							title: 'All items sold at R.O.X. go through our quality control procedures. We inspect every item before it is shipped, and all goods shipped are fully insured in case of loss or damage.',
							items: []
						},
						{
							numbering: '',
							title: 'However, there are times when the merchandise is damaged, defective, or incorrectly shipped.',
							items: []
						},
						{
							numbering: '',
							title: 'If this is the case:',
							items: []
						},
						{
							numbering: '',
							title: 'Please email us at shop@rox.com.ph outlining the reason for your return, together with pictures of the merchandise and your Order Reference Number within 7 days upon receipt of items.',
							items: []
						},
						{
							numbering: '',
							title: 'Our customer service team will review your request and will provide the return instructions upon confirmation of your request.',
							items: []
						},
						{
							numbering: '',
							title: 'Once we receive the item/s, we will refund the amount of the total value of the purchased merchandise in the form of Store Credits that will be valid for one (1) year upon receipt of credits.',
							items: []
						},
						{
							numbering: '',
							title: 'If your courier has the option, we highly recommend for you to insure the items as it will be your responsibility to take reasonable care of the goods and will be liable for any damage to them until we receive them at our operations center. In case of dispute, we also recommend for you to retain the proof of sending.',
							items: []
						},
						{
							numbering: '',
							title: 'If the items shipped are defective or different from the ones you ordered, we will be shouldering the cost of all shipping fees incurred as well. All merchandise for return must be in original condition and in their original packaging.',
							items: []
						},
					]
				}
			]
		};
	},
};
</script>
<style lang="scss" scoped>
.page {
	display: flex;
	flex-direction: column;
	&__title {
		align-self: flex-start;
		margin-left: 16px;
	}
	&__filler {
		flex-grow: 1;
	}
	&__accordions {
		margin-left: 16px;
		margin-right: 16px;
		margin-top: 48px;
	}
	&__accordion {
		box-shadow: 0 4px 2px -2px #f4f4f4;
	}
	&__share {
		padding: 16px 24px;
		&__button {
			width: 100%;
			height: 48px;
		}
	}
	.faq-contents{
		width: 100%;
		font-size: 0.875rem;
		.faq-content-title{
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			align-items: flex-start;
			.faq-content-num {
				width: 15px;
			}
			.faq-content-label {
				flex: 1;
			}
			.faq-content-num + .faq-content-label {
				padding-left: 8px;
			}
		}
		.faq-content-items + .faq-content-items {
			margin-top: 4px;
		}
		.faq-content-items {
			padding-left: 24px;
		}
	}
	.faq-contents + .faq-contents {
			margin-top: 8px;
		}
}
</style>
