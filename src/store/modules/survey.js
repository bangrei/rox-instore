import { getSurvey, finalizeSurvey } from "../../bloc/services/surveyService";
const getDefaultState = () => {
	return {
		surveyID: "",
		status: "",
		questions: [],
		currentIndex: 0,
		surveyResult: [],
		completionPoints: "",
		isMandatory: false,
	};
};

const state = getDefaultState();

const mutations = {
  flushState(state) {
    Object.assign(state, getDefaultState());
  },
  decrementIndex(state) {
    if (state.currentIndex == 0) return;
    state.currentIndex--;
  },
  incrementIndex(state) {
    if (state.questions.length === state.currentIndex + 1) {
      state.status = "ANSWERED";
      return;
    }
    state.currentIndex++;
  },
  updateIsMandatory(state, isMandatory) {
    state.isMandatory = isMandatory;
  },
  updateIndex(state, index) {
    if (state.currentIndex < index) {
      return;
    }
    state.currentIndex = index;
  },
  forceUpdateIndex(state, index) {
    state.currentIndex = index;
  },
  updateSurveyResult(state, surveyResult) {
    state.surveyResult = surveyResult;
  },
  updateQuestions(state, questions) {
    state.questions = questions;
  },
  updateStatus(state, status) {
    state.status = status;
  },
  updateID(state, id) {
    state.surveyID = id;
  },
  updateCompletionPoints(state, completionPoints) {
    state.completionPoints = completionPoints;
  },
  updateSelectedAnswer(state, payload) {
    if (state.questions[state.currentIndex].type === "single-ans") {
      state.questions[state.currentIndex].answers.forEach((element, index) => {
        if (index === payload) {
          element.selectedAnswer = true;
        } else {
          element.selectedAnswer = false;
        }
      });
    } else {
      state.questions[state.currentIndex].answers[payload].selectedAnswer =
        !state.questions[state.currentIndex].answers[payload].selectedAnswer;
    }
  },
  updateFromLocalStorage(state, data) {
    //TODO: maybe find a better way to do this
    state.surveyID = data.surveyID;
    state.status = data.status;
    state.questions = data.questions;
    state.currentIndex = data.currentIndex;
  },
};

const actions = {
	async getSurvey({ commit }, nudgeId) {
		const {
			isMandatory,
			questions,
			status,
			surveyResult,
			completionPoints,
		} = await getSurvey(nudgeId);
		commit("updateQuestions", questions);
		commit("updateStatus", status);
		commit("updateID", nudgeId);
		commit("updateSurveyResult", surveyResult);
		commit("updateCompletionPoints", completionPoints);
		commit("updateIsMandatory", isMandatory);

		// temporary remove saving feature
		// if (window.localStorage.getItem(JSON.stringify(nudgeId))) {
		// 	let data = await window.localStorage.getItem(
		// 		JSON.stringify(nudgeId)
		// 	);
		// 	data = await JSON.parse(data);
		// 	commit("updateFromLocalStorage", data);
		// } else {
		// 	commit("updateQuestions", questions);
		// 	commit("updateStatus", status);
		// 	commit("updateID", nudgeId);
		// }
	},
	async incrementIndex({ state, commit, getters }, isSubmit = true) {
		if (state.currentIndex + 1 === getters.getQuestionsLength) {
			let selectedAnswerIds = [];
			state.questions.forEach((question) => {
				let selectedAnswers = question.answers.filter(
					(answer) => answer.selectedAnswer
				);
				if (selectedAnswers) {
					selectedAnswers.forEach((el) => {
						selectedAnswerIds.push(el.id);
					});
				};
			});
			if(isSubmit){
				await finalizeSurvey(state.surveyID, selectedAnswerIds);
				commit("updateStatus", "ANSWERED");
			}
		} else {
			if(isSubmit) {
				commit("incrementIndex");
			}
		}
	},
	async handleAnswerClick({ commit, dispatch, getters }, answerIndex) {
		let currentQuestion = getters.getCurrentQuestion;
		let isMultipleAnswer = currentQuestion.maxChoices > 1;
		let selectedAnswers = currentQuestion.answers.filter(
			(answer) => answer.selectedAnswer
		);
		let isCurrentAnswerSelected = currentQuestion.answers[answerIndex].selectedAnswer == true;
		if(isMultipleAnswer && selectedAnswers?.length >= currentQuestion.maxChoices) {
			if(!isCurrentAnswerSelected) return;
		};
		commit("updateSelectedAnswer", answerIndex);
		// #41035 - no idea why is this considered a bug. Hence the settimeout below.
		setTimeout(() => {
			dispatch("incrementIndex", !isMultipleAnswer);
		}, 100);
	},
	async saveToLocalStorage({ state }) {
		window.localStorage.setItem(
			JSON.stringify(state.surveyID),
			JSON.stringify(state)
		);
	},
	flushState({ commit }) {
		commit("flushState");
	},
};

const getters = {
	getCurrentIndex(state) {
		return state.currentIndex;
	},
	getCurrentQuestion(state) {
		return state.questions[state.currentIndex];
	},
	getQuestions(state) {
		return state.questions;
	},
	getStatus(state) {
		return state.status;
	},
	getIsMandatory(state) {
		return state.isMandatory;
	},
	getQuestionType: (state) => {
		if (
			state.questions &&
			state.questions.length !== 0 &&
			state.questions[state.currentIndex].type === "multiple-ans"
		) {
			return true;
		} else {
			return false;
		}
	},
	getQuestionsLength(state) {
		if (state.questions && state.questions.length !== 0) {
			return state.questions.length;
		}
		return;
	},
	getCompletionPoints(state) {
		return state.completionPoints;
	},
	getSurveyResult: (state) => {
		let temp = state.surveyResult;

		// combine all scores
		let rawTotalScores = temp
			.filter((it) => it.tags.length == 1)
			.map((it) => {
				return {
					tag: it.tags[0],
					totalScore: Math.max(
						...it.answers.map((answer) => answer.score)
					),
					answerScore: it.chosenAnswers
						.map((answer) => answer.score)
						.reduce((a, b) => a + b, 0),
				};
			});

		let output = [];

		rawTotalScores.forEach((it) => {
			let existing = output.filter((o) => {
				return o.tag == it.tag;
			});

			if (existing.length) {
				let existingIndex = output.indexOf(existing[0]);
				output[existingIndex].totalScore =
					output[existingIndex].totalScore + it.totalScore;

				output[existingIndex].answerScore =
					output[existingIndex].answerScore + it.answerScore;
			} else {
				output.push(it);
			}
		});

		let result = output.map((it) => {
			let successPercentage = Math.round(
				(it.answerScore / it.totalScore) * 100
			);
			let resultString = "";

			if (successPercentage == 100) resultString = "Doing great";
			else if (successPercentage < 50) resultString = "Need work";
			else resultString = "On track";

			return {
				...it,
				successPercentage,
				resultString,
			};
		});

		return result;
	},
};
export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
};
