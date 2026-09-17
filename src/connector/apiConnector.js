import store from "@/store";
import axios from "axios";
import router from "../router";
import { BFM_CONFIG, EUNOIA_CONFIG } from "./apiConfig";

// TODO: refactor this
export const EUNOIA_API_CONNECTOR = (options) => {
  let params = {
    authToken: options.authToken ? options.authToken : undefined,
    app: options.app ? EUNOIA_CONFIG.app : undefined,
  };
  if (options.extraPayload) {
    params = {
      ...params,
      ...options.extraPayload,
    };
  }
  let mainUrl = EUNOIA_CONFIG.baseUrl;
  let baseUrl = mainUrl.substring(0, mainUrl.lastIndexOf("/"));
  let apiVersion = mainUrl.substring(mainUrl.lastIndexOf("/") + 1);
  if (options.apiVersion) apiVersion = options.apiVersion;
  let api = axios.create({
    baseURL: `${baseUrl}/${apiVersion}`,
    params: params,
    headers: options.headers,
  });

  const post = (endpoint, data = undefined, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .post(endpoint, data, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };
  const put = (endpoint, data = undefined, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .put(endpoint, data, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };

  const get = (endpoint, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .get(endpoint, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };

  const remove = async (endpoint, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .delete(endpoint, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };
  return {
    get,
    post,
    remove,
    put,
  };
};

export const BFM_API_CONNECTOR = (options) => {
  var payload = {
    baseURL: `${BFM_CONFIG.baseUrl}`,
    params: {
      authToken: options.authToken ? options.authToken : undefined,
      account: options.account ? options.account : undefined,
      id: options.id ? options.id : undefined,
    },
  };
  if (options.data) payload.data = { body: JSON.stringify(options.data) };
  if (options.deleteCode) payload.params.deleteCode = options.deleteCode;
  const api = axios.create(payload);

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

  const post = (endpoint, data = undefined, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .post(endpoint, data, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };
  const put = (endpoint, data = undefined, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .put(endpoint, data, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };

  const get = (endpoint, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .get(endpoint, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };

  const remove = async (endpoint, config = undefined) => {
    return new Promise((resolve, reject) => {
      api
        .delete(endpoint, config)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((err) => reject(err));
    });
  };
  return {
    get,
    post,
    remove,
    put,
  };
};
