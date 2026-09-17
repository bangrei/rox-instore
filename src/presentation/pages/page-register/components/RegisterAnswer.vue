<template>
	<div>
		<div v-if="answerType === 'input'">
			<input
				class="inputField"
				type="text"
				:placeholder="placeholder"
				@focus="withFocus"
				v-model="answer"
			/>
		</div>
		<div v-else-if="answerType === 'date'">
			<input class="inputField" type="date" v-model="answer" @focus="withFocus" />
		</div>

		<div v-else-if="answerType === 'gender'" class="genders">
			<div class="genders-wrapper">
				<div
					v-for="gender in genders"
					:key="gender.title"
					class="answer"
					:class="{ 'answer--selected': gender.selectedAnswer }"
					@click="handleClickGender(gender)"
				>
					{{ gender.title }}
				</div>
			</div>
		</div>

		<div v-else>
			<div
				v-for="answer in answers"
				:key="answer.title"
				class="answer"
				:class="{ 'answer--selected': answer.selectedAnswer }"
				@click="handleClick(answer)"
			>
				{{ answer.title }}
			</div>
		</div>
	</div>
</template>

<script>
//import { mapGetters } from "vuex";
export default {
	methods: {
		initData() {
			this.currentIndex = this.$store.getters["register/getCurrentIndex"];
			this.currentChildIndex = this.$store.getters["register/getCurrentChildIndex"];
		},
		handleClick(answer) {
			this.$store.commit("register/updateAnswer", answer);
		},
		withFocus() {
			this.$store.commit("register/changeCurrentIndex", this.parentIndex);
			this.$store.commit("register/changeCurrentChildIndex", this.childIndex);

			this.initData();
		},
		handleClickGender(gender) {
			this.withFocus();
			this.noToSayGender = gender == 1;
			this.$store.commit("register/updateAnswer", gender);
		},
	},
	props: {
		answerType: {
			type: String,
			default: "",
		},
		answerOptions: {
			type: Array,
			default: () => [],
		},
		placeholder: {
			type: String,
			default: "",
		},
		parentIndex: {
			type: Number,
			default: 0,
		},
		childIndex: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			currentIndex: 0,
			currentChildIndex: 0,
			answer: "",
			answers: [],
			genders: [],
			noToSayGender: false
		}
	},
	created() {
		this.initData();
		this.answer = this.$store.getters["register/getCurrentAnswer"];
		if (this.answerType == "gender") this.genders = this.answerOptions;
		else this.answers = this.answerOptions;
		// this.answers = this.$store.getters["register/getCurrentAnswers"];
	},
	watch: {
		answer(value) {
			this.handleClick(value);
		},
		answers(value) {
			this.handleClick(value);
		},
	},
};
</script>

<style lang="scss" scoped>
.inputField {
	border: none;
	width: 100%;
	height: 52px;
	background: $primary-color-10;
	border-radius: 12px;
	padding: 16px;
	/* Chrome, Safari, Edge, Opera */
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	[type="number"] {
		-moz-appearance: textfield;
	}
}

.answer {
	padding: 16px;
	margin-top: 8px;
	border-radius: 1rem;
	border: none;
	background-color: #fffbeb;
	width: 100%;
	text-align: left;
	transition: box-shadow 0.3s ease;
	overflow: hidden;
}

.answer--selected {
	box-shadow: 0px 0px 0px 3px #fecc80;
}
.genders {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;
	.genders-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.answer {
		flex-basis: 45%;
		flex-grow: 1;
		border: 1px solid $primary-color-30;
		cursor: pointer;
		background: transparent !important;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		&:hover {
			opacity: 0.7;
		}
	}
	.answer--selected {
		box-shadow: none !important;
		color: $primary-color-60;
	}
}
</style>
