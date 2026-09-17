<template>
	<layout-variant-two :show-loading-screen="loading" active-menu-index="4">
		<template v-slot:body>
			<div class="feed-banner">
				<span>{{ tagId }}</span>
			</div>
			<div class="feed-anchors">
				<h1>Browse by Tags</h1>
				<button type="button">More <i class="material-icons-outlined">chevron_right</i></button>
			</div>
			<div class="feeds" v-if="showFeeds">
				<div class="feed"
					v-for="(feed) in feedNavs" 
					:key="feed.id"
					@click="handleFeedClick(feed)">
					<span class="feed-label">{{ feed.name }}</span>
				</div>
			</div>
			<div class="feeds-divider" v-if="showFeeds"></div>
			<div class="feed-empty">
				<home-empty-nudge
					v-if="allNudgesRead && !loading && showFeeds"
					heading="Congrats"
					subHeading="You have read all the messages."
					message="Come back for more or click the above categories to read again."
				/>
			</div>
			<div class="feeds-main-content">
				<div class="feeds-filter-con">
					Filter & Sort
					<base-accordion ref="accordionSortBy" accordion-title="Sort By" accordion-dark-header="true">
						<div class="checkbox-wrapper">
							<div class="checkbox checkbox-circle" @click="setSortBy('nameAsc')">
								<input type="checkbox" :checked="sortBy == 'nameAsc'">
								<span class="checkbox-label">Name (ASC)</span>
							</div>
							<div class="checkbox checkbox-circle" @click="setSortBy('nameDesc')">
								<input type="checkbox" :checked="sortBy == 'nameDesc'">
								<span class="checkbox-label">Name (DESC)</span>
							</div>
							<div class="checkbox checkbox-circle" @click="setSortBy('pointsHighest')">
								<input type="checkbox" :checked="sortBy == 'pointsHighest'">
								<span class="checkbox-label">Points (Highest)</span>
							</div>
							<div class="checkbox checkbox-circle" @click="setSortBy('pointsLowest')">
								<input type="checkbox" :checked="sortBy == 'pointsLowest'">
								<span class="checkbox-label">Points (Lowest)</span>
							</div>
						</div> 
					</base-accordion>
					<base-accordion ref="accordionTags" accordion-title="Tags" accordion-dark-header="true">
						<div class="checkbox-wrapper">
							<div class="checkbox" v-for="(feed, i) in feedNavs"  :key="i">
								<input type="checkbox" :checked="isSelectedTag(feed.name)" @click="clickTag(feed.name)">
								<span class="checkbox-label">{{ feed.name }}</span>
							</div>
						</div> 
					</base-accordion>
					<base-accordion ref="accordionType" accordion-title="Type" accordion-dark-header="true">
						<div class="checkbox-wrapper">
							<div class="checkbox checkbox-circle" @click="setFilterType('ARTICLE')">
								<input type="checkbox" :checked="filterType == 'ARTICLE'">
								<span class="checkbox-label">Article</span>
							</div>
							<div class="checkbox checkbox-circle" @click="setFilterType('SURPRISE')">
								<input type="checkbox" :checked="filterType == 'SURPRISE'">
								<span class="checkbox-label">Surprise</span>
							</div>
							<div class="checkbox checkbox-circle" @click="setFilterType('QUESTIONNAIRE')">
								<input type="checkbox" :checked="filterType == 'QUESTIONNAIRE'">
								<span class="checkbox-label">Survey</span>
							</div>
						</div> 
					</base-accordion>
				</div>
				<div class="nudge-card-con" v-if="showFeeds" :class="{'blurred-data': loadingData}">
					<div class="filter-results">
						<span>{{ validNudges.length }} feeds</span>
						<div class="nudges-filter">
							<button 
								@click="clearSortFilter"
								v-if="showClearAll"
								class="filter-item outlined"
							>Clear all</button>
							<button @click="setFilterType('')"
								v-if="filterType"
								class="filter-item"
							>{{ filterTypeDisplay }} <i class="material-icons">cancel</i></button>
							<button @click="clickTag(tag)"
								v-for="(tag, ix) in selectedTags" 
								:key="ix"
								class="filter-item"
							>{{ tag }} <i class="material-icons">cancel</i></button>
						</div>
					</div>
					<div class="loading-data-con" v-if="loadingData">
						<div class="loading-data">
							<div class="dot-loading"></div>
							<p class="body-2-regular bold loading-text primary-color-70">
								Loading ...
							</p>
						</div>
					</div>
					<div class="nudge-column" v-if="!isEmpty(validNudges)">
						<home-nudge-card
							v-for="nudge in validNudges" :key="nudge.id"
							:nudge="nudge"
							@nudge-clicked="nudgeClicked"
						/>
					</div>
					<div v-else class="">Not found...</div>
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="3"></base-footer-nav> -->
			<base-side-nav v-if="!loading" :active-index="4"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import HomeNudgeCard from "./components/HomeNudgeCard.vue";
import HomeEmptyNudge from "./components/HomeEmptyNudge.vue";
import { isEmpty } from "lodash";
import { homeService } from "@/bloc/services";
import utility from "@/presentation/mixins/utility.js";
import { nextTick } from "vue";

export default {
	name: "FeedDetailsPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		HomeNudgeCard,
		HomeEmptyNudge,
	},
	data() {
		return {
			nudges: [],
			selectedTagNames: [],
			customer: {},
			loading: false,
			isForYou: false,
			isDesktop: false,
			tagId: "",
			feedNavs: [
				{
					id: 0,
					name: "Gear Guides",
					icon: "backpack",
					isActive: true,
				},
				{
					id: 1,
					name: "Skills",
					icon: "hardware",
					isActive: false,
				},
				{
					id: 2,
					name: "Checklists",
					icon: "checklist",
					isActive: false,
				},
			],
			activeFeed: null,
			activeFooterNavId: 1,
			loadingData: false,
			scrollTop: 0,
			validNudges: [],
			sortBy: "",
			selectedTags: [],
			filterType: "SURPRISE"
		};
	},
	watch: {
		// TODO: plenty of hack to make sure this work, usage of @hook:mounted, find a better way
		// https://dev.to/the_one/8-secrets-vue-developers-must-know-5la#how-to-know-if-a-child-component-is-mounted-
		"customer.points"(val) {
			if (val > 0) this.setCompletionPointsAnimation();
		},
		"activeFeed"(){
			this.retrieveNudges();
		}
	},
	computed: {
		showClearAll(){
			if(!isEmpty(this.selectedTags)) return true;
			if(this.filterType) return true;
			return false;
		},
		filterTypeDisplay(){
			switch(this.filterType){
				case "ARTICLE": return "Article";
				case "SURPRISE": return "Surprise";
				case "QUESTIONNAIRE": return "Survey";
			}
			return "";
		},
		showFeeds(){
			return this.activeFooterNavId == 1;
		},
		welcomeMessage() {
			let name = !isEmpty(this.customer)
				? this.customer.firstName[0].toUpperCase() +
				  this.customer.firstName.substring(1).toLowerCase()
				: "";
			return `${homeService.getDayGreeting()}, ${name}`;
		},
		allNudgesRead() {
			return isEmpty(this.nudges.filter((it) => it.status == "NOT_READ"));
		},
	},
	methods: {
		nudgeEligiblePoints(nudge) {
			let points = 0;
			if(nudge.status != 'READ'){
				points = nudge.type == "QUESTIONNAIRE" ? nudge.completionPoints : nudge.readingPoints;
			}
			return points;
		},
		setSortBy(value){
			this.sortBy = value;
			this.setValidNudges();
		},
		isSelectedTag(tag){
			return this.selectedTags.includes(tag);
		},
		clickTag(tag){
			let tags = this.selectedTags;
			if(tags?.includes(tag)) tags = tags?.filter((it) => it != tag);
			else tags.push(tag);
			this.selectedTags = tags;
			this.setValidNudges();
		},
		setFilterType(type){
			if(type == this.filterType) {
				this.filterType = "";
			} else {
				this.filterType = type;
			}
			this.setValidNudges();
		},
		clearSortFilter(){
			this.selectedTags = [];
			this.filterType = "";
			this.sortBy = "";
			this.setValidNudges();
		},
		nudgeColumns(nudges){
			let items = [];
			if(isEmpty(nudges)) return items;
			nudges.forEach((n, i) => {
				let idx = i%3;
				if(!items[idx]) items[idx] = [];
				items[idx].push(n);
			});
			return items;
		},
		handleFeedClick(feed) {
			this.isForYou = false;
			this.feedNavs.map((it) => (it.isActive = false));
			this.activeFeed = feed;
			if (!feed) return;
			this.feedNavs.find((it) => it.id == feed.id).isActive = true;
			this.stateFeed(feed);
			this.setValidNudges();
		},
		stateFeed(feed) {
			this.$store.dispatch("setStateFeedsPage", {
				currentTab: feed || null,
				scrollTop: this.scrollTop,
				scrollLeft: this.scrollLeft,
				isForYou: this.isForYou
			});
		},
		setValidNudges() {
			let result = this.nudges.filter((it) => it.tags.map((tag) => tag.toLowerCase()).includes(this.tagId.toLowerCase()));
			if(!isEmpty(this.selectedTags)){
				result = result.filter((it) => it.tags.filter((tag) => this.selectedTags.includes(tag)).length > 0);
			}
			if(this.filterType){
				result = result.filter((it) => it.type == this.filterType)
			}
			if(!isEmpty(result)){
				switch(this.sortBy){
					case "nameAsc":
						result = result.sort((a,b) => a.name.localeCompare(b.name));
						break;
					case "nameDesc":
						result = result.sort((a,b) => b.name.localeCompare(a.name));
						break;
					case "pointsHighest":
						result = result.sort((a,b) => this.nudgeEligiblePoints(b) - this.nudgeEligiblePoints(a));
						break;
					case "pointsLowest":
						result = result.sort((a,b) => this.nudgeEligiblePoints(a) - this.nudgeEligiblePoints(b));
						break;
					default:
						result = result.sort((a,b) => b.published - a.published);
						break;
				}
			}

			this.validNudges = result;
		},
		handleForYou(){
			this.feedNavs.map((it) => (it.isActive = false));
			this.activeFeed = null;
			this.isForYou = true;
			this.stateFeed();
			this.setValidNudges();
		},
		async retrieveNudges(){
			try {
				this.loadingData = true;
				const allNudges = await homeService.getAllNudges();
				this.nudges = homeService.getValidNudges(allNudges);
				this.loadingData = false;
			} catch (error) {
				this.loadingData = false;
			}
		},
		retrieveTags(){
			let feeds = [];
			let feedState = this.$store.getters.getStateFeedsPage;
			let currentTab = feedState.currentTab;
			let currentScroll = feedState.scrollTop;
			let currentScrollLeft = feedState.scrollLeft;
			let isForYou = feedState.isForYou;
			if(!isEmpty(this.nudges)){
				let tags = [];
				this.nudges.forEach((n) => {
					if(!isEmpty(n.tags)){
						n.tags.forEach((tag) => {
							if(!tags.includes(tag)){
								tags.push(tag);
							}
						});
					}
				});
				tags.sort((a,b) => { return a.localeCompare(b) });
				const icons = [
					"backpack","hardware","dataset","light","view_timeline",
					"room_service","grass","door_front","token","apps"
				];
				
				tags.forEach((tag, index) => {
					const iconIndex = index < icons.length 
						? index
						: index % icons.length;
					feeds.push({
						id: feeds.length,
						name: tag,
						icon: icons[iconIndex],
						isActive: feeds.length == 0
					});
				});
			}
			if (currentTab) {
				let currentFeed = feeds.find((f) => f.id == currentTab.id && f.name == currentTab.name);
				if(currentFeed){
					feeds.map((f) => {
						f.isActive = false;
						if (f.id == currentFeed.id) f.isActive = true;
						return f;
					});
				}
			}
			if (isForYou) {
				feeds.map((it) => it.isActive = false);
				this.isForYou = true;
			}
			this.feedNavs = feeds;
			this.setValidNudges();
			if(isEmpty(this.validNudges)){
				this.filterType = "ARTICLE";
				this.setValidNudges();
			}
			if(isEmpty(this.validNudges)){
				this.filterType = "QUESTIONNAIRE";
				this.setValidNudges();
			}
			this.$refs.accordionType.isClosed = true;
			
			let self = this;
			document.querySelector('.sd-base-con').addEventListener("scroll", (e) => {
				self.scrollTop = e.target.scrollTop;
				let feed = self.feedNavs.find(
					(feed) => feed.isActive
				);
				self.stateFeed(feed);
			});
			document.querySelector('.feeds').addEventListener("scroll", (e) => {
				self.scrollLeft = e.target.scrollLeft;
				let feed = self.feedNavs.find(
					(feed) => feed.isActive
				);
				self.stateFeed(feed);
			});
			if (currentTab) {
				setTimeout(() => {
					document.querySelector('.sd-base-con').scrollTop = currentScroll;
					document.querySelector('.feeds').scrollLeft = currentScrollLeft;
				}, 500);
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
	},
	async created() {
		try {
			this.tagId = this.$route.params.tag;
			this.isDesktop = window.innerWidth >= 672;
			window.addEventListener('resize', () => {
        this.isDesktop = window.innerWidth >= 672;
      });
			this.loading = true;
			this.loadingData = false;
			const allNudges = await homeService.getAllNudges();
			this.nudges = homeService.getValidNudges(allNudges);
			const mandatoryNudge = homeService.getMandatoryNudge(allNudges);
			if (mandatoryNudge) {
				this.$router.push({
					name: "SurveyPage",
					params: {
						nudgeId: mandatoryNudge.id,
					},
				});
			}

			this.$store.dispatch("setNudges", this.nudges);
			if(!this.$store.getters.hasInited) 
				await this.refreshMainData();
			else 
				await this.refreshCustomerData();
			this.setCustomerDetail();
			this.retrieveTags();
			this.loading = false;
		} catch (error) {
			this.feedNavs = [];
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
	.feed-banner {
		width: 100%;
		aspect-ratio: 5/2;
		background: $secondary-color-80;
		margin-top: 16px;
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		max-width: calc(100% - 24px);
		margin-inline: auto;
		color: $white;
		font-size: 24px;
		line-height: 38px;
		text-transform: uppercase;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	}
	.feed-anchors{
		max-width: calc(100% - 24px);
		max-height: 0 !important;
		overflow: hidden;
		margin-inline: auto;
		margin-top: 48px;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		button {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 4px;
			outline: none;
			border-radius: 8px;
			background: $white;
			border: 1px solid $border-color;
			width: 106px;
			height: 42px;
			font-size: 17px;
			line-height: 26px;
			cursor: pointer;
			&:hover {
				border-color: $primary-color-60;
			}
		}
	}
	.feed-empty {
		margin-top: 16px;
		width: 100%;
		max-width: calc(100% - 24px);
		margin-inline: auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	h1 {
		text-align: left;
		font-size: 24px;
		line-height: 38px;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	}
	.feeds-main-content {
		max-width: calc(100% - 24px);
		margin-inline: auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 24px;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		.feeds-filter-con {
			width: 100%;
		}
	}
	.checkbox-wrapper {
		display: flex;
		flex-direction: column;
		background: $white;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid $secondary-color-20;
		max-height: 250px;
		overflow: hidden;
		overflow-y: auto;
		font-family: 'Berthold Akzidenz Grotesk', sans-serif !important;
	}

	.nudge-card-con {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		.filter-results {
			margin-top: 32px;
			width: 100%;
			display: flex;
			align-items: flex-start;
			justify-content: flex-start;
			flex-direction: column;
			text-align: left;
			padding-block: 8px;
			gap: 12px;
		}
		.nudges-filter {
			width: 100%;
			display: flex;
			align-items: center;
			gap: 12px;
			font-family: 'Berthold Akzidenz Grotesk', sans-serif !important;
			.filter-item {
				cursor: pointer;
				height: 32px;
				border-radius: 6px;
				font-size: 15px;
				line-height: 22px;
				border: 1px solid $secondary-color-30;
				background: $secondary-color-20 !important;
				width: fit-content !important;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 4px;
				padding: 3px 9px;
				outline: none;
				font-family: 'Berthold Akzidenz Grotesk', sans-serif;
				&.outlined {
					background: transparent !important;
				}
				.material-icons,
				.material-icons-outlined {
					font-size: 1.1em !important;
				}
			}
		}

		.nudge-column {
			width: 100%;
			display: grid;
			grid-template-columns: 100%;
			gap: 16px;
		}

		&.blurred-data { 
			.nudge-card {
				filter: blur(2px);
				-webkit-filter: blur(2px);
				-moz-filter: blur(2px);
				-o-filter: blur(2px);
			}
		}
	}

	@keyframes iconShake {
		0% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(3deg);
		}
		50% {
			transform: rotate(-3deg);
		}
		75% {
			transform: rotate(1deg);
		}
		90% {
			transform: rotate(-1deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	.feeds {
		padding-block: 16px;
		display: none;
		width: 100%;
		max-height: 0 !important;
		padding-inline: 12px;
		overflow-y: hidden;
		overflow-x: auto;
		align-items: center;
		justify-content: flex-start;
		position: relative;
		gap: 12px;

		.feed {
			min-width: 180px;
			max-width: 180px;
			aspect-ratio: 5/3;
			background: $secondary-color-80;
			border-radius: 8px;
			overflow: hidden;
			padding: 24px 0;
			cursor: pointer;
			font-size: 0.75rem;
			line-height: 0.875rem;
			letter-spacing: 0.025rem;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			color: $white;
			font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
			.material-icons {
				font-size: 16px;
			}
			.feed-label {
				font-size: 18px;
				line-height: 28px;
			}
			&.active {
				background: $primary-color-60;
				color: $border-color;
			}
		}
	}
	.feeds-divider {
		width: 100%;
		position: relative;

		&::before {
			content: "";
			border-bottom: 1px solid #F1F1F1;
			position: absolute;
			left: 0;
			right: 0;
			bottom: 12px;
		}
	}
	.loading-data-con {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;

		.loading-data {
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.loading-text {
				margin-top: 40px;
			}
			.dot-loading {
				position: relative;
				width: 12px;
				height: 12px;
				border-radius: 6px;
				background-color: transparent;
				color: $link-blue-color;
				margin: -1px 0;
				box-shadow: 0 -20px 0 0;
				animation: dotLoading 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
			}

			.dot-loading::before,
			.dot-loading::after {
				content: "";
				display: inline-block;
				position: absolute;
				top: 0;
				left: 0;
				width: 12px;
				height: 12px;
				border-radius: 6px;
				background-color: transparent;
				color: $custom-blue-color;
				box-shadow: 0 -20px 0 0;
			}

			.dot-loading::after {
				color: $alert-base;
			}

			.dot-loading::before {
				animation: dotLoading 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
				animation-delay: 0.3s;
			}

			.dot-loading::after {
				animation: dotLoading 1.5s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
				animation-delay: 0.6s;
			}
		}
	}

	@keyframes dotLoading {
		0% {
			transform: rotateZ(0deg);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}
	@media (min-width: 672px) {
		.feed-banner,
		.feed-anchors,
		.feeds,
		.feed-empty {
			max-width: calc(100% - 40px);
			margin-inline: auto;
			padding-inline: 0 !important;
		}
		.nudge-card-con {
			.nudge-column {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(30%, 1fr)) !important;
			}
		}
		.feeds-main-content {
			flex-direction: row !important;
			max-width: calc(100% - 40px);
			margin-inline: auto;
			.feeds-filter-con {
				min-width: 200px;
				max-width: 200px;
				overflow: hidden;
				text-align: left;
			}
		}
	}
	@media (min-width: 672px) and (max-width: 1024px) {
		.nudge-card-con {
			.nudge-column {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(30%, 1fr)) !important;
			}
		}
		.feeds-main-content {
			flex-direction: column !important;
			.feeds-filter-con {
				min-width: 100%;
				max-width: 100%;
			}
		}
	}
	@media (min-width: 672px) and (max-width: 900px) {
		.nudge-card-con {
			.nudge-column {
				display: grid;
				grid-template-columns: 50% 50% !important;
			}
		}
	}
</style>
