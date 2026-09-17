const BASE_URL = "https://res.eunoia.asia/images/";

export const getImage = (code, { height, width } = {}) => {
  if (!height && !width) {
    return BASE_URL + code + "?width=800";
  } else {
    return BASE_URL + "?height=" + height + "&width=" + width + "/" + code;
  }
};
