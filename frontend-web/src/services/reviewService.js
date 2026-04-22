import apiClient from "./apiClient";
import { mapWithVerified } from "./responseMapper";

const reviewService = {
  getReviews: async (params = {}) => {
    const response = await apiClient.get("/reviews", { params });
    return mapWithVerified(response.data);
  },
  createReview: async (payload) => {
    const response = await apiClient.post("/reviews", payload);
    return mapWithVerified(response.data);
  },
  deleteReview: async (reviewId) => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },
};

export default reviewService;
