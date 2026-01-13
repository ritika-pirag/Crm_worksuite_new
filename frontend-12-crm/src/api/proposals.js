import axiosInstance from './axiosInstance'

export const proposalsAPI = {
  getAll: (params) => axiosInstance.get('/proposals', { params }),
  getById: (id, params) => axiosInstance.get(`/proposals/${id}`, { params }),
  create: (data) => axiosInstance.post('/proposals', data),
  update: (id, data, params) => axiosInstance.put(`/proposals/${id}`, data, { params }),
  delete: (id, params) => axiosInstance.delete(`/proposals/${id}`, { params }),
  convertToInvoice: (id, data, params) => axiosInstance.post(`/proposals/${id}/convert-to-invoice`, data, { params }),
  getFilters: (params) => axiosInstance.get('/proposals/filters', { params }),
  updateStatus: (id, status, params) => axiosInstance.put(`/proposals/${id}/status`, { status }, { params }),
  duplicate: (id, params) => axiosInstance.post(`/proposals/${id}/duplicate`, {}, { params }),
  sendEmail: (id, data, params) => axiosInstance.post(`/proposals/${id}/send-email`, data, { params }),
  getPDF: (id, params) => axiosInstance.get(`/proposals/${id}/pdf`, { params, responseType: 'json' }),
}

