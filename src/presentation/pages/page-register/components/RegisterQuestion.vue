<template>
	<div v-if="!currentQuestion.children"></div>
	<div class="question__wrapper" v-else v-for="(question, ix) in regQuestions" :key="ix">
		<div class="question">
			<p class="question__title heading-4" v-html="question.title"></p>
			<p class="question__subheading body-2-normal" v-html="question.subtitle"></p>
		</div>
		<div>
			<register-answer v-for="(children, c) in question.children" :key="c"
				:placeholder="children.placeholder"
				:parent-index="ix"
				:child-index="c"
				:answerType="children.type"
				:answer-options="children.answers"
				class="question__answer"
			></register-answer>
		</div>
	</div>
</template>

<script>
import RegisterAnswer from "./RegisterAnswer.vue";
import { mapGetters } from "vuex";
export default {
	methods: {
		handleClick(index) {
			this.$emit("answerClicked", index);
		},
	},
	computed: {
		...mapGetters({
			currentQuestion: "register/getCurrentQuestion",
			currentIndex: "register/getCurrentIndex",
			currentChildIndex: "register/getCurrentChildIndex",
		}),
		...mapGetters({
			regQuestions: "register/getQuestions",
		})
	},
	components: { RegisterAnswer },
};
</script>

<style scoped lang="scss">
.question {
	text-align: left;
	&__wrapper {
		width: 100%;
		padding: 16px 24px;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		background: $white;
		margin: 0 auto;
		max-width: 500px;
		& + * {
			margin-top: 24px;
		}
	}
	&__number {
		color: $secondary-color-40;
		margin-top: 50px;
	}
	&__title {
		margin-top: 24px;
		color: $secondary-color-100;
		text-align: center;
	}
	&__subheading {
		color: $secondary-color-50;
		margin-top: 16px;
		text-align: center;
	}

	&__answer {
		margin-top: 24px;
	}
}
</style>
