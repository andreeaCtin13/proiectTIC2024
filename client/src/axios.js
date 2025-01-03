import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  sameSite: "lax",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("auth_token");
  if (token) {
    config.headers.authorization = `${token}`;
  }
  return config;
});

export default instance;
