<template>
	<layout-variant-two :show-main-logo="!getStarted" :show-loading-screen="loading">
		<template v-slot:body>
			<div v-if="getStarted && surveyStatus !== 'ANSWERED'" class="back_btn" @click="goBack">
				<base-icon
					class="sd-icon-btn-sm align-middle"
					iconName="arrow_back"
					iconSize="xxlg"
					iconStyle="outlined"
				></base-icon>
			</div>
			<img v-if="getStarted" class="survey__bg-image" :src="require('@/assets/images/registration-bg.png')" alt="Survey"/>
			<div class="survey__content" v-if="surveyStatus !== 'ANSWERED' || review">
				<base-slab
					:currentIndex="currentIndex"
					:totalIndex="totalIndex"
					class="slab"
					@slab-clicked="changeIndex"
				></base-slab>
				<div class="survey-con">
					<survey-question
						:currentQuestion="currentQuestion"
						:currentIndex="currentIndex"
						:getStarted="getStarted"
						:review="review"
						:answered="surveyStatus == 'ANSWERED'"
						class="question"
						@answer-clicked="handleAnswerClicked"
						:surveyIsMandatory="surveyIsMandatory"
					></survey-question>
				</div>
				<div class="footer__button" v-if="questionType && !review">
					<base-button v-if="currentIndex > 0"
						class="sd-btn-secondary sd-btn-lg full-width"
						btnLabel="Previous"
						@click="decrementCurrentIndex"
					></base-button>
					<base-button
						class="sd-btn-primary sd-btn-lg full-width"
						btnLabel="Submit"
						iconName="check"
						@click="submitAnswer"
						isRightIcon
					></base-button>
				</div>
			</div>
			<div v-else class="survey__content survey-result">
				<div class="survey-result-con" :class="{'get-started': getStarted}">
					<message-page-layout
						:surveyIsMandatory="surveyIsMandatory"
						:fitHeight="isFitHeight"
						:isCongrats="true"
						:showReview="true"
						iconName="thumb_up"
						title="Thank You!"
						subTitle="Your response is saved!"
						:spotUsername="customerName"
						:highlightedTitle="'You scored ' + answeredScores + ' points'"
						instruction="You are on your way to become a better trialist journey with R.O.X!"
						buttonText="Back Home"
						goToPage="WelcomePage"
						@do-review="doReview"
					></message-page-layout>
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
// TODO: refactor this page along with the states.
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import BaseSlab from "./components/BaseSlab.vue";
import SurveyQuestion from "./components/SurveyQuestion.vue";
import MessagePageLayout from "@/components/layout/MessagePageLayout.vue";
import { mapGetters } from "vuex";
import utility from "@/presentation/mixins/utility.js";
import { readSurvey } from "../../../bloc/services/surveyService";

export default {
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		BaseSlab,
		SurveyQuestion,
		MessagePageLayout,
	},
	data() {
		return {
			loading: false,
			getStarted: false,
			review: false,
			answeredScores: 0
		};
	},
	methods: {
		async getSurvey() {
			await this.$store.dispatch(
				"survey/getSurvey",
				this.$route.params.nudgeId
			);
		},
		changeIndex(e) {
			if (this.review) {
				this.$store.commit("survey/forceUpdateIndex", e);
				return;
			}
			this.$store.commit("survey/updateIndex", e);
			this.updateAnsweredScores();
		},
		submitAnswer() {
			this.$store.dispatch("survey/incrementIndex", true);
			this.updateAnsweredScores();
		},
		decrementCurrentIndex() {
			this.$store.commit("survey/decrementIndex");
			this.updateAnsweredScores();
		},
		handleAnswerClicked(answerIndex) {
			this.$store.dispatch("survey/handleAnswerClick", answerIndex);
			this.updateAnsweredScores();
		},
		doReview() {
			this.review = true;
		},
		updateAnsweredScores() {
			let scores = 0;
			if (this.surveyQuestions) {
				this.surveyQuestions.forEach((q) => {
					let answered = q.answers.filter((a) => a.selectedAnswer == true);
					if (answered.length > 0) scores += answered.map((it) => it.score).reduce((a, b) => a + b, 0);
				})
			}
			this.answeredScores = scores;
		}
	},
	watch: {
		surveyStatus: async function (newStatus, oldStatus) {
			if (oldStatus == "READ" && newStatus == "ANSWERED") {
				if(this.$route.params.getStarted || false == true){
					this.$router.push({
						name: "ThankYouPage",
						params: {
							title: "Congrats!",
							subTitle: "And welcome to R.O.X Community",
							instruction: "Let’s onboard together to the largest outdoor community in the Philippines!",
							buttonLabel: "Start!",
							goToPage: "WelcomePage",
						},
					});
					return;
				}
				await this.getSurvey();
				if(this.completionPoints > 0){
					this.showNotification(
						"point",
						"star",
						"Awesome! You earned " +
							this.completionPoints +
							" activity points."
					);
				}
			}
		},
	},
	async created() {
		this.getStarted = this.$route.params.getStarted;
		this.loading = true;
		this.$store.dispatch("survey/flushState");
		try {
			await this.getSurvey();
			// update to read only if nudge is at state 'AWARDED'
			if (this.surveyStatus === "AWARDED") {
				let points = await readSurvey(this.$route.params.nudgeId);
				if(points > 0){
					this.showNotification(
						"point",
						"star",
						"Awesome! You earned " + points + " activity points."
					);
				}
				this.$store.commit("survey/updateStatus", "READ");
			}
			if (this.surveyStatus === "ANSWERED") {
				this.updateAnsweredScores();
			}
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
	computed: {
		isFitHeight() {
			let logic = this.surveyStatus !== 'ANSWERED' || this.review;
			return !logic || this.getStarted;
		},
		customerName() {
			let customer = this.$store.getters.getCustomer;
			if (!customer) return "";
			let names = [];
			if (customer.firstName) names.push(customer.firstName);
			if (customer.lastName) names.push(customer.lastName);
			return names.join(' ');
		},
		...mapGetters({
			surveyQuestions: "survey/getQuestions",
			totalIndex: "survey/getQuestionsLength",
			surveyStatus: "survey/getStatus",
			surveyIsMandatory: "survey/getIsMandatory",
			currentQuestion: "survey/getCurrentQuestion",
			questionType: "survey/getQuestionType",
			currentIndex: "survey/getCurrentIndex",
			surveyResult: "survey/getSurveyResult",
			completionPoints: "survey/getCompletionPoints",
		}),
	},
	beforeUnmount() {
		// this.$store.dispatch("survey/saveToLocalStorage");
	},
};
</script>
<style lang="scss">
	.back_btn {
		position: absolute;
		left: 12px;
		top: 24px;
		transform: scale(0.6);
	}
	.header-con {
		padding: 12px 14px;
	}

	.faq-back {
		cursor: pointer;
		color: $white !important;
	}

	.survey-con {
		margin-top: 24px;
	}
	.logo-con {
		width: fit-content;
		margin: 0 auto;
		margin-top: -30px;
	}

	.survey__bg-image {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: -1;
		width: auto;
		height: 100%;
		object-fit: cover;
	}

	.survey__content {
		padding: 24px;
		height: 100%;
		display: flex;
		flex-direction: column;

		.slab__container {
			padding: 0 !important;
		}
	}
	.footer__button {
		margin-top: auto;
	}
	.survey-con + .footer__button {
		margin-top: 24px;
	}
	.sd-btn + .sd-btn.full-width {
		margin-top: 6px;
	}

	.survey-result {
		p.heading-4 {
			text-align: left;
			margin-bottom: 32px;
		}
		.result-item {
			display: flex;
			justify-content: space-between;
			margin-bottom: 16px;
		}
		.result-string-con {
			border-radius: 32px;
			padding: 5px 16px;
			min-width: 112px;
		}
		.success-result {
			background-color: $success-light;
			color: $white;
		}
		.fail-result {
			background-color: $alert-light;
			color: $white;
		}
		.mid-result {
			background-color: $warning-light;
			color: $white;
		}
	}

	.survey-result-con {
		height: 100%;
		display: flex;
		flex-direction: column;
		&.get-started {
			height: auto !important;
			background: $white;
			width: 100%;
			max-width: 600px;
			margin: auto;
			border-radius: 16px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
			padding: 24px;
		}

	}
	@media(min-width: 672px){
		.header-con {
			padding: 16px 7% !important;
		}
		.survey__content {
			padding: 48px 7% !important;
		}
		.survey__bg-image {
			width: 100% !important;
			height: 100%;
			object-fit: contain;
		}
		.back_btn {
			left: 24px;
			top: 24px;
			transform: scale(0.9);
		}
	}
</style>
