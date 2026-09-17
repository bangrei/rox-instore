import { EUNOIA_API_CONNECTOR } from "./apiConnector";
import { EUNOIA_CONFIG } from "./apiConfig";
import store from "../store/index";

export const getLayer = async () => {
  const path = `/layer/${EUNOIA_CONFIG.brandCode}/type`;
  const { get } = EUNOIA_API_CONNECTOR({});
  try {
    const data = await get(path);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getStores = async (payload) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  let path = `/stores/${code}?`;
  if (isHQ) path = `/outlets/${code}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
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

export const getPromotions = async (outletCode, promoCode) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/promotions/${code}`;
  if (outletCode) path = path + "/" + outletCode;
  var params = { app: EUNOIA_CONFIG.app };
  if (promoCode) params.extraPayload = { code: promoCode };
  try {
    const { get } = EUNOIA_API_CONNECTOR(params);
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOrders = async () => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  const authToken = store.getters.getEunoiaToken;
  const path = `/orders/${code}`;
  const params = {
    extraPayload: {
      pageSize: 100,
      sortOrder: "DESC",
    },
    authToken: authToken,
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getBookings = async () => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  const authToken = store.getters.getEunoiaToken;
  const path = `/orders/${code}/ticket`;
  const params = {
    extraPayload: {
      pageSize: 100,
      sortOrder: "DESC",
    },
    authToken: authToken,
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const completeEvent = async (number) => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  const authToken = store.getters.getEunoiaToken;
  const path = `/order/${code}/completeEvent/${number}`;
  const params = {
    authToken: authToken,
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCashVouchers = async (payload) => {
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  var path = `/vouchers/${code}/bulkList`;
  var params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    extraPayload: payload,
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const getBulkVoucherDetails = async (number) => {
  const code = "hq$" + EUNOIA_CONFIG.brandCode;
  const path = `/vouchers/${code}/bulkList`;
  const params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    extraPayload: { number: number },
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const getCashVoucherDetails = async (number) => {
  const code = "hq$" + EUNOIA_CONFIG.brandCode;
  const path = `/vouchers/${code}/details`;
  const params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    extraPayload: { number: number },
  };
  const { get } = EUNOIA_API_CONNECTOR(params);
  try {
    const data = await get(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const buyCashVoucher = async (payload) => {
  const code = "hq$" + EUNOIA_CONFIG.brandCode;
  const path = `/vouchers/${code}/purchase`;
  const params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    ...payload,
  };
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(params),
    };
    const res = await fetch(`${EUNOIA_CONFIG.baseUrl}${path}`, options);
    const data = res.json();
    console.log(data);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const giftCashVoucher = async (payload) => {
  const code = "hq$" + EUNOIA_CONFIG.brandCode;
  const path = `/vouchers/${code}/gifts`;
  const params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    ...payload,
  };
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(params),
    };
    const res = await fetch(`${EUNOIA_CONFIG.baseUrl}${path}`, options);
    const data = res.json();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOutletDetails = async (outletCode) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  let path = `/stores/${code}?`;
  if (isHQ) path = `/outlet/hq$${code}/${outletCode}`;
  const { post } = EUNOIA_API_CONNECTOR({});
  const params = {
    app: EUNOIA_CONFIG.app,
  };
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
