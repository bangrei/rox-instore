import { checkRegistration } from "@/connector/v4/customerConnector";

export default {
	isCustomerRegistered: async (email) => {
		try {
			let response = await checkRegistration(email);
			if (!response.success) return Promise.reject(response.message);
			return Promise.resolve(response.registered);
		} catch (error) {
			return Promise.reject(error);
		}
	},
};
