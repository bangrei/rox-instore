import nudgeConnector from "@/connector/v4/nudgeConnector";
export const articleConnector = {
	getArticleFromApi: (nudgeId) => {
		return new Promise((resolve, reject) => {
			(async () => {
				try {
					const nudge = await nudgeConnector.getNudges({
						id: nudgeId,
					});
					resolve(nudge);
				} catch (error) {
					reject(error);
				}
			})();
		});
	},
};
