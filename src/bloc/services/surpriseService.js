import nudgeConnector from "@/connector/v4/nudgeConnector";
import Surprise from "@/bloc/model/surprise";
import Nudge from "@/bloc/model/nudge";

export default {
	getDetail: async (id) => {
		try {
			// use this after the data for surprise is provided in the API, and adjust the surprise model
			let result = await nudgeConnector.getNudges({ id });
			if (!result.success) return Promise.reject(result.message);

			result = result.nudges.find((it) => it.id == id);
			let surprise = new Surprise(result);

			return Promise.resolve(surprise);
		} catch (error) {
			return Promise.reject(error);
		}
	},

	updateStatus: async (params) => {
		try {
			let result = await nudgeConnector.logInteraction(params);
			if (!result.success) return Promise.reject(result.message);

			return Promise.resolve(result.points);
		} catch (error) {
			return Promise.reject(error);
		}
	},

	getNudges: async (params) => {
		try {
			let result = await nudgeConnector.getNudges(params);
			if (!result.success) return Promise.reject(result.message);

			let nudges = result.nudges.map((it) => new Nudge(it));

			return Promise.resolve(nudges);
		} catch (error) {
			return Promise.reject(error);
		}
	},
};
