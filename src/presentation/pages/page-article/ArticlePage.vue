<template>
	<layout-variant-two :show-main-logo="!isDesktop" :show-loading-screen="loading">
		<template v-slot:body>
			<div class="page__main">
				<div class="page__main__header" v-if="!loading">
					<div class="page__main__header__tags" v-if="!isEmpty(article)">
						<span class="page__main__header__tags__item bold">Article</span>
						<span class="page__main__header__tags__item">{{ article.name }}</span>
					</div>
				</div>
				<div class="page__header">
					<div class="page__header__title" v-html="htmlLinebreak(article.articleDetail?.title)"></div>
					<div class="page__header__desc" v-html="htmlLinebreak(article.description)"></div>
					<div
						:class="[
							isEmpty(article.images)
								? 'page__header__no--image'
								: 'page__header__image',
						]"
					>
						<img class="custom-ratio" v-if="!isEmpty(article.images)" :src="getImageDisplay(article.images[0])" :alt="article.name">
					</div>
				</div>
				<div class="page__content__wrapper" :class="{'empty-article': noArticle}">
					<!-- <div class="page__content__title">
						<div v-html="htmlLinebreak(article.articleDetail?.title)"></div>
					</div> -->
					<div
						class="page__content__con"
						v-for="(body, index) in article.articleDetail?.bodies"
						:key="index"
					>
						<div class="page__content__html__con">
							<img
								v-if="body.image !== null"
								:src="getImageDisplay(body.image)"
								alt="article image"
							/>
							<div
								class="page__content__html"
								v-html="htmlLinebreak(body.content)"
							></div>
						</div>
						<template
							v-if="
								this.$store.getters.isLoggedIn &&
								index ==
									article.articleDetail?.bodies.length - 1
							"
						>
						</template>
					</div>
					<template v-if="article.externalLink">
						<base-button
							btnLabel="Go to link"
							isRightIcon
							iconName="chevron_right"
							:isFullWidth="true"
							class="sd-btn-primary sd-btn-lg body-1-normal medium"
							@click="goToExternalLink(article.externalLink)"
						/>
					</template>
				</div>
				<div class="points-tooltip" v-if="article.readingPoints > 0">
					<div class="points-icon">
						<i class="material-icons-outlined">check_circle</i>
					</div>
					<div class="points-tooltip-content">
						<label>You've Earned Points!</label>
						<small>{{ article.readingPoints }} Points Added - Thanks for Reading!</small>
					</div>
				</div>
				<div class="read-tracker" ref="readTracker"></div>
				<read-more v-if="!this.$store.getters.isLoggedIn"></read-more>
				<template v-else>
					<div
						class="linked-nudge-con"
						v-if="
							allNudges &&
							article &&
							isPartOfLinkedNudges(article, allNudges)
						"
					>
						<linked-nudges
							title="Awesome! Now, earn more points by completing the series."
							:nudges="allNudges"
							:currentNudge="article"
						/>
					</div>
					<div class="latest-article-con" v-if="latestArticle.id">
						<p class="heading-4 bold">You Might Also Like</p>
						<div class="nudge-con">
							<home-nudge-card v-for="nudge in suggestedNudges"
								:key="nudge.id"
								:nudge="nudge"
							/>
						</div>
					</div>
					<BrowseByTags :feedNavs="feedNavs"/>
				</template>
			</div>
		</template>
	</layout-variant-two>
</template>

<script>
import { homeService } from "@/bloc/services";
import {
	getArticleNudge,
	getShareToken,
	getUnselectedLatestArticle,
	updateArticle,
	updateStatus,
} from "@/bloc/services/articleService";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import { getImage } from "@/connector/imageConnector.js";
import LinkedNudges from "@/presentation/components/LinkedNudges.vue";
import utility, { goTo } from "@/presentation/mixins/utility.js";
import HomeNudgeCard from "../page-feeds/components/HomeNudgeCard.vue";
import ReadMore from "./components/ReadMore.vue";
import { isEmpty } from "lodash";
import BrowseByTags from "../page-feeds/components/BrowseByTags.vue";

export default {
	name: "ArticlePage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		LinkedNudges,
		ReadMore,
		HomeNudgeCard,
		BrowseByTags
	},
	props: {
		nudgeId: {
			type: String,
			default: "",
		},
		shareToken: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			article: {},
			latestArticle: {},
			allNudges: [],
			screenPercentage: 0,
			loading: false,
			isDesktop: true,
		};
	},
	computed: {
		filteredArticleTags() {
			return this.article?.tags?.filter(
				(it) => !it.toLowerCase().includes("nudge_")
			);
		},
		noArticle() {
			return !this.loading && isEmpty(this.article);
		},
		feedNavs(){
			return this.filteredArticleTags?.map((tag, index) => {
				return {
					id: index,
					name: tag
				}
			})
		},
		suggestedNudges(){
			let suggestions = [];
			if(this.latestArticle?.id) suggestions = [this.latestArticle];
			if(isEmpty(this.allNudges)) return suggestions;
			let allnudges = JSON.parse(JSON.stringify(this.allNudges)).sort((a, b) => b.published - a.published);
			if(this.latestArticle?.id){
				allnudges = allnudges.filter((it) => it.id != this.latestArticle.id);
			}
			let items = allnudges.filter((nudge) => {
				return nudge.type == "ARTICLE" && nudge.status != "READ" && nudge.id != this.article?.id;
			});
			let all = [...suggestions, ...items];
			if(all.length <= 4) return all;
			return all.slice(0, 4);
		}
	},
	methods: {
		htmlLinebreak(html){
			if(!html) return "";
			return html.split(/\r\n|\r|\t/g).join("<br/>").split(/\n/g).join("br/>");
		},
		closeArticle() {
			if (this.$store.getters.hasInited) return this.goBack();
			goTo("FeedPage");
		},
		goToExternalLink(linkURL) {
			window.open(linkURL, "_blank");
		},
		getImageDisplay(imageId) {
			return getImage(imageId);
		},
		nudgeClicked() {
			let pageToGo = "";
			switch (this.latestArticle.type) {
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
				goTo(pageToGo, { nudgeId: this.latestArticle.id });
			}
		},
		async copy(string) {
			if (!navigator.clipboard) return;

			await navigator.clipboard.writeText(string);
		},
		async share() {
			// try {
			// 	let shareToken = await getShareToken(this.nudgeId);
			// 	let url = document.URL + shareToken;

			// 	if (navigator.canShare) {
			// 		await navigator.share({
			// 			text: this.article.description,
			// 			url: url,
			// 			title: this.article.title,
			// 		});
			// 	} else {
			// 		this.copy(url);
			// 		this.showNotification("success", "", "Copied to clipboard");
			// 	}
			// } catch (error) {
			// 	this.showNotification("alert", "error_outline", error);
			// }
			try {
				let shareToken = await getShareToken(this.nudgeId);
				// let url = document.URL + shareToken;
				let url = `${window.location.protocol}//${window.location.host}/article/${this.article.id}${shareToken}`;
				// This is a hack to handle safari's permission error
				// https://stackoverflow.com/questions/66312944/javascript-clipboard-api-write-does-not-work-in-safari
				setTimeout(async () => {
					await this.copy(url);
					this.showNotification("success", "", "Copied to clipboard");
				}, 100);
			} catch (error) {
				this.showNotification("alert", "error_outline", error);
			}
		},
		async handleLikeArticle() {
			if (!this.loading) {
				try {
					this.loading = true;
					await updateArticle(
						this.article.id,
						this.article.liked ? "UNLIKED" : "LIKED"
					);

					this.article.liked = !this.article.liked;
					this.loading = false;
				} catch (error) {
					this.showNotification("alert", "error_outline", error);
					this.loading = false;
				}
			}
		},
	},
	async created() {
		try {
			this.loading = true;
			this.allNudges = await homeService.getAllNudges();
			this.article = await getArticleNudge(this.nudgeId);
			this.latestArticle = await getUnselectedLatestArticle(this.nudgeId);

			if (this.article.status == "AWARDED") {
				await updateArticle(this.nudgeId, "READ");
				this.article.status = "READ";
				let points = this.article.readingPoints;
				if(this.article.type == "QUESTIONNAIRE") points = this.article.completionPoints;
				if(points > 0){
					this.showNotification(
						"point",
						"star",
						"Awesome! You earned " +
							points +
							" activity points."
					);
				}
			}

			const hasShareToken = this.shareToken ? true : false;

			if (hasShareToken) {
				await updateStatus({
					nudge: this.nudgeId,
					type: "READ",
					share: this.shareToken,
				});
			}
			this.loading = false;
			window.addEventListener("resize",  () => {
				this.isDesktop = window.innerWidth >= 672;
				this.resizeImageHandler();
			});
			setTimeout(() => {
				this.isDesktop = window.innerWidth >= 672;
				this.resizeImageHandler();
			}, 100);
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error, false);
			this.closeArticle();
		}
	},
};
</script>

<style scoped lang="scss">
	.points-tooltip {
		background: $green-tooltip;
		width: 100%;
		max-width: 600px;
		margin-inline: auto;
		margin-block: 16px;
		padding: 16px;
		border-radius: 8px;
		display: flex;
		gap: 12px;
		.points-icon {
			padding: 4px;
			border-radius: 4px;
			background: $green-tooltip-accent;
			height: fit-content;
			display: flex;
			align-items: center;
			justify-content: center;
			color: $white;
		}
		.points-tooltip-content {
			display: flex;
			flex-direction: column;
			color: $green-tooltip-accent;
			text-align: left;
			label {
				font-size: 18px;
				line-height: 28px;
				font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
			}
			small {
				font-size: 15px;
				line-height: 22px;
			}
		}
	}
	.header-con {
		justify-content: space-between;
		padding: 32px;
	}
	iframe {
		width: 100%;
		border: 1px solid $secondary-color-10;
		border-radius: 10px;
		min-height: 300px;
	}
	.slide-fade-enter-active {
		transition: all 0.3s ease-out;
	}

	.slide-fade-leave-active {
		transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
	}

	.slide-fade-enter-from,
	.slide-fade-leave-to {
		transform: translateY(-20px);
		opacity: 0;
	}
	.page {
		&__main {
			width: 100%;

			&__header {
				width: 100%;
				padding: 24px 0;
				display: flex;
				position: relative;
				flex-direction: column;
				gap: 24px;

				&__tags {
					width: 100%;
					display: flex;
					flex-wrap: wrap;
					gap: 20px;
					position: relative;
					padding: 0 24px;

					&__item {
						position: relative;
						text-align: left;
						&.bold {
							font-weight: bold;
						}
						& + *::before {
							content: "/";
							position: absolute;
							color: $secondary-color-40;
							margin-left: -11px;
						}
					}
				}

				&__icon {
					background-color: white;
					align-self: flex-start;
					padding: 0;
				}
			}
		}

		&__header {
			position: relative;
			width: 100%;
			max-width: 600px;
			margin-inline: auto;
			&__title {
				font-family: "Berthold Akzidenz Grotesk Medium";
				font-size: 28px;
				line-height: 42px;
			}
			&__desc {
				color: $dark-color-1;
				margin-bottom: 24px;
			}
			&__icon {
				position: absolute;
				top: 12px;
				left: 12px;
				background-color: white;
			}
			&__notification {
				z-index: 1;
				position: fixed;
				margin: 15% auto;
				left: 0;
				right: 0;
			}
			&__image {
				background-repeat: no-repeat;
				background-size: cover;
				img {
					width: 100%;
					object-fit: cover;
				}
			}
			&__no--image {
				height: 88px;
			}
		}

		&__content {
			&__wrapper {
				text-align: left;
				margin-top: 32px;
				width: 100%;
				max-width: 600px;
				margin-inline: auto;
				padding-inline: 16px;
			}
			&__header {
				display: flex;
				flex-direction: column;
				row-gap: 16px;
			}

			&__icons {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 37px;
				margin-bottom: 42px;
				margin-top: 42px;
				.material-icons-outlined {
					cursor: pointer;
				}
			}

			&__title {
				line-height: 1;
			}

			&__con {
				margin-top: 64px;

				&:first-child {
					margin-top: 32px;
				}

				&:nth-child(2) {
					margin-top: 16px;
				}

				&:last-child {
					margin-top: 43px;
				}
			}

			&__html {
				margin-top: 16px;
			}
		}

		&__footer {
			margin: 16px;
			text-align: left;
			&__text {
				color: $secondary-color-40;
			}
			&__container {
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
				margin: 8px 0 32px 0;
			}
		}

		&__footer__tag {
			pointer-events: none;
		}
	}

	.latest-article-con {
		margin-top: 48px;
		padding: 0 16px 32px 16px;

		.nudge-con {
			margin-top: 32px;
			width: 100%;
			display: grid;
			gap: 16px;
			grid-template-columns: 100%;
		}
	}
	.article-divider {
		margin: 32px 0;
		height: 12px;
		width: 100%;
		background-color: $secondary-color-10;
	}

	.linked-nudge-con {
		padding-block: 16px;
		max-width: 600px;
		margin-inline: auto;
	}
	@media (min-width: 672px) {
		.back-btn {
			cursor: pointer;
		}
		.nudge-con {
			grid-template-columns: repeat(auto-fill, minmax(20%, 1fr)) !important;
		}
		.page {
			&__main {
				position: relative;

				&__header {
					width: 100%;
					padding: 24px 0;
					display: flex;
					position: relative;
					flex-direction: column;
					gap: 24px;

					&__tags {
						width: 100%;
						display: flex;
						flex-direction: row;
						position: relative;
						padding: 0 !important;
						max-width: calc(100% - 40px);
						margin-inline: auto;

						&__item {
							position: relative;
							&.bold {
								font-weight: bold;
							}
							& + *::before {
								content: "/";
								position: absolute;
								color: $secondary-color-40;
								margin-left: -11px;
							}
						}
					}

					&__icon {
						background-color: white;
						align-self: flex-start;
						padding: 0;
					}
				}
			}
			&__header {
				&__icon {
					display: none;
				}
			}
			&__content {
				&__wrapper {
					padding-inline: 0 !important;
				}
				&__title {
					font-size: 2em;
					font-family: 'Berthold Akzidenz Grotesk Medium';
				}
			}
		}
	}
	@media (min-width: 672px) and (max-width: 1024px) {
		.nudge-con {
			grid-template-columns: repeat(auto-fill, minmax(33%, 1fr)) !important;
		}
	}
	@media (min-width: 672px) and (max-width: 900px) {
		.nudge-con {
			grid-template-columns: 50% 50% !important;
		}
	}
</style>
