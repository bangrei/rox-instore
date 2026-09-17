<template>
	<div v-if="!currentQuestion"></div>
	<div :class="{'question__content': getStarted}" v-else>
		<div class="question">
			<p class="question__number heading-5">
				Question#{{ currentIndex + 1 }}
			</p>
			<p class="question__title heading-4">
				{{ currentQuestion.title }}
			</p>
			<p class="question__subheading body-2-normal">
				Choose the most applicable option.
			</p>
		</div>
		<div
			:class="[
				currentQuestion.displayImg
					? 'answer__container--image'
					: 'answer__container',
			]"
		>
			<div
				v-for="(answer, index) in currentQuestion.answers"
				:key="answer.id"
			>
				<survey-answer
					:image-url="answer.imgUrl"
					:display-img="currentQuestion.displayImg"
					:isSelected="answer.selectedAnswer"
					:isAnswered="answered"
					:review="review"
					class="answer__image"
					@click="handleClick(index)"
				>
					{{ answer.imgUrl }}
					<template v-slot:answer>
						<p class="body-2-normal">
							{{ answer.answer }}
						</p>
					</template>
				</survey-answer>
			</div>
		</div>
	</div>
</template>

<script>
import SurveyAnswer from "./SurveyAnswer.vue";
export default {
	props: {
		currentQuestion: Object,
		currentIndex: Number,
		getStarted: Boolean,
		answered: Boolean,
		review: Boolean
	},
	components: { SurveyAnswer },
	methods: {
		handleClick(index) {
			if (this.review && this.answered) return;
			this.$emit("answerClicked", index);
		},
	},
};
</script>

<style scoped lang="scss">
.question {
	text-align: left;
	
	&__content {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		padding: 24px;
		background: $white;
	}
	&__number {
		color: $secondary-color-40;
	}
	&__title {
		margin-top: 24px;
		color: $secondary-color-100;
	}
	&__subheading {
		color: $secondary-color-40;
		margin-top: 16px;
	}
}
.answer__container {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 8px;
	margin-top: 24px;
}

.answer__container--image {
	display: flex;
	flex-wrap: wrap;
	row-gap: 8px;
	column-gap: 8px;
	margin-top: 24px;
}

.answer__image {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
