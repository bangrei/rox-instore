import store from "../../store/index";
import { BFM_CONFIG, EUNOIA_CONFIG } from "./apiConfig";
import { BFM_API_CONNECTOR, EUNOIA_API_CONNECTOR } from "./apiConnector";

// https://app.swaggerhub.com/apis/mkhairul6/BetterForMe/1.0#/Customer/post_api_1_0_otp
export const sendOTP = async (email) => {
  const encodedEmail = encodeURIComponent(email);
  const path = `/otp?account=${BFM_CONFIG.accountCode}&email=${encodedEmail}`;
  const { post } = BFM_API_CONNECTOR({});
  try {
    const data = await post(path);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// https://app.swaggerhub.com/apis/mkhairul6/BetterForMe/1.0#/Customer/post_api_1_0_login
export const loginWithOTP = async (payload) => {
  const path = `/login?account=${BFM_CONFIG.accountCode}`;
  const { post } = BFM_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(payload));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const generateLoginToken = async (payload) => {
  const path = `/otp/token?account=${BFM_CONFIG.accountCode}`;
  const { post } = BFM_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(payload));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// https://app.swaggerhub.com/apis/mkhairul6/BetterForMe/1.0#/Customer/get_api_1_0_details
export const getDetails = async (overrideToken) => {
  const path = `/details`;
  const { get } = BFM_API_CONNECTOR({
    authToken: overrideToken || store.getters.getToken,
    account: BFM_CONFIG.accountCode,
  });
  try {
    const data = await get(path);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateDetails = async (payload) => {
  const path = `/details/update`;
  let token = store.getters.getToken;
  if(payload.token) {
    token = payload.token;
    delete payload.token;
  }
  const { post } = BFM_API_CONNECTOR({
    headers: {
      "Content-Type": "multipart/form-data",
    },
    authToken: token,
    account: BFM_CONFIG.accountCode,
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

export const updateAddress = async (payload) => {
  const path = `/customerAddress/save`;
  const { post } = BFM_API_CONNECTOR({
    headers: {
      "Content-Type": "multipart/form-data",
    },
    authToken: store.getters.getToken,
    account: BFM_CONFIG.accountCode,
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

export const deleteAddress = async (id) => {
  const path = `/customerAddress/delete`;
  const { post } = BFM_API_CONNECTOR({
    headers: {
      "Content-Type": "multipart/form-data",
    },
    authToken: store.getters.getToken,
    account: BFM_CONFIG.accountCode,
  });
  let formData = new FormData();
  formData.append("body", JSON.stringify({ addressId: id }));
  try {
    const data = await post(path, formData);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// EU really needs to update their docs and API error message, app needs to be input for this API to work
// https://staging.eunoia.asia/docs/#register-a-customer
export const registerCustomer = async (payload) => {
  const path = `/register/?account=${BFM_CONFIG.accountCode}`;
  const { post } = BFM_API_CONNECTOR({});
  const params = {
    ...{ app: EUNOIA_CONFIG.app },
    ...payload,
  };
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// https://staging.eunoia.asia/docs/#querying-whether-a-customer-is-registered
export const checkRegistration = async (email) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  const path = `/customer/registered/${code}`;
  const { post } = EUNOIA_API_CONNECTOR({
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  let bodyFormData = new FormData();
  bodyFormData.append("email", email);
  try {
    const data = await post(path, bodyFormData);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getTransactionalPoints = async () => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  var path = `/customer/details/${code}?`;
  var params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getEunoiaCustomerDetails = async () => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  var path = `/customer/details/${code}?`;
  var params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteCustomerAccount = async () => {
  const path = `/details/delete`;
  const payload = {
    authToken: store.getters.getToken,
    account: BFM_CONFIG.accountCode,
  };
  const { get } = BFM_API_CONNECTOR(payload);
  try {
    const data = await get(path, new URLSearchParams(payload));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const checkDeleteCustomerAccount = async (code) => {
  const path = `/customer/deletedCustomer`;
  const params = {
    deleteCode: code,
    account: BFM_CONFIG.accountCode,
    app: EUNOIA_CONFIG.app,
  };
  const { get } = BFM_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getRewardsHistory = async (_pageSize = 20, _pageNumber = 0) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  const path = `/reward/history/${code}`;
  var payload = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    pageSize: _pageSize || 20,
    pageNumber: _pageNumber || 0,
    validOnly: true
  }
  const { get } = EUNOIA_API_CONNECTOR(payload);
  try {
    const data = await get(path, new URLSearchParams(payload));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

