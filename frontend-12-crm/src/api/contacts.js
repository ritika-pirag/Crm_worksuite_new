import axiosInstance from './axiosInstance'

export const contactsAPI = {
  getAll: (params) => axiosInstance.get('/leads/contacts', { params }),
  getById: (id, params) => axiosInstance.get(`/leads/contacts/${id}`, { params }),
  create: (data, params) => axiosInstance.post('/leads/contacts', data, { params }),
  update: (id, data, params) => axiosInstance.put(`/leads/contacts/${id}`, data, { params }),
  delete: (id, params) => axiosInstance.delete(`/leads/contacts/${id}`, { params }),
}

