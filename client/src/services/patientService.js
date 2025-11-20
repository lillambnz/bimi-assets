import api from './api';

const patientService = {
  // Get current patient
  getMe: () => api.get('/api/patients/me'),

  // Update patient profile
  updateProfile: (data) => api.put('/api/patients/me', data),

  // Get patient appointments
  getAppointments: (params) => api.get('/api/appointments', { params }),

  // Get patient medical records
  getMedicalRecords: (params) => api.get('/api/medical-records', { params }),

  // Get patient prescriptions
  getPrescriptions: (params) => api.get('/api/prescriptions', { params }),

  // Get patient billing
  getBilling: (params) => api.get('/api/billing', { params }),

  // Book appointment
  bookAppointment: (data) => api.post('/api/appointments', data),

  // Cancel appointment
  cancelAppointment: (id, reason) => api.put(`/api/appointments/${id}/cancel`, { reason }),

  // Reschedule appointment
  rescheduleAppointment: (id, data) => api.put(`/api/appointments/${id}/reschedule`, data),

  // Get appointment details
  getAppointmentDetails: (id) => api.get(`/api/appointments/${id}`),

  // Get medical record details
  getMedicalRecordDetails: (id) => api.get(`/api/medical-records/${id}`),

  // Get prescription details
  getPrescriptionDetails: (id) => api.get(`/api/prescriptions/${id}`),

  // Get billing details
  getBillingDetails: (id) => api.get(`/api/billing/${id}`),

  // Make payment
  makePayment: (billingId, paymentData) => api.post(`/api/billing/${billingId}/payment`, paymentData),

  // Get upcoming appointments
  getUpcomingAppointments: () => api.get('/api/appointments/upcoming'),

  // Add review for doctor
  reviewDoctor: (doctorId, reviewData) => api.post(`/api/doctors/${doctorId}/reviews`, reviewData),

  // Add review for hospital
  reviewHospital: (hospitalId, reviewData) => api.post(`/api/hospitals/${hospitalId}/reviews`, reviewData)
};

export default patientService;
