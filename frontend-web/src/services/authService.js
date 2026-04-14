import apiClient from "./apiClient";

const authService = {
  login: async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },
  register: async (payload) => {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

export default authService;
