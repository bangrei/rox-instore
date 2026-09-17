import { BFM_APIV4_CONNECTOR } from "./apiV4Connector";
import { BFM_CONFIG } from "../apiConfig";
import store from "../../store/index";

export default {
	getNudges: async (params) => {
		const token = store.getters.getToken;
		let payload = {
			...params
		}
		if(token) {
			payload = {
				...params,
				authToken: token
			}
		}
		const { post } = BFM_APIV4_CONNECTOR({
			target: '/nudge',
			requestMethod: "GET",
			payload: payload
		});
		try {
			const data = await post();
			return Promise.resolve(data);
		} catch (error) {
			return Promise.reject(error);
		}
	},
	getNudgeTags: async (params) => {
		const token = store.getters.getToken;
		let payload = {
			...params,
			account: BFM_CONFIG.accountCode,
		}
		const body = {
			authToken: token,
			body: JSON.stringify(payload)
		}
		const { post } = BFM_APIV4_CONNECTOR({
			target: '/nudge/tags',
			requestMethod: "POST",
			payload: body
		});
		try {
			const data = await post();
			return Promise.resolve(data);
		} catch (error) {
			return Promise.reject(error);
		}
	},
	getPaginateNudges: async (params) => {
		const token = store.getters.getToken;
		let payload = {
			...params,
			account: BFM_CONFIG.accountCode,
		}
		const body = {
			authToken: token,
			body: JSON.stringify(payload)
		}
		const { post } = BFM_APIV4_CONNECTOR({
			target: '/nudge/filterNudges',
			requestMethod: "POST",
			payload: body
		});
		try {
			const data = await post();
			return Promise.resolve(data);
		} catch (error) {
			return Promise.reject(error);
		}
	},
	logInteraction: async (payload) => {
		const { post } = BFM_APIV4_CONNECTOR({
			target: `/log-interaction`,
			requestMethod: "POST",
			payload: {
				...payload,
				authToken: store.getters.getToken,
			}
		});
		try {
			const data = await post();
			return Promise.resolve(data);
		} catch (error) {
			return Promise.reject(error);
		}
	},
};

export const updateNudgeStatus = async (nudgeId, status, params = {}) => {
	try {
		const { post } = BFM_APIV4_CONNECTOR({
			target: `/log-interaction`,
			requestMethod: "POST",
			payload: {
				...params,
				authToken: store.getters.getToken,
				nudge: nudgeId,
				type: status
			}
		});
		const data = await post();
		return data;
	} catch (error) {
		console.error(error);
		return error;
	}
};
