import apiClient from "./apiClient";

const bookingService = {
  getMyBookings: async () => {
    const response = await apiClient.get("/bookings/me");
    return response.data;
  },
  // Admin: lấy tất cả bookings
  getAllBookings: async (params = {}) => {
    const response = await apiClient.get("/bookings", { params });
    return response.data;
  },
  createBooking: async (payload) => {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  },
  checkInBooking: async (bookingId) => {
    const response = await apiClient.post(`/bookings/${bookingId}/checkin`);
    return response.data;
  },
  processPayment: async (bookingId, payload) => {
    const response = await apiClient.post(`/bookings/${bookingId}/payment`, payload);
    return response.data;
  },
  cancelBooking: async (bookingId, payload) => {
    const response = await apiClient.put(`/bookings/${bookingId}/cancel`, payload);
    return response.data;
  },
};

export default bookingService;
