import nudgeConnector from "@/connector/v4/nudgeConnector";

export const surveyConnector = {
	getSurveyQuestionsFromApi: (nudgeId) => {
		return new Promise((resolve, reject) => {
			(async () => {
				try {
					const response = await nudgeConnector.getNudges({
						id: nudgeId,
					});
					resolve(response);
				} catch (error) {
					reject(error);
				}
			})();
		});
	},
};
