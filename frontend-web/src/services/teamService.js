import apiClient from "./apiClient";
import { mapWithVerified } from "./responseMapper";

const teamService = {
  getTeams: async (params = {}) => {
    const response = await apiClient.get("/teams", { params });
    return mapWithVerified(response.data);
  },
  getTeamById: async (id) => {
    const response = await apiClient.get(`/teams/${id}`);
    return mapWithVerified(response.data);
  },
  createTeam: async (payload) => {
    const response = await apiClient.post("/teams", payload);
    return mapWithVerified(response.data);
  },
  updateTeam: async (teamId, payload) => {
    const response = await apiClient.put(`/teams/${teamId}`, payload);
    return mapWithVerified(response.data);
  },
};

export default teamService;
