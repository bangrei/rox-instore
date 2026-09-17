<template>
	<div>
		<div class="page">
			<div class="page__title heading-4">Terms and Conditions</div>
			<div class="page__content__con align-left secondary-color-70">
				<div class="terms-content" v-for="(terms, i) in termsData" v-bind:key="i">
					<p class="heading-5 bold">{{ terms.title }}</p>
					<div class="page__list body-2-normal" v-html="renderContents(terms.contents)"></div>
				</div>
			</div>
			<div class="page__filler"></div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'TermsContent',
	data() {
		return {
			termsData: [
				{
					title: 'Data Privacy Act of 2012 (DPA)',
					contents: [
						{
							numbering: '',
							title: `R.O.X Community (ROXC) is a wholly owned program by Aeroworx Asia Pte Ltd (AA). Our
								mission is to create an online platform that will allow like-minded individuals to connect. We
								thank you for trusting us with your personal information. We value your privacy. All
								data and information collected will be treated with the same data protection policy and
								confidentiality. This outlines how we may use the information that you provide us in compliance
								with the Data Privacy Act of 2012, its implementing rules and regulations, and amendments
								(DPA).`,
							items: []
						},
						{
							numbering: '',
							title: `This data protection policy applies to Aeroworx Asia Pte Ltd (AA) and all its related
								companies in the Republic of the Philippines. This Privacy Policy governs the collection, use
								and disclosure of Personal Information provided to Aeroworx Asia Pte Ltd (AA) and its affiliated
								companies. It states the way of collection and the utilization of Personal Information of
								individuals in compliance with the requirement(s) and regulation(s) of the DPA. Any information
								not referred to in this disclosure shall be construed in accordance with the DPA.`,
							items: []
						},
						{
							numbering: '',
							title: `“PERSONAL INFORMATION” shall mean
								any information from which the identity of an individual can be reasonably and directly
								ascertained, or when put together with other information would directly and certainly identify an
								individual, such as name, gender, date of birth, address, telephone/mobile number, email
								address, proof of identification, etc. It also includes information about:`,
							items: [
								{
									numbering: '1',
									title: `the services provided to you, such as, the platform for ordering, location information, 
										and certain information about your account, as required by law;`,
								},
								{
									numbering: '2',
									title: `the location of your device whenever you are connected to our platform/site; and`,
								},
								{
									numbering: '3',
									title: `your use of our network, platform, network performance experience, diagnostics, such
										as: site speed, landing pages, data failures, exit pages, data analytics and other site
										performance issues to help us improve our site/network and quality of products and
										services, determine tailored content, and for other legitimate business purposes`,
								}
							]
						},
						{
							numbering: '',
							title: `“NON-PERSONAL INFORMATION” shall mean any information that does not identify you
								individually, and includes statistical and analytical data, and anonymous and aggregate reports.
								By continuing to use the platform, products and website services, you signify that you have
								read, understood, and consented to the collection and use of your Personal Information, in
								accordance with this Privacy Policy.`,
							items: []
						}
					]
				},
				{
					title: 'COLLECTION OF PERSONAL INFORMATION',
					contents: [
						{
							numbering: '1',
							title: `We generally do not collect your Personal Information unless`,
							items: [
								{
									numbering: '1',
									title: `It is provided to us voluntarily by you directly or via a third party who has been duly authorized by you to disclose your Personal Information, provided that:`,
									items: [
										{
											numbering: '1',
											title: `You (or your Authorized Representative) have been notified of the purposes for which the data is collected, and`
										},
										{
											numbering: '2',
											title: `You (or your Authorized Representative) have provided written consent to the collection and of your Personal Information for those Purposes`,
										}
									]
								},
								{
									numbering: '2',
									title: `Collection and use of Personal Information requires consentunder the DPA. We shall
										seek your consent before the
										collection any additional Personal Information and before using your Personal
										Data for a purpose which has not been notified to you (except where
										permitted or authorized by law).`,
									items: [],
								}
							]
						},
						{
							numbering: '2',
							title: `We may collect information from the devices and systems you use through
								automated technologies when you visit our stores or use our Online Services.
								These automated technologies may include cookies, local shared objects and
								web beacon. Such information are automatically received and recorded from
								your browser on our server logs which may include but are not limited to your IP
								address, device type, device operating system, browser type and the webpage
								you were visiting before you access our Online Services.`,
							items: [],
						},
						{
							numbering: '3',
							title: `Depending on the nature of your interaction with us, Personal Data which may be collected from you may include but are not limited to:`,
							items: [
								{
									numbering: '1',
									title: `Identity data - such as your name, gender, nationality date of birth, photographs and other audio-visual information;`,
									items: []
								},
								{
									numbering: '2',
									title: `Contact data - such as your billing address, delivery address, email address and telephone numbers;`,
									items: []
								},
								{
									numbering: '3',
									title: `Transaction data - such as date of purchase, product purchased, quantity purchased, which outlet you transacted at, method of payment and payment details;`,
									items: []
								},
								{
									numbering: '4',
									title: `Account data - such as your username and password`,
									items: []
								},
								{
									numbering: '5',
									title: `Technical and usage data - such as type of device used, browser type, internet protocol (IP) address, location, what you view on and how long you use our Online Services; and`,
									items: []
								},
								{
									numbering: '6',
									title: `Marketing and communications data - such as your preferences to receive marketing messages from us and your communications preferences.`,
									items: []
								}
							]
						},
						{
							numbering: '4',
							title: `The methods in which we may receive Personal Information from you may include but are not limited to when you:`,
							items: [
								{
									numbering: '1',
									title: `create an account with us`,
									items: [],
								},
								{
									numbering: '2',
									title: `visit any of our Online Services;`,
									items: [],
								},
								{
									numbering: '3',
									title: `purchase products at our stores, through our Online Services or via third party channels;`,
									items: [],
								},
								{
									numbering: '4',
									title: `request to receive marketing or other communications from us;`,
									items: [],
								},
								{
									numbering: '5',
									title: `enter in our contests, competitions, prize draws, or surveys; or`,
									items: [],
								},
								{
									numbering: '6',
									title: `submit information when providing feedback.`,
									items: [],
								},
							],
						},
						{
							numbering: '5',
							title: `We may combine information we collect and receive from third party sources.`,
							items: [],
						},
					]
				},
				{
					title: 'USE AND DISCLOSURE OF PERSONAL INFORMATION',
					contents: [
						{
							numbering: '1',
							title: `We may use the Personal Information collected for certain purposes, which include but are not limited to the following`,
							items: [
								{
									numbering: 'a',
									title: `To fulfil orders and process payments for our products and services;`,
									items: [],
								},
								{
									numbering: 'b',
									title: `To communicate with you about your orders or accounts with us;`,
									items: [],
								},
								{
									numbering: 'c',
									title: `To respond to your queries, feedback, claims or disputes;`,
									items: [],
								},
								{
									numbering: 'd',
									title: `To send you marketing information about our brands, products and services,
									including notifying you of our marketing events, initiatives and promotions, lucky
									draws, membership and rewards schemes and other promotions such as co-branded
									offers and affiliate and partner offers, provided you have indicated that you have not
									objected to being contacted for these purposes;`,
									items: [],
								},
								{
									numbering: 'e',
									title: `To communicate with you about and administer your participation in contests, competitions, prize draws, or surveys;`,
									items: [],
								},
								{
									numbering: 'f',
									title: `To ascertain your identity for fraud detection purposes;`,
									items: [],
								},
								{
									numbering: 'g',
									title: `For internal operations and evaluation, including troubleshooting, data analysis, testing, research, improvement of existing and development of new products and services;`,
									items: [],
								},
								{
									numbering: 'h',
									title: `To comply with any applicable laws, regulations, codes of practice, guidelines, or
									rules, or to assist in law enforcement and investigations conducted by any
									governmental and/or regulatory authority; or`,
									items: [],
								},
								{
									numbering: 'i',
									title: `To transmit to our affiliates or third parties including our third party service providers
									and agents, and relevant governmental and/or regulatory authorities, whether in The
									Philippines or abroad, for the aforementioned purposes.`,
									items: [],
								}
							]
						},
						{
							numbering: '2',
							title: `By entering any event premises, I consent to photography, audio recording, interviews,
							testimonials, video recording and its/their release, publication, exhibition, or reproduction to
							be used for promotional purposes, advertising, inclusion on websites, social media, or any
							other media by the Primer Group of Companies and it’s affiliates and representatives.`,
							items: []
						},
						{
							numbering: '3',
							title: `In sharing your Personal Information with our affiliates or third parties, we endeavor to
							ensure that they protect the data and keep it secure from unauthorized access, and only use,
							disclose, and retain the data for as long as they need your Personal Information to achieve
							the above mentioned purposes and only in accordance with the DPA, thereafter securely
							destroying or disposing of your Personal Information when there is no longer a purpose to
							retain it.`,
							items: []
						},
						{
							numbering: '4',
							title: `For our Online Services, information collected through automated technologies are used for purposes such as to`,
							items: [
								{
									numbering: 'a',
									title: `help us remember and process items in your shopping cart,`,
									items: [],
								},
								{
									numbering: 'b',
									title: `understand and deliver personalized content and advertising according to our users\` interests, and`,
									items: [],
								},
								{
									numbering: 'c',
									title: `compile aggregate data about site traffic and site interaction so that we can evaluate
									and improve on our Online Services and site experiences in the future.`,
									items: [],
								}
							]
						},
						{
							numbering: '5',
							title: `We may also use the information we obtain in other ways for which we will provide specific
							notice at the time of collection.`,
							items: []
						},
						{
							numbering: '6',
							title: `We may disclose your Personal Information:`,
							items: [
								{
									numbering: 'a',
									title: `where such disclosure is required for performing obligations in the course of or in
									connection with our provision of the goods or services requested by you;`,
									items: [],
								},
								{
									numbering: 'b',
									title: `to third party service providers, agents and other organizations located in and outside
									of The Philippines we have engaged which provides administrative, data processing,
									information technology or other services; or`,
									items: [],
								},
								{
									numbering: 'c',
									title: `to those involved in the negotiation or transfer of our company in the event of a
									merger, acquisition, financing, or sale of assets or any other situation involving the
									transfer of some or all of our business assets.`,
									items: [],
								},
							]
						},
						{
							numbering: '7',
							title: `Non-Personal Information disclosed to us may be used for statistical, analytical, and
							research purposes to create anonymous and aggregate reports.`,
							items: []
						},
						{
							numbering: '8',
							title: `The purposes listed in the above clauses may continue to apply even in situations where
							your relationship with us (for example, pursuant to a contract) has been terminated or altered
							in any way, for a reasonable period thereafter (including, where applicable, a period to
							enable us to enforce our rights under any contract with you).`,
							items: []
						},
					]
				},
				{
					title: 'WITHDRAWAL OF CONSENT',
					contents: [
						{
							numbering: '1',
							title: `The consent that you provide for the collection, use and disclosure of your
								Personal Information will remain valid until such time it is being withdrawn by you in
								writing. You may withdraw consent and request us to stop using and/or disclosing
								your Personal Information for any or all of the purposes listed above by submitting your
								request in writing via email to our Data Protection Officer at the contact details
								provided below.`,
							items: []
						},
						{
							numbering: '2',
							title: `Upon receipt of your written request to withdraw your consent, we may require
								reasonable time (depending on the complexity of the request and its impact on
								our relationship with you) for your request to be processed and for us to notify
								you of the consequences of us acceding to the same, including any legal
								consequences which may affect your rights and liabilities to us. In general, we
								shall seek to process your request within ten (10) business days of receiving it.`,
							items: []
						},
						{
							numbering: '3',
							title: `Depending on the nature and scope of your request, we may not be in a position
								to continue providing our goods or services to you and we shall, in such
								circumstances, notify you before completing the processing of your request`,
							items: []
						},
						{
							numbering: '4',
							title: `Please note that if you opt out of receiving marketing communications from us,
								we may still send communications to you concerning your transactions, accounts
								with us and any contests, competitions, prize draws, or surveys in which you
								have enrolled prior to your withdrawal of consent.`,
							items: []
						},
						{
							numbering: '5',
							title: `Please note that withdrawing consent does not affect our right to continue to
								collect, use and disclose Personal Information where such collection, use and disclose
								without consent is permitted or required under applicable laws.`,
							items: []
						},
					]
				},
				{
					title: `ACCESS TO AND CORRECTION OF PERSONAL INFORMATION`,
					contents: [
						{
							numbering: '1',
							title: `If you wish to make (a) an access request for access to a copy of the Personal
								Data which we hold about you or information about the ways in which we use or
								disclose your Personal Information, or (b) a correction request to correct or update any
								of your Personal Information which we hold about you, you may submit your request in
								writing via email to our Data Protection Officer at the contact details provided
								below.`,
							items: [],
						},
						{
							numbering: '2',
							title: `In order to facilitate processing your request, it may be necessary for us to
								request further information relating to your request. We may also ask you to
								verify your identity and/or provide other details to help us respond to your
								request. If you are below the age of 18, a parent, guardian or ward may request
								access to, correction or deletion of your Personal Information.`,
							items: [],
						},
						{
							numbering: '3',
							title: `We reserve the right to charge a reasonable administrative fee for retrieving your
								Personal Information records, should the same be excessive or repetitive. If so, we will inform
								you of the fee before processing your request.`,
							items: [],
						},
						{
							numbering: '4',
							title: `We will respond to your request as soon as reasonably possible. Should we not
								be able to respond to your request within thirty (30) days after receiving your
								request, we will inform you in writing within thirty (30) days of the time by which
								we will be able to respond to your request. If we are unable to provide you with
								any Personal Information or to make a correction requested by you, we shall generally
								inform you of the reasons why we are unable to do so (except where we are not
								required to do so under the DPA and relevant laws). In certain circumstances, including when
								required by applicable law, we will comply with your request. Please note that we
								may be required by law to retain certain information.`,
							items: [],
						}
					],
				},
				{
					title: `PROTECTION OF PERSONAL INFORMATION`,
					contents: [
						{
							numbering: '1',
							title: `To safeguard your Personal Information from unauthorized access, collection, use,
								disclosure, copying, modification, disposal or similar risks, we have introduced
								appropriate administrative, physical and technical measures such as up-to-date
								antivirus protection and SSL encryption technology to secure all storage and
								transmission of Personal Information by us, and disclosing Personal Information both
								internally and to our authorized third party service providers and agents only on a
								need-to-know basis.`,
							items: [],
						},
						{
							numbering: '2',
							title: `You should be aware, however, that no method of transmission over the Internet
								or method of electronic storage is completely secure. While security cannot be
								guaranteed, we strive to protect the security of your information and are
								constantly reviewing and enhancing our information security measures.`,
							items: [],
						},
						{
							numbering: '3',
							title: `Your password is the key to your account. You are strongly encouraged to create
								a strong password by using a mix of unique numbers, letters and special
								characters. Do not share your password with anyone. If you do share your
								password with others, you will be responsible for all actions taken in the name of
								your account and the consequences. If you lose your password, you may lose
								substantial control over your Personal Information and other data submitted to us. You
								could also be subject to legally binding actions taken on your behalf. Therefore, if
								your password has been compromised or if you have grounds to believe that
								your password has been compromised, you should contact us immediately and
								change your password. You are reminded to exercise due diligence in the
								protection of your own account, password and Personal Information, such as always
								logging out of your account and closing the browser when you are finished with
								using a shared computer.`,
							items: [],
						},
						{
							numbering: '4',
							title: `If you believe that your privacy has been breached by us, please contact us Immediately.`,
							items: [],
						},
					],
				},
				{
					title: `ACCURACY OF PERSONAL INFORMATION`,
					contents: [
						{
							numbering: '1',
							title: `We generally rely on Personal Information provided by you (or your Authorized
								Representative). In order to ensure that your Personal Information is current, complete
								and accurate, please update us by informing our Data Protection Officer in
								writing via email at the contact details provided below if (i) there are changes to
								your Personal Information, or (ii) you believe that the Personal Information we have about you
								is inaccurate, incomplete, misleading or out of date. Should you be unable to supply us with the
								required Personal Information, we may be unable to provide you with your requested products
								and services, and you may be unable to participate in our events, promotions or other activities.`,
							items: [],
						},
					],
				},
				{
					title: `RETENTION OF PERSONAL INFORMATION`,
					contents: [
						{
							numbering: '1',
							title: `We may retain your Personal Information for as long as it is necessary to fulfill the
								purpose for which it was collected, or as required or permitted by applicable laws.`,
							items: [],
						},
						{
							numbering: '2',
							title: `We will cease to retain your Personal Information, or remove the means by which the
								data can be associated with you, as soon as it is reasonable to assume that such
								retention no longer serves the purpose for which the Personal Information was
								collected, and is no longer necessary for legal or business purposes.`,
							items: [],
						},
					],
				},
				{
					title: `TRANSFERS OF PERSONAL INFORMATION OUTSIDE OF PHILIPPINES`,
					contents: [
						{
							numbering: '1',
							title: `We generally do not transfer your Personal Information to countries outside of
								Philippines. However, if we do so, we will obtain your consent for the transfer to
								be made and we will take steps to ensure that your Personal Information continues to
								receive a standard of protection that is at least comparable to that provided under
								the DPA.`,
							items: [],
						}
					],
				},
				{
					title: `EFFECT OF POLICY AND CHANGES TO POLICY`,
					contents: [
						{
							numbering: '1',
							title: `This Policy applies in conjunction with any other Policies, contractual clauses and
								consent clauses that apply in relation to the collection, use and disclosure of your
								Personal Information by us.`,
							items: [],
						},
						{
							numbering: '2',
							title: `We may revise this Privacy Policy from time to time. You may determine if any
								revision has taken place by referring to the date on which this Policy was last
								updated. Your continued use of our services constitutes your acknowledgement
								and acceptance of such changes. We encourage you to check here periodically
								for the most up-to-date version of our Policy.`,
							items: [],
						}
					],
				},
				{
					title: `HOW TO CONTACT US`,
					contents: [
						{
							numbering: '1',
							title: `Should you have any enquiries or feedback on our Personal Information Protection
								Policies and Procedures, or you wish to make any request, you may contact our
								Data Protection Officer (DPO) at:`,
							items: [
								{
									numbering: '',
									title: ``,
									items: [
										{
											numbering: '',
											title: `Evelyne Villanueva (DPO)`,
											items: [],
										},
										{
											numbering: '',
											title: `Email: evelyne.villanueva@aeroworx-asia.com`,
											items: [],
										},
										{
											numbering: '',
											title: `Last Updated: January 19, 2023`,
											items: [],
										}
									],
								}
							],
						},
						{
							numbering: '2',
							title: `For any other concerns you may also contact the following:`,
							items: [
								{
									numbering: '',
									title: ``,
									items: [
										{
											numbering: '',
											title: `Osmond Chua (Project Manager)`,
											items: [],
										},
										{
											numbering: '',
											title: `Email: osmond.chua@aeroworx-asia.com or shop@rox.com.ph`,
											items: [],
										},
									],
								},
							]
						}
					],
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
				item += `<div class="terms-content-header">`;
				if(content.numbering) item += `<div class="terms-content-numbering">${content.numbering}.</div>`;
				item += `<div class="terms-content-label">${content.title}</div>`;
				item += `</div>`;
				if(content.items && content.items.length > 0){
					item += this.renderContents(content.items);
				}
				item += `</div>`;
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

.page {
	display: flex;
	flex-direction: column;

	&__title {
		align-self: flex-start;
		margin-left: 16px;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		font-weight: normal !important;
		color: $main-red;
	}

	&__content__con {
		padding: 16px;
		margin-top: 48px;

		p {
			margin-bottom: 12px;
		}
	}

	&__list {
		color: $secondary-color-60;
	}

	&__filler {
		flex-grow: 1;
	}

	ol {
		padding-inline-start: 16px;
	}
	.terms-content + .terms-content {
		margin-top: 12px;
	}
	.terms-content .terms-content .terms-content {
		padding-left: 18px;
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
		.terms-content-numbering {
			width: 15px;
		}
		.terms-content-numbering + .terms-content-label {
			padding-left: 8px;
			flex: 1;
		}
	}
}
@media(min-width: 672px){
	.page {
		padding: 24px 7% !important;
	}
}
</style>
