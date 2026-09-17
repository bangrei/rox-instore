export const MockAPI = {
	url: "localhost:3000",
};

export const EUNOIA_CONFIG = {
	baseUrl: process.env.VUE_APP_EU_BE_API,
	gateway: process.env.VUE_APP_API_GATEWAY,
	brandCode: process.env.VUE_APP_EU_BE_BRAND_CODE,
	app: process.env.VUE_APP_EU_BE_APP_CODE,
};

export const BFM_CONFIG = {
	baseUrl: process.env.VUE_APP_BFM_BE_API,
	gateway: process.env.VUE_APP_API_GATEWAY,
	accountCode: process.env.VUE_APP_BFM_BE_ACCOUNT_CODE,
};

export const CLOUDINARY_CONFIG = {
  baseUrl: "https://res.eunoia.asia/images/",
};

export const HOST = {
	baseUrl: "https://localhost:8080",
};
