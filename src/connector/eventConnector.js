import { EUNOIA_API_CONNECTOR } from "./apiConnector";
import { EUNOIA_CONFIG } from "./apiConfig";
import store from "../store/index";

export const getEventReviews = async (eventId) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  const path = `/eventReviews/getReviews/${code}`;
  const params = {
    authToken: store.getters.getEunoiaToken,
    app: EUNOIA_CONFIG.app,
    eventId: eventId,
    pageNumber: 0,
    pageSize: 1000,
  };
  const { post } = EUNOIA_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const uploadEventReviewImage = async (image) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  const path = `/eventReviews/upload/${code}`;
  let form = new FormData();
  form.append("authToken", store.getters.getEunoiaToken);
  form.append("app", EUNOIA_CONFIG.app);
  form.append("reviewImage", image);
  const { post } = EUNOIA_API_CONNECTOR(form);
  try {
    const data = await post(path, form);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const submitEventReview = async (payload, eventId) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    const path = `/eventReviews/createReview/${code}/${eventId}`;
    payload.authToken = store.getters.getEunoiaToken;
    payload.app = EUNOIA_CONFIG.app;
    const { post } = EUNOIA_API_CONNECTOR({});
    const data = await post(path, payload);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getEvents = async () => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  const path = `/events/${code}`;
  const params = {
    authToken: store.getters.getEunoiaToken,
    app: EUNOIA_CONFIG.app,
    pageSize: 1000,
  };
  const { post } = EUNOIA_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getEventAvailability = async (time) => {
	const path = `/stores/${EUNOIA_CONFIG.brandCode}/available`;
    const params = {
        authToken: store.getters.getToken,
		app: EUNOIA_CONFIG.app,
        extraPayload: {
            type: "DINE_IN",
            time: time,
        }
	}
	const { get } = EUNOIA_API_CONNECTOR(params);
	try {
		const data = await get(path);
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const bookEvent = async (payload) => {
	const isHQ = store.getters.isHQ;
	let code = EUNOIA_CONFIG.brandCode;
	if(isHQ) code = "hq$" + code;
	const path = `/order/${code}/ticket`;
	payload.authToken = store.getters.getEunoiaToken;
	payload.app = EUNOIA_CONFIG.app;
	const { post } = EUNOIA_API_CONNECTOR({
		headers: {
			"Content-Type": "multipart/form-data",
		}
	});

	let formData = new FormData();
	formData.append("body", JSON.stringify(payload));
	try {
		const data = await post(path, formData);
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const cancelEvent = async (number) => {
	const isHQ = store.getters.isHQ;
	let code = EUNOIA_CONFIG.brandCode;
	if(isHQ) code = "hq$" + code;
	const path = `/order/${code}/cancelRegistration/${number}`;
    let params = {
        authToken: store.getters.getEunoiaToken,
		app: EUNOIA_CONFIG.app,
	}
	const { get } = EUNOIA_API_CONNECTOR(params);
	try {
		const data = await get(path);
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getEventDetails = async (number) => {
	const isHQ = store.getters.isHQ;
	let code = EUNOIA_CONFIG.brandCode;
	if(isHQ) code = "hq$" + code;
	const path = `/orders/${code}/ticket`;
    let params = {
        // authToken: store.getters.getEunoiaToken,
		app: EUNOIA_CONFIG.app,
	}
	if(number) {
		params.extraPayload = {
			number: number
		};
	}
	const { get } = EUNOIA_API_CONNECTOR(params);
	try {
		const data = await get(path);
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};
