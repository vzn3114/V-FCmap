import apiClient from "./apiClient";
import { mapWithVerified } from "./responseMapper";

const venueService = {
  getVenues: async (filters = {}) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );
    const response = await apiClient.get("/venues", { params: cleaned });
    return mapWithVerified(response.data);
  },
  getVenueById: async (id) => {
    const response = await apiClient.get(`/venues/${id}`);
    return mapWithVerified(response.data);
  },
  createVenue: async (payload) => {
    const response = await apiClient.post("/venues/owner", payload);
    return mapWithVerified(response.data);
  },
  updateVenue: async (venueId, payload) => {
    const response = await apiClient.put(`/venues/${venueId}`, payload);
    return mapWithVerified(response.data);
  },
};

export default venueService;
