import axiosInstance from './axiosInstance'

export const reportsAPI = {
  getSalesReport: (params) => axiosInstance.get('/reports/sales', { params }),
  getRevenueReport: (params) => axiosInstance.get('/reports/revenue', { params }),
  getProjectStatusReport: (params) => axiosInstance.get('/reports/projects', { params }),
  getEmployeePerformanceReport: (params) => axiosInstance.get('/reports/employees', { params }),
  getSummary: (params) => axiosInstance.get('/reports/summary', { params }),
}

