import { updateNudgeStatus } from "../../connector/v4/nudgeConnector";
import { Article } from "../model/article";
import nudgeConnector from "../../connector/v4/nudgeConnector";
import Nudge from "../model/nudge";

export const getArticleNudge = async (id) => {
	try {
		let result = await nudgeConnector.getNudges({ id });
		if (!result.success) return Promise.reject(result.message);

		result = result.nudges[0];
		let articleNudge = new Article(result);
		return Promise.resolve(articleNudge);
	} catch (error) {
		return Promise.reject(error);
	}
};

const formatTokenToUrl = (shareToken) => {
	return `/${shareToken}`;
};

// TODO: combine updateArticle and updateStatus
export const updateArticle = (nudgeId, status) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				const response = await updateNudgeStatus(nudgeId, status);
				if (!response.success) reject(response.message);

				resolve(response.success);
			} catch (err) {
				reject(err);
			}
		})();
	});
};

export const updateStatus = async (params) => {
	try {
		let result = await nudgeConnector.logInteraction(params);
		if (!result.success) return Promise.reject(result.message);

		return Promise.resolve(result.points);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getShareToken = (nudgeId) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				const data = await updateNudgeStatus(nudgeId, "READ");
				resolve(formatTokenToUrl(data.shareToken));
			} catch (err) {
				reject(err);
			}
		})();
	});
};

const sortingFunction = (a, b) => {
	if (a.published < b.published) {
		return 1;
	}
	if (a.published > b.published) {
		return -1;
	}
	return 0;
};

export const getUnselectedLatestArticle = async (selectedNudgeId) => {
	let temp = await nudgeConnector.getNudges();
	let sortedNudges = temp.nudges.sort(sortingFunction);

	let latestArticle = sortedNudges.find((nudge) => {
		return (
			nudge.id !== selectedNudgeId &&
			nudge.type === "ARTICLE" &&
			nudge.state === "AWARDED"
		);
	});

	return latestArticle ? new Nudge(latestArticle) : {};
};
