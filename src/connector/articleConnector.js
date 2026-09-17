import nudgeConnector from "@/connector/nudgeConnector";
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
