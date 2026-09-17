import { EUNOIA_CONFIG } from "../apiConfig";
import store from "../../store/index";
import { EUNOIA_APIV4_CONNECTOR } from "./apiV4Connector";

export const getEventReviews = async (eventId) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/eventReviews/getReviews/${code}`,
      requestMethod: "POST",
      payload: {
        authToken: store.getters.getEunoiaToken,
        eventId: eventId,
        pageNumber: 0,
        pageSize: 1000,
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const uploadEventReviewImage = async (image) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  let form = new FormData();
  form.append("authToken", store.getters.getEunoiaToken);
  form.append("app", EUNOIA_CONFIG.app);
  form.append("code", code);
  form.append("file", image);
  const { fileUpload } = EUNOIA_APIV4_CONNECTOR({});
  try {
    const data = await fileUpload(form, {
      authToken: store.getters.getEunoiaToken,
      app: EUNOIA_CONFIG.app,
      code: code,
    });
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
    let params = {
      ...payload,
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken
    }
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/eventReviews/createReview/${code}/${eventId}`,
      requestMethod: "POST",
      body: JSON.stringify(params)
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getEvents = async () => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/events/${code}`,
      requestMethod: "POST",
      payload: {
        authToken: store.getters.getEunoiaToken,
        app: EUNOIA_CONFIG.app,
        pageSize: 1000,
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getEventAvailability = async (time) => {
	try {
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/stores/${EUNOIA_CONFIG.brandCode}/available`,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
        app: EUNOIA_CONFIG.app,
        type: "DINE_IN",
        time: time,
      }
    });
		const data = await post();
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const bookEvent = async (payload) => {
	try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if(isHQ) code = "hq$" + code;
    let params = {
      ...payload,
      authToken: store.getters.getEunoiaToken,
      app: EUNOIA_CONFIG.app,
    }
    let body = { body: JSON.stringify(params) };
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/order/${code}/ticket`,
      requestMethod: "POST",
      payload: body
    });
		const data = await post();
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const cancelEvent = async (number) => {
	try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if(isHQ) code = "hq$" + code;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/order/${code}/cancelRegistration/${number}`,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
        app: EUNOIA_CONFIG.app,
      }
    });
		const data = await post();
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getEventDetails = async (number) => {
	try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if(isHQ) code = "hq$" + code;
    let payload = {
      authToken: store.getters.getEunoiaToken,
      app: EUNOIA_CONFIG.app,
    }
    if(number) {
      payload = {
        ...payload,
        number: number,
      }
    }
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: `/orders/${code}/ticket`,
      requestMethod: "GET",
      payload: payload
    });
		const data = await post();
		return Promise.resolve(data);
	} catch (error) {
		return Promise.reject(error);
	}
};
