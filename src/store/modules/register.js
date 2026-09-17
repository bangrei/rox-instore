import questions from "../../presentation/pages/page-register/questions";
const state = () => ({ questions: [], currentIndex: 0, currentChildIndex: 0 });

const mutations = {
  updateRegistrationData(state, questions) {
    state.questions = questions;
  },
  updateAnswer(state, value) {
    let isBasicInput = ["input", "date"].includes(
      state.questions[state.currentIndex].children[state.currentChildIndex].type
    );
    let isGenderInput = ["gender"].includes(
      state.questions[state.currentIndex].children[state.currentChildIndex].type
    );
    if (isBasicInput) {
      state.questions[state.currentIndex].children[
        state.currentChildIndex
      ].answer = value;
    } else {
      state.questions[state.currentIndex].children[
        state.currentChildIndex
      ].answers.forEach((e) => {
        if (isGenderInput && value == 1) e.selectedAnswer = false;
        else if (!value) e.selectedAnswer = false;
        else if (e.title === value.title) e.selectedAnswer = true;
        else e.selectedAnswer = false;
      });
    }
  },
  incrementCurrentIndex(state) {
    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex++;
    }
  },

  changeCurrentIndex(state, index) {
    state.currentIndex = index;
  },
  changeCurrentChildIndex(state, index) {
    state.currentChildIndex = index;
  },
  resetAllAnswers(state) {
    state.questions.map((it) => {
      it.children.map((ch) => {
        if (ch.type == "single-ans") {
          ch.answers.map((ans) => {
            ans.selectedAnswer = false;
          });
        } else {
          ch.answer = "";
        }
        return ch;
      });
      return it;
    });
  },
};
const actions = {
  populateWithStaticQuestions({ commit }) {
    commit("updateRegistrationData", questions);
  },
};
const getters = {
  getCurrentIndex(state) {
    return state.currentIndex;
  },
  getCurrentChildIndex(state) {
    return state.currentChildIndex;
  },
  getCurrentQuestion(state) {
    return state.questions[state.currentIndex];
  },
  getCurrentAnswer(state) {
    if (state.questions) {
      let isOptionsInput = ["gender", "single-ans"].includes(
        state.questions[state.currentIndex].children[state.currentChildIndex]
          .type
      );
      if (isOptionsInput)
        return state.questions[state.currentIndex].children[
          state.currentChildIndex
        ].answers.find((it) => it.selectedAnswer)?.enum;

      return state.questions[state.currentIndex].children[
        state.currentChildIndex
      ].answer;
    }
    return null;
  },
  getCurrentAnswers(state) {
    if (state.questions) {
      return state.questions[state.currentIndex].children[
        state.currentChildIndex
      ].answers;
    }
    return null;
  },
  getAnswerType(state) {
    return state.questions[state.currentIndex].children[state.currentChildIndex]
      .type;
  },
  getQuestions(state) {
    if (state.questions) {
      return state.questions;
    }
    return null;
  },
  getMappedAnswers(state) {
    if (state.questions) {
      let temp = {};
      state.questions.forEach((it) => {
        it.children.forEach((child) => {
          switch (child.type) {
            case "date":
              temp[child.apiField] = new Date(child.answer).getTime();
              break;
            case "single-ans":
            case "gender":
              temp[child.apiField] = child.answers.find(
                (answer) => answer.selectedAnswer
              )?.enum;
              break;
            default:
              temp[child.apiField] = child.answer;
              break;
          }
        });
      });

      return temp;
    }
  },
  getQuestionsLength(state) {
    let countQ = 0;
    if (state.questions) {
      state.questions.forEach((q) => {
        countQ += q.children.length;
      });
    }
    return countQ - 1;
  },
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
};
