import axios from "axios";

// axios 인스턴스 생성
const instance = axios.create({
  baseURL: "https://chargebuddy.digital",
  timeout: 5000, // 5초 타임아웃
});

// 응답 인터셉터 추가
instance.interceptors.response.use(
  (res) => {
    console.log("[응답 성공]", res);
    return res;
  },
  (err) => {
    console.error("[응답 에러]", err);
    return Promise.reject(err);
  }
);

export default instance;
