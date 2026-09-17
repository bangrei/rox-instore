const inFlightRequests = new Map();

const stableStringify = (value) => {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
};

export const buildRequestKey = (parts) => stableStringify(parts);

export const dedupeRequest = (key, execute) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const request = Promise.resolve()
    .then(execute)
    .finally(() => {
      inFlightRequests.delete(key);
    });
  inFlightRequests.set(key, request);
  return request;
};
