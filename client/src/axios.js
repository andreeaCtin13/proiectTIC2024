import axios from "axios";
import router from "./router/index";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  sameSite: "lax",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("auth_token");
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  console.log("TOKEN IN INTERCEPTORS ", token);
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      router.push("/unauthorized");
    }
    return Promise.reject(error);
  }
);

export default instance;
