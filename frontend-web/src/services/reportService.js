import apiClient from "./apiClient";
import { mapWithVerified } from "./responseMapper";

const reportService = {
  getReports: async (params = {}) => {
    const response = await apiClient.get("/reports", { params });
    return mapWithVerified(response.data);
  },
  createReport: async (payload) => {
    const response = await apiClient.post("/reports", payload);
    return mapWithVerified(response.data);
  },
  reviewReport: async (reportId, payload) => {
    const response = await apiClient.put(`/reports/${reportId}/review`, payload);
    return mapWithVerified(response.data);
  },
  deleteReport: async (reportId) => {
    await apiClient.delete(`/reports/${reportId}`);
  },
};

export default reportService;
