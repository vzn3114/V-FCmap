import apiClient from "./apiClient";

const bookingService = {
  getMyBookings: async () => {
    const response = await apiClient.get("/bookings/me");
    return response.data;
  },
  createBooking: async (payload) => {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  },
  processPayment: async (bookingId, payload) => {
    const response = await apiClient.post(`/bookings/${bookingId}/payment`, payload);
    return response.data;
  },
};

export default bookingService;
