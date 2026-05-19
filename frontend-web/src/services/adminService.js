import apiClient from "./apiClient";

/**
 * Admin-only API calls for user and system management.
 * All routes map to /api/admin/** which is protected by ADMIN role in SecurityConfig.
 */
const adminService = {
  // Lấy danh sách tất cả users (admin)
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  // Ban user
  banUser: async (userId, reason = "") => {
    const response = await apiClient.put(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  // Unban user
  unbanUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Cập nhật role user
  updateUserRole: async (userId, role) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Lấy tất cả bookings (admin)
  getAllBookings: async (params = {}) => {
    const response = await apiClient.get("/admin/bookings", { params });
    return response.data;
  },

  // Lấy thống kê tổng quan
  getStats: async () => {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },
};

export default adminService;
