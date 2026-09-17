import store from "@/store";
import axios from "axios";
import router from "../../router";
import { BFM_CONFIG, EUNOIA_CONFIG } from "../apiConfig";
import CryptoJS from "crypto-js";

const generateSignature = (payload) => {
  const signature = CryptoJS
      .HmacSHA256(JSON.stringify(payload), process.env.VUE_APP_SIGNATURE_KEY)
      .toString();
  return signature;
}

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
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${signature}`
    },
  });

  // Add a response interceptor
  api.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data

      // fail code in BFM => -3
      if (response.data.code && response.data.code === -3) {
        store.dispatch("clearSession");
        router.push({ name: "LoginPage" });
        return Promise.reject("Session Expired");
      }
      return response;
    },
    (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    }
  );

  const post = () => {
    return new Promise((resolve, reject) => {
      api
        .post("/v4", params)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
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
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${signature}`
    },
  });

  // Add a response interceptor
  api.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data

      // fail code in BFM => -3
      if (response.data.code && response.data.code === -3) {
        store.dispatch("clearSession");
        router.push({ name: "LoginPage" });
        return Promise.reject("Session Expired");
      }
      return response;
    },
    (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    }
  );

  const post = () => {
    return new Promise((resolve, reject) => {
      api
        .post("/v4", params)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };
  return {
    post,
  };
};
