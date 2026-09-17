import { EUNOIA_CONFIG } from "../apiConfig";
import store from "../../store/index";
import { EUNOIA_APIV4_CONNECTOR } from "./apiV4Connector";

export const getLayer = async () => {
  try {
    const path = `/layer/${EUNOIA_CONFIG.brandCode}/type`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {}
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getStores = async (payload) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    let path = `/stores/${code}?`;
    if (isHQ) path = `/outlets/${code}?`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: payload
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPromotions = async (outletCode, promoCode) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/promotions/${code}`;
    if (outletCode) path = path + "/" + outletCode;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        code: promoCode
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOrders = async () => {
  try {
    let code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/orders/${code}`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
        pageSize: 100,
        sortOrder: "DESC",
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getBookings = async () => {
  try {
    let code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/orders/${code}/ticket`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
        pageSize: 100,
        sortOrder: "DESC",
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const completeEvent = async (number) => {
  try {
    let code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/order/${code}/completeEvent/${number}`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCashVouchers = async (payload) => {
  try {
    let code = "hq$" + EUNOIA_CONFIG.brandCode;
    var path = `/vouchers/${code}/bulkList`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        ...payload,
        authToken: store.getters.getEunoiaToken,
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const getBulkVoucherDetails = async (number) => {
  try {
    const code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/vouchers/${code}/bulkList`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
        number: number
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const getCashVoucherDetails = async (number) => {
  try {
    const code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/vouchers/${code}/details`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "GET",
      payload: {
        authToken: store.getters.getEunoiaToken,
        number: number
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const buyCashVoucher = async (payload) => {
  try {
    const code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/vouchers/${code}/purchase`;
    let params = {
      ...payload,
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken
    }
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      body: JSON.stringify(params)
    });
    
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const giftCashVoucher = async (payload) => {
  try {
    const code = "hq$" + EUNOIA_CONFIG.brandCode;
    const path = `/vouchers/${code}/gifts`;
    let params = {
      ...payload,
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken
    }
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      body: JSON.stringify(params)
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOutletDetails = async (outletCode) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    let path = `/stores/${code}?`;
    if (isHQ) path = `/outlet/hq$${code}/${outletCode}`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: {}
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
