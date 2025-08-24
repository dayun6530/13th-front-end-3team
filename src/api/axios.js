// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://chargebuddy.digital",
  timeout: 10000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const { config, response, message } = err || {};
    const url = `${config?.baseURL || ""}${config?.url || ""}`;
    const status = response?.status;
    // data가 문자열/Blob/객체 등 어떤 형태든 프린트 가능하게 가공
    let payload = response?.data;
    try {
      if (payload && typeof payload !== "string") {
        payload = JSON.stringify(payload);
      }
    } catch (_) {
      // stringify 실패시 원본 유지
    }
    console.error(
      `[응답 에러] ${config?.method?.toUpperCase()} ${url} -> ${
        status || "NO_STATUS"
      } | ${message || ""}\n` + `Response: ${payload || "(no body)"}`
    );
    return Promise.reject(err);
  }
);

export default instance;
