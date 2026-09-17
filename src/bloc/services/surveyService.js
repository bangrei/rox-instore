import Question from "@/bloc/model/question";
import { surveyConnector } from "../../connector/v4/surveyConnector";
import nudgeConnector from "../../connector/v4/nudgeConnector";

// TODO: refactor this file
const surveyAdapter = (data, survey) => {
	data.nudges[0].questionnaire.questions.forEach((el, index) => {
		let type = "single-ans";
		if(el.maxChoices > 1) type = "multiple-ans";
		let answers = [];
		let chosenAnswers = el.chosenAnswers || [];
		el.answers.forEach((el) => {
			let chosenAnswer = false;
      if (chosenAnswers) {
        chosenAnswer =
          chosenAnswers.filter((c) => {
            return c.id == el.id;
          }).length > 0;
      }
			answers.push({
        answer: el.answer,
        selectedAnswer: chosenAnswer,
        id: el.id,
        score: el.score,
      });
		});
		survey.push(
			new Question(index, el.question, type, answers, {
				displayImg: false,
			}, el.minChoices, el.maxChoices)
		);
	});
	return survey;
};

export const getSurvey = (nudgeId) => {
	return new Promise((resolve, reject) => {
		let survey = [];
		surveyConnector
			.getSurveyQuestionsFromApi(nudgeId)
			.then((response) => {
				let surveyNudge = response.nudges[0];
				let surveyQuestions = surveyAdapter(response, survey);
				let surveyStatus;
				if (surveyNudge.state !== undefined) {
					surveyStatus = surveyNudge.state;
				} else {
					surveyStatus = null;
				}

				const isMandatory =
					surveyNudge.name == "Start your BFM journey here" &&
					surveyNudge.type == "QUESTIONNAIRE" &&
					surveyNudge.questionnaire &&
					surveyNudge.state !== "ANSWERED";

				resolve({
					isMandatory: isMandatory,
					questions: surveyQuestions,
					status: surveyStatus,
					surveyResult: surveyNudge.questionnaire.questions,
					readingPoints: surveyNudge.readingPoints,
					completionPoints: surveyNudge.completionPoints,
				});
			})
			.catch((err) => reject(err));
	});
};

export const finalizeSurvey = (nudgeId, surveyParams) => {
	return new Promise((resolve, reject) => {
		(async () => {
			let params = {
				nudge: nudgeId,
				type: "ANSWERED",
				answers: surveyParams,
			};
			try {
				await nudgeConnector.logInteraction(params);
				resolve();
			} catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	});
};

export const readSurvey = (nudgeId) => {
	return new Promise((resolve, reject) => {
		(async () => {
			let params = {
				nudge: nudgeId,
				type: "READ",
			};
			try {
				const response = await nudgeConnector.logInteraction(params);
				if (!response.success) reject(response.message);

				resolve(response.points);
			} catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	});
};
