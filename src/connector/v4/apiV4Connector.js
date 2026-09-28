import store from "@/store";
import axios from "axios";
import router from "../../router";
import { BFM_CONFIG, EUNOIA_CONFIG } from "../apiConfig";
import { buildRequestKey, dedupeRequest } from "../requestDeduper";
import CryptoJS from "crypto-js";

const REQUEST_TIMEOUT_MS = 60000;
const TIMEOUT_RETRY_LIMIT = 2;

const generateSignature = (payload) => {
  const signature = CryptoJS
      .HmacSHA256(JSON.stringify(payload), process.env.VUE_APP_SIGNATURE_KEY)
      .toString();
  return signature;
}

const isTimeoutError = (error) => {
  if (!error) return false;
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return true;
  return String(error.message || "").toLowerCase().includes("timeout");
};

const attachResponseInterceptors = (api) => {
  api.interceptors.response.use(
    (response) => {
      if (response.data.code && response.data.code === -3) {
        store.dispatch("clearSession");
        router.push({ name: "LoginPage" });
        return Promise.reject("Session Expired");
      }
      return response;
    },
    (error) => {
      const config = error.config;
      if (!config || !isTimeoutError(error)) {
        return Promise.reject(error);
      }
      config.__timeoutRetryCount = config.__timeoutRetryCount || 0;
      if (config.__timeoutRetryCount >= TIMEOUT_RETRY_LIMIT) {
        return Promise.reject(error);
      }
      config.__timeoutRetryCount += 1;
      return api.request(config);
    }
  );
};

export const EUNOIA_APIV4_CONNECTOR = (options) => {
  let params = {
    target: options.target,
    platform: "eunoia",
    method: options.requestMethod,
    payload: {
      ...options.payload,
      app: EUNOIA_CONFIG.app
    }
  };
  if(options.body){
    params = {
      target: options.target,
      platform: "eunoia",
      method: options.requestMethod,
      body: options.body
    }
  }
  let signature = generateSignature(params);
  let api = axios.create({
    baseURL: EUNOIA_CONFIG.gateway,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${signature}`
    },
  });

  attachResponseInterceptors(api);

  const post = () => {
    const key = buildRequestKey({
      gateway: EUNOIA_CONFIG.gateway,
      path: "/v4",
      params,
    });
    return dedupeRequest(key, () =>
      api.post("/v4", params).then((resp) => resp.data)
    );
  };
  const fileUpload = (form, payload) => {
    const sign = generateSignature(payload);
    return new Promise((resolve, reject) => {
      api
        .post("/eventReviews/upload", form, {
          headers: {
            "Authorization": `Bearer ${sign}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };
  return {
    post,
    fileUpload
  };
};

export const BFM_APIV4_CONNECTOR = (options) => {
  let params = {
    target: options.target,
    platform: "exp",
    method: options.requestMethod,
    payload: {
      ...options.payload,
      account: BFM_CONFIG.accountCode
    }
  }
  if(options.body){
    let body = JSON.parse(options.body.body);
    body = {
      ...body,
      account: BFM_CONFIG.accountCode
    }
    params = {
      target: options.target,
      platform: "exp",
      method: options.requestMethod,
      payload: {
        ...options.body,
        body: JSON.stringify(body)
      }
    }
  }
  let signature = generateSignature(params);
  const api = axios.create({
    baseURL: BFM_CONFIG.gateway,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${signature}`
    },
  });

  attachResponseInterceptors(api);

  const post = () => {
    const key = buildRequestKey({
      gateway: BFM_CONFIG.gateway,
      path: "/v4",
      params,
    });
    return dedupeRequest(key, () =>
      api.post("/v4", params).then((resp) => resp.data)
    );
  };
  return {
    post,
  };
};
