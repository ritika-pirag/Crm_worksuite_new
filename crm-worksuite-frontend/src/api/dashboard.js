import axiosInstance from './axiosInstance'

export const dashboardAPI = {
  // ===== ROLE-BASED DASHBOARD APIs =====
  
  // SuperAdmin Dashboard - Access to ALL data across system
  getSuperAdminStats: () => axiosInstance.get('/dashboard/superadmin'),
  
  // Admin Dashboard - Access to company data only
  getAdminStats: (params) => axiosInstance.get('/dashboard/admin', { params }),
  
  // Employee Dashboard - Access to own data only
  getEmployeeStats: (params) => axiosInstance.get('/dashboard/employee', { params }),
  
  // Client Dashboard - Access to own data only
  getClientStats: (params) => axiosInstance.get('/dashboard/client', { params }),
  getClientWork: (params) => axiosInstance.get('/dashboard/client/work', { params }),
  getClientFinance: (params) => axiosInstance.get('/dashboard/client/finance', { params }),
  getClientAnnouncements: (params) => axiosInstance.get('/dashboard/client/announcements', { params }),
  getClientActivity: (params) => axiosInstance.get('/dashboard/client/activity', { params }),
  
  // Generic dashboard (returns data based on user role from JWT)
  getAll: (params) => axiosInstance.get('/dashboard', { params }),
  
  // Todo operations (user-specific)
  saveTodo: (data) => axiosInstance.post('/dashboard/todo', data),
  updateTodo: (id, data) => axiosInstance.put(`/dashboard/todo/${id}`, data),
  deleteTodo: (id) => axiosInstance.delete(`/dashboard/todo/${id}`),
  
  // Sticky note operations (user-specific)
  saveStickyNote: (data) => axiosInstance.post('/dashboard/sticky-note', data),
}

