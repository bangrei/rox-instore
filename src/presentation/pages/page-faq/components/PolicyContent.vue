<template>
	<div>
		<div class="page">
			<div class="page__content__con align-left secondary-color-70">
				<div class="terms-content" v-for="(terms, i) in termsData" v-bind:key="i">
					<p class="heading-5 bold">{{ terms.title }}</p>
					<div class="page__list body-2-normal" v-html="renderContents(terms.contents)"></div>
				</div>
			</div>
			<!-- <div class="page__filler">
				<img class="footer-image" :src="require('@/assets/images/columbia-PH-privacy-policy-image.jpg')"/>
			</div> -->
		</div>
	</div>
</template>

<script>
export default {
	name: 'PolicyContent',
	data() {
		return {
			termsData: [
				{
					title: '1. Privacy Policy',
					contents: [
						{
							numbering: '',
							title: `This Privacy Policy outlines our policy in relation to the collection, use, and protection of 
								your Customer Data. From time to time, we may update our Privacy Policy to reflect current changes in our policy and the law.
								When we do so, we will notify you by posting it on our website for your information and reference.`,
							items: []
						},
						{
							numbering: '',
							title: `By continuing to use the platform, products and website services, you signify that you have read, 
								understood, and consented to the collection and use of your Customer Data, particularly your Personal Information,
								in accordance with this Privacy Policy.`,
							items: []
						},
					]
				},
				{
					title: '2. Collection of Customer Data',
					contents: [
						{
							numbering: '',
							title: `As part of our continuing relationship with you, we collect your Customer Data, as may be applicable.`,
							items: []
						},
						{
							numbering: '',
							title: `Customer Data are either Personal Information or Non-Personal Information:`,
							items: [
								{
									numbering: '1',
									listItem: false,
									title: `Personal Information is any information from which the identity of an individual can be reasonably 
									and directly ascertained, or when put together with other information would directly and certainly identify
									an individual, such as name, gender, date of birth, address, telephone/mobile number,
									email address, proof of identification, etc. It also includes information about:`,
									items: [
										{
											numbering: '1',
											listItem: false,
											title: `the services provided to you, such as, the platform for ordering, location information, and certain information about your account, as required by law;`,
											items: []
										},
										{
											numbering: '2',
											listItem: false,
											title: `the location of your device whenever you are connected to our platform/site; and`,
											items: []
										},
										{
											numbering: '3',
											listItem: false,
											title: `your use of our network, platform, network performance experience, diagnostics, such as: site speed, 
											landing pages, data failures, exit pages, data analytics and other site performance issues to help us
											improve our site/network and quality of products and services, determine tailored content,
											and for other legitimate business purposes.`,
											items: []
										},
									]
								},
								{
									numbering: '2',
									title: `Non-Personal Information is any information that does not identify you individually, and includes statistical 
									and analytical data, and anonymous and aggregate reports.`,
									items: []
								},
							]
						},
						{
							numbering: '',
							title: `We may also request you to update your Personal Information from time to time. 
							Should you be unable to supply us with the required Personal Information, we may be unable to provide you
							with your requested products and services, and you may be unable to participate in our events, promotions or other activities.
							When you use our website and electronically communicate with us, depending on your settings, we may use cookies,
							web beacons, small data text files or similar technologies to identify your device and record your preferences, with your consent.`,
							items: []
						},
						{
							numbering: '',
							title: `We also collect the following:`,
							items: [
								{
									numbering: '',
									listItem: true,
									title: `<b>Cookies</b>`,
									items: [
										{
											numbering: '',
											listItem: true,
											title: `We (or third party service providers on our behalf) may set and access Cookies and similar technologies on your computer. 
											A Cookie is a small piece of data (often including a unique identifier) that is stored on your computer or mobile device
											by your web browser when you visit a website. We use Cookies to understand site usage and improve the content and offerings
											on our site and in other media. We may use Cookies to control the display of ads, to track usage patterns on our site,
											to deliver editorial content, to record requests for subscriptions, and to personalize the content that you see on our site.
											We (or third party service providers on our behalf) may also use Cookies to collect aggregate information about website users
											on an anonymous basis ("Anonymous Information"). We may share aggregate demographics and usage information with our prospective
											and actual business partners, advertisers and other third parties for any business purpose.`,
											items: []
										},
										{
											numbering: '',
											listItem: true,
											title: `Some of our third party partners (including advertisers and marketing services companies) may set and access 
											Cookies and similar technologies on your computer as well, or we may do so on their behalf. We do not have control over
											how these third parties use such Cookies and similar technologies or the information derived therefrom.`,
											items: []
										},
										{
											numbering: '',
											listItem: true,
											title: `Most web browsers can be set to disable the use of Cookies. However, if you disable Cookies, you may not be able to 
											access full functionality of the site correctly or at all. We never place Personally Identifiable Information on Cookies.`,
											items: []
										},
									]
								},
								{
									numbering: '',
									listItem: true,
									title: `<b>IP Address.</b> Your Internet Protocol ("IP") address is usually associated with the place from which you enter the Internet, 
									like your Internet Service Provider, your company or your university. Our server may also record the referring page
									that linked you to us (e.g. another website or search engine); the pages you visit on the our site, the web sites
									you visit after this website; the ads you see; the ads you click on; other information about the type of web browser,
									computer operating system, device, platform, related software and settings you are using; any search terms you have
									entered on this web site or a referral site; and other web usage activity and data logged by our web servers.
									We may use your IP address to help diagnose problems with our servers, gather broad demographic information,
									analyze trends among our Users to help us improve and administer the site. We may also link this information
									with your Personally Identifiable Information when we feel that it is necessary to enforce compliance with our
									rules and policies or terms of service or to protect our site, customers or others.`,
									items: []
								},
								{
									numbering: '',
									listItem: true,
									title: `<b>Third Party Tracking Tools.</b> We also use third party tracking tools to improve the performance and features of the site. 
									These third party tracking tools are designed to collect only Non-Personal Information about your use of the site.
									However, you understand that such tools are created and managed by parties outside our control.
									As such, we are not responsible for what information is actually captured by such third parties or
									how such third parties use and protect that information.`,
									items: []
								},
							]
						},
					]
				},
				{
					title: '3. Use of Customer Data',
					contents: [
						{
							numbering: '',
							title: `Without limiting the generality of the foregoing, we use Customer Data to, among others:`,
							items: [
								{
									numbering: '1',
									listItem: false,
									title: `Provide ecommerce services, including customer support;`,
									items: []
								},
								{
									numbering: '2',
									listItem: false,
									title: `Enhance your customer experience and determine tailored content to meet your preferences and needs;`,
									items: []
								},
								{
									numbering: '3',
									listItem: false,
									title: `Communicate relevant services and/or advisories to you;`,
									items: []
								},
								{
									numbering: '4',
									listItem: false,
									title: `Abide by any safety, security, public service or legal requirements and processes; and`,
									items: []
								},
								{
									numbering: '5',
									listItem: false,
									title: `Process information for statistical, analytical, and research purposes.`,
									items: []
								},
							]
						},
						{
							numbering: '',
							title: `We use your Personal Information to the extent necessary to comply with the requirements of the law and legal process, 
							such as a court order; to comply with a legal obligation; or to prevent imminent harm to public security, safety or order.`,
							items: []
						},
						{
							numbering: '',
							title: `We use your Non-Personal Information for statistical, analytical, and research purposes to create anonymous and aggregate reports.`,
							items: []
						},
						{
							numbering: '',
							title: `When required by our Privacy Policy and the law and before we use or process your Customer Data for any other purpose, we will ask for your consent.`,
							items: []
						},
						{
							numbering: '',
							title: `We outsource or contract the processing of Customer Data to third parties, such as but not limited to, payment gateways, 
							fraud systems, vendors, service providers, partners or other platform operators, to fulfill any of the above purposes.
							They are only authorized to use Customer Data for such contracted purposes. They may have access to Customer Data for a
							limited time under reasonable contractual and technical safeguards to limit their use of such information. We require them
							to protect Customer Data consistent with our Privacy Policy.`,
							items: []
						},
					]
				},
				{
					title: '4. Disclosure of Your Information',
					contents: [
						{
							numbering: '1',
							title: `In addition to the other disclosures described in this policy, We may (and you authorize us to) share or disclose 
							Personally Identifiable Information about you to other companies or individuals in the following situations:`,
							items: [
								{
									numbering: '1',
									title: `We utilize third party service providers to provide products, services or functions on our behalf 
									(such as sending emails or processing credit cards or fulfilling subscriptions), and ask these service providers
									to agree to maintain the confidentiality of your Personally Identifiable Information and not to use your
									Personally Identifiable Information for any reason except to carry out the purpose(s) for which we hired them.
									( <b>"Service Provider Exception"</b>)`,
									items: []
								},
								{
									numbering: '2',
									title: `You have entered a promo or a contest sponsored by a third party, in which case the information you provide 
									via the promo/contest may be shared by us with that third party for their use in their discretion, including direct marketing.
									Some of our promos and contests will ask you at the time of entry whether you would like to have your
									personal information shared with the sponsor, in which case we will honor your selection. Other contests
									will not give you that option and in that event, if you do not want your information to be shared,
									you should not enter the contest. The privacy policies of such third party companies apply to their use
									and disclosure of your information that we collect and disclose to such third party companies.`,
									items: []
								},
								{
									numbering: '3',
									title: `The entity to whom the information is disclosed is our affiliate.`,
									items: []
								},
								{
									numbering: '4',
									title: `In accordance with your indicated preferences (e.g., you indicated you wanted to receive 
									promotional materials directly from a third party partner).`,
									items: []
								},
								{
									numbering: '5',
									title: `The entity is a third party who wants to promote goods and services we think would be of interest to you.`,
									items: []
								},
								{
									numbering: '6',
									title: `You have furnished us Personally Identifiable Information with the intent that it be forwarded to a third party 
									for use in connection with a specified service you are electing to participate in (examples include,
									without limitation, e-commerce partners, online contest partners, services to help old friends locate you online, etc.)`,
									items: []
								},
								{
									numbering: '7',
									title: `We may be legally required to disclose your Personally Identifiable Information, if such disclosure is 
									(a) required subpoena, law, or other legal process;
									(b) necessary to assist law enforcement officials or government enforcement agencies;
									(c) necessary to investigate violations of or otherwise enforce our Legal Terms;
									(d) necessary to protect us from any legal action or claims from third parties including you and/or other Members; and/or
									(e) we have reason to believe that it is necessary for protection from someone who may be causing injury to someone
									or interfering with our rights or the rights of our users, employees, our affiliates, and the general public,
									or using our services in violation of a legal or personal right, including our Terms of Use (collectively, <b>"Legal Exceptions"</b>).`,
									items: []
								},
								{
									numbering: '8',
									title: `In connection with a sale, merger, transfer, exchange, or other disposition (whether assets, stock, 
									or otherwise, including via bankruptcy) of all or a portion of the business conducted by our site to which
									this policy applies, in which case the company will possess the Personally Identifiable Information collected by us
									and will assume the rights and obligations regarding your Personally Identifiable Information as described in this
									Privacy Policy (collectively, <b>"Acquisition Exception"</b>).`,
									items: []
								},
							]
						},
						{
							numbering: '2',
							title: `<b>Social Networks.</b> If you use your login credentials from a social networking site (e.g. Facebook or Twitter) (collectively, "SNS") 
							on our Site, we may receive information from such SNS in accordance with the terms and conditions (e.g., terms of use and privacy policy)
							of the SNS ("SNS Terms"). If you elect to share your information with these SNS, we will share information with them in
							accordance with your election. The SNS Terms of the SNS will apply to the information we disclose to them.`,
							items: []
						},
						{
							numbering: '3',
							title: `<b>Third Party Partners.</b> Our site may from time to time partner with a retailer or other third party 
							to offer online shopping opportunities, games, services, subscriptions, and other applications on a co-branded or
							cross-promotional basis. Those transactions may take place on our Site, or the site of the third party.
							In either case, Personally Identifiable Information you provide in connection with the transaction may be collected directly by,
							or shared by our Site with, the third party, as well as with any participating sponsor or advertisers of such opportunities and features.
							Our site may offer you the ability to access a third-party site with whom we have a relationship to access both sites through
							a co-branded registration process; in that event, your applicable registration information may be collected directly by,
							or shared by our Site with, the third party partner. These third parties will use your information in accordance with their own privacy policy.`,
							items: []
						},
						{
							numbering: '4',
							title: `<b>Delivery of Advertising and Other Content.</b> In addition to ads and content that we serve you directly, 
							we use third party advertising companies and marketing services companies to serve ads and other content when you visit our Site.
							Both we and these companies may use information about your visits to this site and elsewhere to serve ads and other content to you.
							In the course of doing so, a unique third-party Cookie may be placed or recognized on your browser by such companies.`,
							items: []
						},
					]
				},
				{
					title: '5. Right to Opt-out',
					contents: [
						{
							numbering: '1',
							title: `<b>Email Policy.</b> We and our affiliates and partners fully comply with national laws regarding SPAM. 
							If you wish to opt out our email services, you may do so by following the unsubscribe instructions in the email you received.
							We agree that we will not sell, rent, or trade your email address to any unaffiliated third-party partners without your permission.`,
							items: []
						},
						{
							numbering: '2',
							title: `<b>User Registration.</b> You may elect to change the details of your user registration at any time by logging in and editing your 
							User Profile. If you wish to cancel or delete your User Registration, you may contact us below.
							Please take note that when we delete any information, it will be deleted from the active database, but may retain in our archives.
							We may retain your information for fraud or similar purposes.`,
							items: []
						},
						{
							numbering: '3',
							title: `<b>Exceptions.</b> If you have opted-out as described above, and thereafter you elect to use a service or 
							promotion that requires us to contact you or share your information with a third party (e.g., you enter a promo or a contest),
							then your previous opt-out preferences will not apply to such service. Despite your indicated preferences, we may send you
							service related communications, including notices about your subscription, and we may continue disclosing your information
							to third parties under the Service Provide Exception, Legal Exception, and Acquisition Exception described above.`,
							items: []
						},
					]
				},
				{
					title: '6. Protection of Customer Data',
					contents: [
						{
							numbering: '',
							title: `We respect your privacy. We take paramount care in protecting your Customer Data. As such, we secure and protect your 
							Customer Data with proper safeguards to ensure confidentiality and privacy; prevent loss, theft, or use for unauthorized purposes;
							and comply with the requirements of the law.`,
							items: []
						},
						{
							numbering: '',
							title: `As communications over the internet may not be secure, we make reasonable and appropriate security arrangements and measures 
							that use a variety of physical, electronic, and procedural safeguards to protect Customer Data. For example,
							we protect and keep your information submitted through our website safe using a secured server behind a firewall,
							encryption, and other appropriate security controls. When you enter your information through our website, we encrypt
							that information using Secure Sockets Layer technology (SSL) so that it cannot be read as the information travels over the internet.
							We regularly review our information collection, storage, and processing practices, including physical security measures,
							to guard against unauthorized access to our system and unauthorized alteration, disclosure, or destruction of information we hold.`,
							items: []
						},
						{
							numbering: '',
							title: `We only permit your Customer Data to be accessed or processed by our authorized personnel who hold such information under 
							strict confidentiality. We restrict access to information to our employees, contractors, and agents who need to know such information
							in order to process it for us, who are subject to strict contractual and technical safeguards and are accountable if they fail to meet these.`,
							items: []
						},
						{
							numbering: '',
							title: `Furthermore, we only give you or your authorized representative access to your Personal Information. 
							We do not sell your Personal Information to anyone for any purpose. We also do not use nor share your Personal Information
							with content and/or information providers without your prior request or consent. Personal Information will
							only be disclosed to third parties in accordance with this Privacy Policy.`,
							items: []
						},
						{
							numbering: '',
							title: `We keep our records as accurate as possible. If your Personal Information is wrong, we give you ways to update it. 
							Once you have registered as our customer, you may access your account details and correct your Personal Information by visiting our website.`,
							items: []
						},
						{
							numbering: '',
							title: `We keep your Personal Information in our business records, as may be applicable, while you are a customer, 
							or as long as it is necessary to fulfill the purpose for which it was collected, or while it is needed by us for business,
							tax, or legal purposes. When disposing of your Personal Information, we take reasonable measures to ensure that it is done properly
							and is not accessible to the public.`,
							items: []
						},
						{
							numbering: '',
							title: `We are not responsible for information, content, application, product or service that we do not provide. 
							But because we care for you and protect you, we take measures to fight spam, fraud or any unauthorized transaction that traverse our network.`,
							items: []
						},
					]
				},
				{
					title: '7. Contact Us',
					contents: [
						{
							numbering: '',
							title: `For any questions or concerns, you may contact our office as follows:`,
							alignCenter: false,
						},
						{
							numbering: '',
							title: `Email: <b>shop@columbiasportswear.ph</b>`,
							alignCenter: false,
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
