import {
  getLayer,
  getStores,
  getPromotions,
  getOrders,
  getBookings,
  completeEvent,
  getCashVouchers,
  getCashVoucherDetails,
  getBulkVoucherDetails,
  buyCashVoucher,
  giftCashVoucher,
} from "@/connector/v4/storeConnector";

export default {
  getLayer: async () => {
    try {
      let result = await getLayer();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveStores: async () => {
    try {
      let result = await getStores();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrievePromotions: async () => {
    try {
      let result = await getPromotions();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveOrders: async () => {
    try {
      let result = await getOrders();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveBookings: async () => {
    try {
      let result = await getBookings();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  completeEvent: async (number) => {
    try {
      let result = await completeEvent(number);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveCashVouchers: async (payload) => {
    try {
      let result = await getCashVouchers(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveBulkVoucherDetails: async (number) => {
    try {
      let result = await getBulkVoucherDetails(number);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveCashVoucherDetails: async (number) => {
    try {
      let result = await getCashVoucherDetails(number);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  buyCashVoucher: async (payload) => {
    try {
      let result = await buyCashVoucher(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getFreeVoucher: async (payload) => {
    try {
      let result = await giftCashVoucher(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
