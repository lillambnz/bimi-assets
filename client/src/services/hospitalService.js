import api from './api';

const hospitalService = {
  // Get all hospitals
  getHospitals: (params) => api.get('/api/hospitals', { params }),

  // Get hospital by ID
  getHospital: (id) => api.get(`/api/hospitals/${id}`),

  // Search hospitals
  searchHospitals: (params) => api.get('/api/hospitals/search', { params }),

  // Get hospital doctors
  getHospitalDoctors: (id) => api.get(`/api/hospitals/${id}/doctors`),

  // Get hospital statistics
  getHospitalStatistics: (id) => api.get(`/api/hospitals/${id}/statistics`)
};

export default hospitalService;
