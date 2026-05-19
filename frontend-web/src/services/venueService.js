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
  // Admin: xác minh sân
  verifyVenue: async (venueId) => {
    const response = await apiClient.put(`/venues/${venueId}/verify`);
    return mapWithVerified(response.data);
  },
  // Admin: xóa sân
  deleteVenue: async (venueId) => {
    await apiClient.delete(`/venues/${venueId}`);
    return venueId;
  },
  // Tìm sân theo vị trí
  getNearbyVenues: async (lat, lng, maxDistance = 5000) => {
    const response = await apiClient.get("/venues/nearby", {
      params: { lat, lng, maxDistance },
    });
    return mapWithVerified(response.data);
  },
};

export default venueService;
