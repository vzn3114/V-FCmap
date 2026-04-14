import apiClient from "./apiClient";

const venueService = {
  getVenues: async (filters = {}) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );
    const response = await apiClient.get("/venues", { params: cleaned });
    return response.data;
  },
  getVenueById: async (id) => {
    const response = await apiClient.get(`/venues/${id}`);
    return response.data;
  },
};

export default venueService;
