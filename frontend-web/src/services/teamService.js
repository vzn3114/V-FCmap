import apiClient from "./apiClient";

const teamService = {
  getTeams: async (params = {}) => {
    const response = await apiClient.get("/teams", { params });
    return response.data;
  },
  getTeamById: async (id) => {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data;
  },
};

export default teamService;
