import apiClient from "./apiClient";
import { mapWithVerified } from "./responseMapper";

const authService = {
  login: async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    return mapWithVerified(response.data);
  },
  register: async (payload) => {
    const response = await apiClient.post("/auth/register", payload);
    return mapWithVerified(response.data);
  },
  me: async () => {
    const response = await apiClient.get("/auth/me");
    return mapWithVerified(response.data);
  },
  updateMe: async (payload) => {
    const response = await apiClient.put("/auth/me", payload);
    return mapWithVerified(response.data);
  },
};

export default authService;
