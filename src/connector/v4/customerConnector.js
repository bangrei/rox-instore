import store from "../../store/index";
import { EUNOIA_CONFIG, BFM_CONFIG } from "../apiConfig";
import { BFM_APIV4_CONNECTOR, EUNOIA_APIV4_CONNECTOR } from "./apiV4Connector";

// https://app.swaggerhub.com/apis/mkhairul6/BetterForMe/1.0#/Customer/post_api_1_0_otp
export const sendOTP = async (email) => {
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/otp',
    requestMethod: 'POST',
    payload: {
      email: email,
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// https://app.swaggerhub.com/apis/mkhairul6/BetterForMe/1.0#/Customer/post_api_1_0_login
export const loginWithOTP = async (payload) => {
  try {
    const { post } = BFM_APIV4_CONNECTOR({
      target: '/login',
      requestMethod: 'POST',
      payload: payload
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const generateLoginToken = async (payload) => {
  try {
    const { post } = BFM_APIV4_CONNECTOR({
      target: `/otp/token?account=${BFM_CONFIG.accountCode}`,
      requestMethod: 'POST',
      payload: payload
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// https://app.swaggerhub.com/apis/mkhairul6/BetterForMe/1.0#/Customer/get_api_1_0_details
export const getDetails = async (overrideToken) => {
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/details',
    requestMethod: 'GET',
    payload: {
      authToken: overrideToken || store.getters.getToken,
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateDetails = async (payload) => {
  let token = store.getters.getToken;
  if(payload.token) {
    token = payload.token;
    delete payload.token;
  }
  const body = {
    authToken: token,
    body: JSON.stringify(payload)
  }
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/details/update',
    requestMethod: 'POST',
    payload: body
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateAvatar = async (avatar) => {
  let token = store.getters.getToken;
  const params = { avatar }
  const body = {
    authToken: token,
    body: JSON.stringify(params)
  }
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/details/changeAvatar',
    requestMethod: 'POST',
    payload: body
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateAddress = async (payload) => {
  const body = {
    authToken: store.getters.getToken,
    body: JSON.stringify(payload)
  }
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/customerAddress/save',
    requestMethod: 'POST',
    payload: body
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteAddress = async (id) => {
  const body = {
    authToken: store.getters.getToken,
    body: JSON.stringify({ addressId: id })
  }
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/customerAddress/delete',
    requestMethod: 'POST',
    payload: body
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// EU really needs to update their docs and API error message, app needs to be input for this API to work
// https://staging.eunoia.asia/docs/#register-a-customer
export const registerCustomer = async (payload) => {
  const { post } = BFM_APIV4_CONNECTOR({
    target: '/register',
    requestMethod: 'POST',
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
};

// https://staging.eunoia.asia/docs/#querying-whether-a-customer-is-registered
export const checkRegistration = async (email) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  const path = `/customer/registered/${code}`;
  const { post } = EUNOIA_APIV4_CONNECTOR({
    target: path,
    requestMethod: "POST",
    payload: {
      email: email
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getTransactionalPoints = async () => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  var path = `/customer/details/${code}`;
  const { post } = EUNOIA_APIV4_CONNECTOR({
    target: path,
    requestMethod: "GET",
    payload: {
      authToken: store.getters.getEunoiaToken,
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getEunoiaCustomerDetails = async () => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  var path = `/customer/details/${code}`;
  const { post } = EUNOIA_APIV4_CONNECTOR({
    target: path,
    requestMethod: "GET",
    payload: {
      authToken: store.getters.getEunoiaToken,
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteCustomerAccount = async () => {
  const { post } = BFM_APIV4_CONNECTOR({
    target: `/details/delete`,
    requestMethod: "GET",
    payload: {
      authToken: store.getters.getToken,
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const checkDeleteCustomerAccount = async (code) => {
  const { post } = BFM_APIV4_CONNECTOR({
    target: `/customer/deletedCustomer`,
    requestMethod: "GET",
    payload: {
      deleteCode: code,
      app: EUNOIA_CONFIG.app,
    }
  });
  try {
    const data = await post();
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
  const { post } = EUNOIA_APIV4_CONNECTOR({
    target: path,
    requestMethod: "GET",
    payload: {
      authToken: store.getters.getEunoiaToken,
      pageSize: _pageSize || 20,
      pageNumber: _pageNumber || 0,
      validOnly: true
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteCard = async (cardId) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/customer/deleteCardToken/${code}`;
  const { post } = EUNOIA_APIV4_CONNECTOR({
    target: path,
    requestMethod: "GET",
    payload: {
      id: cardId,
      authToken: store.getters.getEunoiaToken,
    }
  });
  try {
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
