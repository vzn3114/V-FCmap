import apiClient from "./apiClient";

const matchService = {
  getMatches: async (params = {}) => {
    const response = await apiClient.get("/matches", { params });
    return response.data;
  },
  createMatch: async (payload) => {
    const response = await apiClient.post("/matches", payload);
    return response.data;
  },
  updateMatchResult: async (matchId, payload) => {
    const response = await apiClient.put(`/matches/${matchId}/result`, payload);
    return response.data;
  },
};

export default matchService;
