import store from "../store/index";
import { EUNOIA_CONFIG } from "./apiConfig";
import { EUNOIA_API_CONNECTOR } from "./apiConnector";

export const getProductDetails = async (payload) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (payload.brandCode) code = payload.brandCode;
  if (isHQ) code = "hq$" + code;

  var path = `/menu/${code}?`;
  if (payload.storeId) path = `/menu/${code}/${payload.storeId}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
  };
  if (payload.productId) params.productId = payload.productId;
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getMenu = async (payload) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (payload.brandCode) code = payload.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/menu/${code}?`;
  if (payload.storeId) path = `/menu/${code}/${payload.storeId}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
  };
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const paymayaCreateCheckout = async (payload) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/paymaya/createCheckout/${code}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
  };
  params = {
    ...params,
    ...payload,
  };
  try {
    const data = await post(path, new URLSearchParams(params));
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
    let body = { 
      body : JSON.stringify(params)
    };
    let path = `/mayavault/savePay/${code}`;
    const { post } = EUNOIA_API_CONNECTOR({});
    const data = await post(path, new URLSearchParams(body));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getInventory = async (outletCode, productId, brandCode) => {
  // const isHQ = store.getters.isHQ;
  let code = "hq$" + EUNOIA_CONFIG.brandCode;
  // if(isHQ) code = store.getters.getCurrentStore.brandCode;
  var path = `/inventory/${code}?`;
  if(brandCode) {
    path = `/inventory/${brandCode}?`;
  }
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
    outlet: outletCode || "",
    productId: productId || "",
  };
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getFavorites = async () => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/customer/favourites/${code}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
    authToken: store.getters.getEunoiaToken,
  };
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const addFavorite = async (productId, variantId) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/customer/favourite/${code}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
    product: productId,
    authToken: store.getters.getEunoiaToken,
  };
  if (variantId) params.variant = variantId;
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const unFavorite = async (productId, variantId) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  if (isHQ) code = "hq$" + code;
  var path = `/customer/unfavourite/${code}?`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
    product: productId,
    authToken: store.getters.getEunoiaToken,
  };
  if (variantId) params.variant = variantId;
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const postOutletOrder = async (payload, outletCode) => {
  let hqCode = EUNOIA_CONFIG.brandCode + "$";
  var path = `/order/${hqCode}${outletCode}/outlet`;
  let orderData = payload;
  orderData.app = EUNOIA_CONFIG.app;
  orderData.authToken = store.getters.getEunoiaToken;
  let body = { body: JSON.stringify(orderData) };
  const { post } = EUNOIA_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(body));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const postOrder = async (payload) => {
  let code = EUNOIA_CONFIG.brandCode;
  var path = `/order/${code}`;
  let orderData = payload;
  orderData.app = EUNOIA_CONFIG.app;
  orderData.authToken = store.getters.getEunoiaToken;
  orderData.store = store.getters.getCurrentStore
    ? store.getters.getCurrentStore.id
    : "";
  let body = { body: JSON.stringify(orderData) };
  const { post } = EUNOIA_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(body));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOrder = async (number) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  const authToken = store.getters.getEunoiaToken;
  if (isHQ) {
    code = "hq$" + code;
  }
  var path = `/orders/${code}`;
  let params = {
    extraPayload: {
      number: number,
    },
    app: EUNOIA_CONFIG.app,
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

export const getCart = async (cartId, outletCode) => {
  const isHQ = store.getters.isHQ;
  let code = EUNOIA_CONFIG.brandCode;
  const authToken = store.getters.getEunoiaToken;
  if (isHQ) {
    if (outletCode) code = `${code}$${outletCode}`;
    else code = code + "$hq";
  }
  var path = `/order/${code}/cart`;
  let params = {
    cartId: cartId,
    app: EUNOIA_CONFIG.app,
  };
  if (authToken) params.authToken = authToken;
  const { post } = EUNOIA_API_CONNECTOR({});
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getDeliveryRegions = async () => {
  var path = `/delivery/regions/`;
  const { post } = EUNOIA_API_CONNECTOR({});
  var params = {
    app: EUNOIA_CONFIG.app,
  };
  try {
    const data = await post(path, new URLSearchParams(params));
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
