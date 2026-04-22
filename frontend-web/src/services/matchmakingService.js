import apiClient from "./apiClient";

const matchmakingService = {
  sendChallenge: async (payload) => {
    const response = await apiClient.post("/matchmaking/challenge", payload);
    return response.data;
  },
};

export default matchmakingService;