import axiosInstance from './axiosInstance'

export const customFieldsAPI = {
  getAll: (params) => axiosInstance.get('/custom-fields', { params }),
  create: (data) => axiosInstance.post('/custom-fields', data),
}

