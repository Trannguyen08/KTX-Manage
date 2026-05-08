import { httpClient } from "./httpClient.js";

export const authApi = {
  login: (payload) => httpClient.post("/auth/login/", payload),
};
