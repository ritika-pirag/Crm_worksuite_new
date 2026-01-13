import axiosInstance from './axiosInstance'

export const expensesAPI = {
  getAll: (params) => axiosInstance.get('/expenses', { params }),
  getById: (id, params) => axiosInstance.get(`/expenses/${id}`, { params }),
  create: (data) => axiosInstance.post('/expenses', data),
  update: (id, data, params) => axiosInstance.put(`/expenses/${id}`, data, { params }),
  delete: (id, params) => axiosInstance.delete(`/expenses/${id}`, { params }),
  approve: (id, params) => axiosInstance.post(`/expenses/${id}/approve`, {}, { params }),
  reject: (id, data, params) => axiosInstance.post(`/expenses/${id}/reject`, data, { params }),
}

