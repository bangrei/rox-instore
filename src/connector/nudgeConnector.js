import { BFM_API_CONNECTOR } from "./apiConnector";
import { BFM_CONFIG } from "./apiConfig";
import store from "../store/index";

export default {
	getNudges: async (params) => {
		const path = `/nudge`;
		const { get } = BFM_API_CONNECTOR({
			authToken: store.getters.getToken,
			account: BFM_CONFIG.accountCode,
		});
		try {
			const data = await get(path, { params });
			return Promise.resolve(data);
		} catch (error) {
			return Promise.reject(error);
		}
	},

	logInteraction: async (payload) => {
		const path = `/log-interaction`;
		const { post } = BFM_API_CONNECTOR({
			authToken: store.getters.getToken,
			account: BFM_CONFIG.accountCode,
		});
		try {
			const data = await post(path, new URLSearchParams(payload));
			return Promise.resolve(data);
		} catch (error) {
			return Promise.reject(error);
		}
	},
};

export const updateNudgeStatus = async (nudgeId, status, params = {}) => {
	try {
		const authToken = store.state.token;
		const searchParam = new URLSearchParams();
		searchParam.append("authToken", authToken);
		searchParam.append("nudge", nudgeId);
		searchParam.append("account", BFM_CONFIG.accountCode);
		searchParam.append("type", status);
		Object.keys(params).forEach((paramKey) => {
			searchParam.append(paramKey, params[paramKey]);
		});
		const path = `/log-interaction`;
		const { post } = BFM_API_CONNECTOR({});
		const data = await post(path, searchParam);
		return data;
	} catch (error) {
		console.error(error);
		return error;
	}
};
