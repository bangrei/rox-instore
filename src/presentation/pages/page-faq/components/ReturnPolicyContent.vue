<template>
	<div>
		<div class="page">
			<div class="page__content__con align-left secondary-color-70">
				<div class="terms-content" v-for="(terms, i) in termsData" v-bind:key="i">
					<p class="heading-5 bold">{{ terms.title }}</p>
					<div class="page__list body-2-normal" v-html="renderContents(terms.contents)"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ReturnPolicyContent',
	data() {
		return {
			termsData: [
				{
					title: '',
					contents: [
						{
							numbering: '',
							title: `All items sold at ROX.com.ph go through our quality control procedures. 
							We inspect every item before it is shipped, and all goods shipped are fully insured in case of loss or damage.`,
							items: []
						},
						{
							numbering: '',
							title: `However, there are times when the merchandise is damaged, defective, or incorrectly shipped.`,
							items: []
						},
					]
				},
				{
					title: '',
					contents: [
						{
							numbering: '',
							title: `If this is the case:`,
							items: [
								{
									numbering: '1',
									listItem: false,
									title: `Kindly reach out to us using the chat icon located in the lower right-hand corner of the screen outlining the reason 
									for your return, together with pictures of the merchandise and your Order Reference Number within 7 days upon receipt of items.`,
									items: []
								},
								{
									numbering: '2',
									title: `Our customer service team will review your request and will provide the return instructions upon confirmation of your request.`,
									items: []
								},
								{
									numbering: '3',
									title: `Once we receive the item/s, we will refund the amount of the total value of the purchased merchandise in the form of Store Credits that will be valid for one (1) year.`,
									items: []
								},
								{
									numbering: '4',
									title: `If your courier has the option, we highly recommend that you insure the items, when returning, as it will be your responsibility to take reasonable care of the goods and will be liable for any damage to them until we receive them at our operations center. In case of dispute, we also recommend for you to retain the proof of sending.`,
									items: []
								},
								{
									numbering: '5',
									title: `If the items shipped are defective or different from the ones you ordered, we will be shouldering the cost of all shipping fees incurred as well. All merchandise for return must be in original condition and in their original packaging.`,
									items: []
								},
							]
						},
					]
				},
			]
		}
	},
	methods: {
		renderContents(contents){
			if(!contents || contents.length == 0) return;
			let htmls = '';
			contents.forEach(content => {
				var item = `<div class="terms-content">`;
				if (content.table) {
					item = `<table>`;
					if (content.headers) {
						item += `<thead><tr>`;
						content.headers.forEach((th) => {
							item += `<th>${th}</th>`;
						});
						item += `</tr></thead>`;
					}
					if (content.items) {
						item += `<tbody>`;
						content.items.forEach((td) => {
							item += `<tr>`;
							td.forEach((d) => {
								item += `<td>${d}</td>`;
							});
							item += `</tr>`;
						});
						item += `</tbody>`;
					}
					item += `</table>`;
				} else {
					item += `<div class="terms-content-header ${content.alignCenter ? 'center' : ''}">`;
					if (content.numbering) item += `<div class="terms-content-numbering">${content.numbering}.</div>`;
					else if (content.listItem) item += `<div class="terms-content-li"></div>`;
					item += `<div class="terms-content-label">${content.title}</div>`;
					item += `</div>`;
					if(content.items && content.items.length > 0){
						item += this.renderContents(content.items);
					}
					item += `</div>`;
				}
				htmls += item;
			});
			return htmls;
		}
	}
};
</script>

<style lang="scss">
.align-left {
	text-align: left;
}
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
	margin-bottom: 6px;
	th, td {
		text-align: left;
		border: 1px solid #ebebeb;
		padding: 10px 14px;
	}
}
.page {
	padding: 24px;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 990px;
	margin-inline: auto;

	&__title {
		align-self: flex-start;
		margin-left: 16px;
	}

	&__content__con {
		display: flex;
		flex-direction: column;
		gap: 24px;

		p {
			margin-bottom: 12px;
		}
	}

	&__list {
		color: $secondary-color-70;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	&__filler {
		flex-grow: 1;
	}

	ol {
		padding-inline-start: 16px;
	}
	a {
		text-decoration: none;
		color: $primary-color-100;
	}
	.terms-content .terms-content .terms-content {
		padding-left: 24px;
	}
	.terms-content .terms-content + .terms-content {
		margin-top: 6px;
	}
	.page__list + .page__list {
		margin-top: 12px;
	}
	.terms-content-header {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		.terms-content-label {
			text-align: left;
		}
		&.center {
			justify-content: center !important;
			.terms-content-label {
				text-align: center !important;
			}
		}
		.terms-content-numbering {
			width: 15px;
		}
		.terms-content-li {
			min-width: 5px;
			min-height: 5px;
			max-width: 5px;
			max-height: 5px;
			margin: 6px 12px;
			display: block;
			border-radius: 50%;
			background: $secondary-color-60;
			content: "";
		}
		.terms-content-numbering + .terms-content-label {
			padding-left: 8px;
			flex: 1;
		}
	}
}
.footer-image {
	margin-top: 32px;
	width: 100%;
	max-width: 150px;
	margin-inline: auto;
	mix-blend-mode: multiply;
}
@media(min-width: 672px){
	.page {
		padding: 24px 7% !important;
	}
}
</style>
