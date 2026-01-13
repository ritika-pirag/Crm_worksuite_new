import axiosInstance from './axiosInstance'

export const clientsAPI = {
  getAll: (params) => axiosInstance.get('/clients', { params }),
  getById: (id, params) => axiosInstance.get(`/clients/${id}`, { params }),
  create: (data) => axiosInstance.post('/clients', data),
  update: (id, data) => axiosInstance.put(`/clients/${id}`, data),
  delete: (id, params) => axiosInstance.delete(`/clients/${id}`, { params }),
  getOverview: (params) => axiosInstance.get('/clients/overview', { params }),
  addContact: (id, data, params) => axiosInstance.post(`/clients/${id}/contacts`, data, { params }),
  getContacts: (id, params) => axiosInstance.get(`/clients/${id}/contacts`, { params }),
  getAllContacts: (params) => axiosInstance.get('/clients/contacts/all', { params }),
  updateContact: (clientId, contactId, data) => axiosInstance.put(`/clients/${clientId}/contacts/${contactId}`, data),
  deleteContact: (clientId, contactId) => axiosInstance.delete(`/clients/${clientId}/contacts/${contactId}`),

  // Label management
  getAllLabels: (params) => axiosInstance.get('/clients/labels', { params }),
  createLabel: (data) => axiosInstance.post('/clients/labels', data),
  deleteLabel: (label, params) => axiosInstance.delete(`/clients/labels/${encodeURIComponent(label)}`, { params }),
  updateClientLabels: (id, data, params) => axiosInstance.put(`/clients/${id}/labels`, data, { params }),
  getAllGroups: (params) => axiosInstance.get('/clients/groups', { params }),
}

