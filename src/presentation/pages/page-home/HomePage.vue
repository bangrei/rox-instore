<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con default">
					<div class="header-wrapper">
						<div class="header-logo-con left">
							<img
								width="35"
								height="35"
								alt="rox logo"
								:src="require('@/assets/images/rox-logo-2025.jpeg')"
							/>
						</div>
						<base-store-header v-if="isDesktop"
                            @store-changed="storeChanged()"
                            :show-content="isDesktop"
                            :show-label="false"
                            :is-desktop="isDesktop"
                        ></base-store-header>
					</div>
					<div class="header-wrapper centered">
						<base-desktop-nav :no-search="true"></base-desktop-nav>
					</div>
					<div class="header-wrapper">
						<base-header-nav :no-search="true"></base-header-nav>
					</div>
				</div>
				<base-store-header v-if="!loading"
                    @store-changed="storeChanged()"
                    :show-content="!isDesktop"
                    :show-label="false"
                    :is-desktop="isDesktop"
                ></base-store-header>
			</div>
		</template>
		<template v-slot:body>
			<widget-reward-badge v-if="showContent"/>
			<div class="parent-container" v-if="showContent">
				<!--
				<div class="events__container">
					<div class="events__title">
						<span class="title">Outlet Curation</span>
						<span class="anchor">See all</span>
					</div>
					<div class="events__subtitle">What's trending</div>
				</div>
				-->
				<div class="events__container">
					<div class="events__title">
						<span class="title">Events</span>
						<span class="anchor" @click="goTo('EventsPage')">See all</span>
					</div>
					<div class="events__subtitle">Upcoming events</div>
					<event-card ref="eventCard" v-if="!isEmpty(upcomingEvents)" :events="upcomingEvents" :emitEvent="true" @event-clicked="clickEventDetails"></event-card>
				</div>
				<div class="events__container">
					<div class="events__title">
						<span class="title">Shop</span>
						<span class="anchor" @click="goToShop()">See all</span>
					</div>
					<div class="events__subtitle">Top selling products {{ atStoreName }}</div>
					<product-grid ref="productGrid" :products="products" :more-button="false" :in-line="true"></product-grid>
				</div>
				<div class="events__container">
					<div class="events__title">
						<span class="title">Feeds</span>
						<span class="anchor" @click="goTo('FeedPage')">See all</span>
					</div>
					<div class="events__subtitle">Be inspired by our knowledge Hub</div>
					<div class="nudges">
						<home-nudge-card
							v-for="nudge in filterNudges"
							:key="nudge.id"
							:nudge="nudge"
							@nudge-clicked="nudgeClicked"
						>
						</home-nudge-card>
						<div class="button" @click="goTo('FeedPage')">Read More</div>
					</div>
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<base-footer-nav></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import { eventService, homeService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import WidgetRewardBadge from '@/components/widgets/WidgetRewardBadge.vue';
import { addFavorite, unFavorite } from "@/connector/v4/productConnector";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
import { nextTick } from "vue";
import EventCard from '../page-events/components/EventCard.vue';
import ProductGrid from "../page-store/components/ProductGrid.vue";
import HomeNudgeCard from "./components/HomeNudgeCard.vue";
import initData from "@/init";

export default {
	name: "HomePage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		HomeNudgeCard,
		ProductGrid,
		EventCard,
		WidgetRewardBadge,
	},
	data() {
		return {
			customer: {},
			loading: false,
			showContent: false,
			upcomingEvents: [],
			nudges: [],
			products: [],
			isDesktop: true,
			serverInited: false,
			isDestroyed: false,
		};
	},
	watch: {
		// TODO: plenty of hack to make sure this work, usage of @hook:mounted, find a better way
		// https://dev.to/the_one/8-secrets-vue-developers-must-know-5la#how-to-know-if-a-child-component-is-mounted-
		"customer.points"(val) {
			if (val > 0) this.setCompletionPointsAnimation();
		},
	},
	computed: {
		welcomeMessage() {
			let name = !isEmpty(this.customer)
				? this.customer.firstName[0].toUpperCase() +
				  this.customer.firstName.substring(1).toLowerCase()
				: "";
			return `${homeService.getDayGreeting()}, ${name}`;
		},
		filterNudges(){
			return this.nudges.filter((n) => {
				return n.state != "READ";
			}).sort((a,b) => { return a.published - b.published }).splice(0, 3);
		},
		atStoreName(){
			let currentOutlet = this.$store.getters.getCurrentOutlet;
			if(isEmpty(currentOutlet)) return;
			return `at ${currentOutlet.name}`;
		}
	},
	methods: {
		async storeChanged(){
			try {
				this.loading = true;
				await this.refreshMainData(true);
				await this.initHomePage();
				this.$refs.productGrid.setCurrentProducts();
				this.loading = false;
			} catch (error) {
				this.loading = false;
				this.showNotification("alert", "error_outline", error);
			}
		},
		goToShop(){
			let outlet = this.$store.getters.getCurrentOutlet;
			let apiCode = isEmpty(outlet) ? -1 : outlet.apiCode;
			this.goToWithParams('ShopPage', {
				outlet: apiCode
			});
		},
		clickEventDetails(event) {
			let categorySlugs = !isEmpty(event.categories) ? event.categories[0].replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.filter((it) => it !== "").map((it) => it.toLowerCase()).join('-') : "-";
			let eventSlugs = event.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.filter((it) => it !== "").map((it) => {
				if (it.toUpperCase() == it) return it;
				return it.toLowerCase();
			}).join('-');
			this.$router.push({
				name: "EventDetails",
				params: {
					eventId: event.id,
					category: categorySlugs,
					eventName: eventSlugs,
				},
			});
		},
		prdImage(prd){
			let id = prd.imageId;
			if(!id) id = prd.imageId2;
			if(!id) id = prd.imageId3;
			if(id) return this.getImage(id);
		},
		getPrice(prd){
			let price = prd.price;
			if(!isEmpty(prd.variants)){
				let variant = prd.variants.sort((a,b) => { return a.price - b.price });
				price = variant.price;
			}
			return this.currency(price);
		},
		setCustomerDetail() {
			this.customer = this.$store.getters.getCustomer;
		},
		async setCompletionPointsAnimation() {
			// show/hide points on scroll (only on mounted hook);
			await nextTick();
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("show-canopy");
					} else {
						entry.target.classList.remove("show-canopy");
					}
				});
			});

			let element = this.$refs.canopy;
			if (element) observer.observe(element);
		},
		isFavorite(productId){
			return this.isFavoriteProduct(productId)
		},
		async clickFavorite(prd){
			try {
				let idx = this.products.findIndex((it) => {
					return it.id == prd.id;
				});
				if(idx == -1) return;
				if(prd.favorite){
					let res = await unFavorite(prd.id);
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("unFavorite", prd.id);
					this.products[idx].favorite = false;
				} else {
					let res = await addFavorite(prd.id);
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("addFavorite", prd.id);
					this.products[idx].favorite = true;
				}
			} catch (error) {
				this.showNotification("warning", "error_outline", error);
			}
		},
		nudgeClicked(nudge) {
			let pageToGo = "";
			switch (nudge.type) {
				case "QUESTIONNAIRE":
					pageToGo = "SurveyPage";
					break;
				case "ARTICLE":
					pageToGo = "ArticlePage";
					break;
				case "SURPRISE":
					pageToGo = "SurprisePage";
					break;
			}

			if (pageToGo) {
				this.$router.push({
					name: pageToGo,
					params: {
						nudgeId: nudge.id,
					},
				});
			}
		},
		async initHomePage() {
			let products = this.$store.getters.getProducts.filter((it) => { return it.available });
			if (!isEmpty(products)) {
				products.sort((a,b) => { return a.sortIndex - b.sortIndex });
				this.products = products.splice(0,10);
				this.products.forEach((it) => {
					it.imageDisplay = this.prdImage(it);
					it.favorite = it.favorite || this.isFavorite(it.id);
				});
			}
			await this.retrieveEvents();
			let allNudges = [];
			let callAPI = true;
			if (!this.serverInited) {
				let json = initData["nudgesData"] ? initData["nudgesData"] : {};
				if (!isEmpty(json) && json.success) {
					callAPI = false;
					allNudges = json.nudges;
				}
			}
			if (callAPI) allNudges = await homeService.getAllNudges();
			this.nudges = homeService.getValidNudges(allNudges);
		},
		async retrieveEvents() {
			let json = {};
			let callAPI = true;
			if (!this.serverInited) {
				let json = initData["eventsData"] ? initData["eventsData"] : {};
				if (!isEmpty(json) && json.success) {
					callAPI = false;
				}
			}
			if (callAPI) json = await eventService.getEvents();
			if (!isEmpty(json) && !isEmpty(json.events)) {
        let momente = moment();
				let userCoords = this.getCurrentLocation();
				const hiddenEvents = this.$store.getters.getHiddenEvents || [];
				let events = json.events.map((it) => {
					let iszero = moment.tz(it.startDate, 'Asia/Singapore').format("HH:mm") == "00:00";
					let format = "ddd, DD MMM YYYY HH:mm";
					if (iszero) format = "ddd, DD MMM YYYY";
					it.startDisplay = moment.tz(it.startDate, 'Asia/Singapore').format(format);
					it.place = "";
					it.spotLeft = 0;
					it.price = 0;
					it.sessions.map((s) => {
						s.distance = null;
						if (!isEmpty(userCoords) && !isEmpty(s.coord)) {
							let radlat1 = Math.PI * userCoords.lat / 180;
							let radlat2 = Math.PI * s.coord.lat / 180;
							let theta = userCoords.lng - s.coord.lng;
							let radtheta = Math.PI * theta / 180;
							let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
							if (dist > 1) dist = 1;
							dist = Math.acos(dist);
							dist = dist * 180 / Math.PI;
							dist = dist * 60 * 1.1515;
							dist = parseFloat(dist * 1.609344).toFixed(2) //in Kilometers
							s.distance = dist;
						}
						return s;
					}).sort((a, b) => { return a.distance - b.distance });
					it.distance = null;
					if (!isEmpty(it.sessions.filter((s) => { return s.distance != null }))) {
						let one = it.sessions.filter((s) => { return s.distance != null })[0];
						it.distance = one.distance;
					}
					if (!isEmpty(it.sessions)) {
						let todayMonth = parseInt(moment.tz(momente, "Asia/Singapore").format('YYYYMM'));
						let activeSessions = it.sessions.filter((ss) => {
							let endMonth = parseInt(moment.tz(ss.endDate, "Asia/Singapore").format("YYYYMM"));
							return ss.status == "ACTIVE" && endMonth >= todayMonth;
						});
						it.hasActiveSessions = !hiddenEvents.includes(it.id) && !isEmpty(activeSessions);
						if (it.hasActiveSessions) {
							let iszero = moment.tz(activeSessions[0], 'Asia/Singapore').format("HH:mm") == "00:00";
							if (iszero) format = "ddd, DD MMM YYYY";
							else format = "ddd, DD MMM YYYY HH:mm";
							activeSessions.sort((a, b) => a.startDate - b.startDate);
							it.startDate = activeSessions[0].startDate;
							it.endDate = activeSessions[0].endDate;
							it.price = activeSessions[0].price;
							it.startDisplay = moment.tz(activeSessions[0].startDate, 'Asia/Singapore').format(format);

							it.place = activeSessions[0].location.string;
							activeSessions.forEach((s) => {
								it.spotLeft += parseFloat(s.spotLeft);
							});
						}
					}
					return it;
				}).filter((it) => it.hasActiveSessions);
				this.upcomingEvents = events?.sort((a, b) => {
					if (a.distance == b.distance) {
						if (a.sortIndex == b.sortIndex) return a.startDate - b.startDate;
						return a.startDate - b.startDate;
					}
					if (a.sortIndex == b.sortIndex) return a.startDate - b.startDate;
					return a.startDate - b.startDate;
				});
			}
		},
	},
	async created() {
		try {
			this.isDestroyed = false;
			this.serverInited = this.$store.getters.isServerInited;
			this.isDesktop = window.innerWidth >= 672;
			window.addEventListener('resize', () => {
				this.isDesktop = window.innerWidth >= 672;
			});
			this.loading = true;
			this.showContent = false;
			if(!this.isLoggedIn()) {
				return this.goTo('LoginPage');
			}
			await this.refreshMainData();
			await this.initHomePage();
			this.showContent = true;
			this.loading = false;
		} catch (error) {
			this.feedNavs = [];
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
	beforeUnmount() {
		this.isDestroyed = true;
		this.upcomingEvents = [];
	}
};
</script>

<style scoped lang="scss">
	.events {
		&__container {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 16px;
			text-align: left;
			padding: 24px 0px;
		}
		&__title {
			width: 100%;
			display: flex;
			justify-content: space-between;
			padding: 0px 24px;

			.title {
				font-family: 'Berthold Akzidenz Grotesk Medium';
			}
			.anchor {
				font-weight: bold;
				color: $primary-color-60;
				cursor: pointer;
			}
		}
		&__subtitle {
			padding: 0px 24px;
			color: $secondary-color-50;
			font-family: 'Berthold Akzidenz Grotesk Medium';
		}
	}
	.cards {
		display: flex;
		width: 100%;
		overflow-x: auto;
		position: relative;
		padding: 24px;
		padding-top: 0;

		.card {
			border-radius: 5px;
			background: $white;
			min-width: 200px;
			max-width: 200px;
			overflow: hidden;
			cursor: pointer;
			-webkit-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
			-moz-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
			-o-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
			box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);

			.card-img {
				width: 100%;
				height: 100px;
				background: $secondary-color-20;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}

			.card-content {
				padding: 16px;
				color: $secondary-color-90;

				.card-more-title {
					color: $primary-color-60;
					font-weight: bold;
					text-align: center;
				}

				.card-subtitle {
					color: $primary-color-60;
					font-size: 0.8em;
				}

				.card-title {
					font-weight: bold;
					width: 100%;
					display: block;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					color: $secondary-color-100;
					font-family: 'Berthold Akzidenz Grotesk Medium';
				}
				.card-price {
					font-family: 'Berthold Akzidenz Grotesk Medium';
					display: block;
					width: 100%;
					padding: 8px 0;
					color: $secondary-color-90;
					font-size: 1em;
				}
				.card-desc {
					color: $secondary-color-90;
					font-size: 0.9em;
				}
				.card-note {
					font-size: 0.8em;
					color: $secondary-color-50;
					white-space: nowrap;
					display: block;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.card-footnote {
					font-size: 0.7em;
					color: $secondary-color-90;
					display: flex;
					align-items: center;

					.material-icons {
						font-size: 1.4em;
					}

					* + * {
						margin-left: 4px;
					}
				}
			}

			& + * {
				margin-left: 26px;
			}
		}
	}
	.nudges {
		width: 100%;
		padding: 16px 24px;
		padding-top: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.button {
		width: 100%;
		padding: 16px 40px;
		background: $primary-color-60;
		color: $white;
		cursor: pointer;
		border-radius: 12px;
		text-align: center;
		font-family: 'Berthold Akzidenz Grotesk Medium';
	}
	@media (min-width: 672px) {
		.parent-container {
			padding-top: 48px;
		}
		.events {
			&__title {
				padding: 0px 7% !important;
			}
			&__subtitle {
				padding: 0px 7% !important;
			}
		}
		.cards {
			display: flex;
			width: 100%;
			overflow-x: auto;
			position: relative;
			padding: 24px 7% !important;
			padding-top: 0 !important;
		}
		.nudges {
			padding: 16px 7% !important;
			padding-top: 0 !important;

			.button {
				width: fit-content;
				max-width: 400px;
				margin: 0 auto;
				background-color: transparent;
				color: $primary-color-60;
				border: 1px solid $primary-color-60;
			}
		}
	}
</style>
