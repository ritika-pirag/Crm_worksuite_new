import axiosInstance from './axiosInstance'

export const estimatesAPI = {
  getAll: (params) => axiosInstance.get('/estimates', { params }),
  getById: (id, params) => axiosInstance.get(`/estimates/${id}`, { params }),
  create: (data) => axiosInstance.post('/estimates', data),
  update: (id, data, params) => axiosInstance.put(`/estimates/${id}`, data, { params }),
  delete: (id, params) => axiosInstance.delete(`/estimates/${id}`, { params }),
  convertToInvoice: (id, data, params) => axiosInstance.post(`/estimates/${id}/convert-to-invoice`, data, { params }),
  sendEmail: (id, data, params) => axiosInstance.post(`/estimates/${id}/send-email`, data, { params }),
  updateStatus: (id, status, params) => axiosInstance.put(`/estimates/${id}/status`, { status }, { params }),
  duplicate: (id, params) => axiosInstance.post(`/estimates/${id}/duplicate`, {}, { params }),
  getPDF: (id, params) => axiosInstance.get(`/estimates/${id}/pdf`, { params, responseType: 'blob' }),
}

