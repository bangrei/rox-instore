import store from "../../store/index";
import { EUNOIA_CONFIG } from "../apiConfig";
import { EUNOIA_APIV4_CONNECTOR } from "./apiV4Connector";

export const getProductDetails = async (payload) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (payload.brandCode) code = payload.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/menu/${code}?`;
    if (payload.storeId) path = `/menu/${code}/${payload.storeId}?`;
    let params = {
      app: EUNOIA_CONFIG.app,
    };
    if (payload.productId) params.productId = payload.productId;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: params
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getMenu = async (payload) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (payload.brandCode) code = payload.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/menu/${code}?`;
    if (payload.storeId) path = `/menu/${code}/${payload.storeId}?`;
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

export const paymayaCreateCheckout = async (payload) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/paymaya/createCheckout/${code}?`;
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

export const mayaVaultSaveCard = async (payload) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    const params = {
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken,
      ...payload,
    }
    /*let body = { 
      body : JSON.stringify(params)
    };*/
    let path = `/mayavault/saveCard/${code}`;
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

export const draftCashPayment = async (payload) => {
  try {
    /*const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;*/
    const params = {
      ...payload,
      authToken: store.getters.getEunoiaToken
    }
    let path = `/cash-payment/pay`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: params
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const mayaVaultCreatePayment = async (payload) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    const params = {
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken,
      ...payload,
    }
    /*let body = { 
      body : JSON.stringify(params)
    };*/
    let path = `/mayavault/savePay/${code}`;
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

export const getInventory = async (outletCode, productId, brandCode) => {
  try {
    let code = "hq$" + EUNOIA_CONFIG.brandCode;
    let path = `/inventory/${code}?`;
    if(brandCode) {
      path = `/inventory/${brandCode}?`;
    }
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: {
        authToken: store.getters.getEunoiaToken,
        outlet: outletCode || "",
        productId: productId || "",
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getFavorites = async () => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/customer/favourites/${code}?`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
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

export const addFavorite = async (productId, variantId) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/customer/favourite/${code}?`;
    let params = {
      app: EUNOIA_CONFIG.app,
      product: productId,
      authToken: store.getters.getEunoiaToken,
    };
    if (variantId) params.variant = variantId;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: params
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const unFavorite = async (productId, variantId) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) code = "hq$" + code;
    let path = `/customer/unfavourite/${code}?`;
    let params = {
      app: EUNOIA_CONFIG.app,
      product: productId,
      authToken: store.getters.getEunoiaToken,
    };
    if (variantId) params.variant = variantId;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: params
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const postOutletOrder = async (payload, outletCode) => {
  try {
    let hqCode = EUNOIA_CONFIG.brandCode + "$";
    let path = `/order/${hqCode}${outletCode}/outlet`;
    let params = {
      ...payload,
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken
    }
    let body = { body: JSON.stringify(params) };
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: body
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const postOrder = async (payload) => {
  try {
    let code = EUNOIA_CONFIG.brandCode;
    let path = `/order/${code}`;
    const params = {
      ...payload,
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken,
      store: store.getters.getCurrentStore?.id || ""
    }
    let body = { body: JSON.stringify(params) };
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: body
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOrder = async (number) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) {
      code = "hq$" + code;
    }
    let path = `/orders/${code}`;
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

export const getCart = async (cartId, outletCode) => {
  try {
    const isHQ = store.getters.isHQ;
    let code = EUNOIA_CONFIG.brandCode;
    if (isHQ) {
      if (outletCode) code = `${code}$${outletCode}`;
      else code = code + "$hq";
    }
    let path = `/order/${code}/cart`;
    const { post } = EUNOIA_APIV4_CONNECTOR({
      target: path,
      requestMethod: "POST",
      payload: {
        authToken: store.getters.getEunoiaToken,
        cartId: cartId
      }
    });
    const data = await post();
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getDeliveryRegions = async () => {
  try {
    var path = `/delivery/regions/`;
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

export const fetchProductsList = async (payload) => {
  try {
    const code = EUNOIA_CONFIG.brandCode;
    const path = `/product/filterProductsByHQ/${code}`;
    let params = {
      ...payload,
      app: EUNOIA_CONFIG.app,
      authToken: store.getters.getEunoiaToken,
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
