import api from './api';

const doctorService = {
  // Get all doctors
  getDoctors: (params) => api.get('/api/doctors', { params }),

  // Get doctor by ID
  getDoctor: (id) => api.get(`/api/doctors/${id}`),

  // Search doctors
  searchDoctors: (params) => api.get('/api/doctors/search', { params }),

  // Get doctor availability
  getDoctorAvailability: (id, date) => api.get(`/api/doctors/${id}/availability`, { params: { date } }),

  // Get doctor schedule
  getDoctorSchedule: (id) => api.get(`/api/doctors/${id}/schedule`),

  // Get doctor's appointments
  getDoctorAppointments: (id, params) => api.get(`/api/doctors/${id}/appointments`, { params }),

  // Get doctor's patients
  getDoctorPatients: (id, params) => api.get(`/api/doctors/${id}/patients`, { params }),

  // Update doctor profile
  updateProfile: (id, data) => api.put(`/api/doctors/${id}`, data),

  // Get doctor statistics
  getDoctorStatistics: (id) => api.get(`/api/doctors/${id}/statistics`),

  // Start consultation
  startConsultation: (appointmentId) => api.put(`/api/appointments/${appointmentId}/start`),

  // Complete appointment
  completeAppointment: (appointmentId, data) => api.put(`/api/appointments/${appointmentId}/complete`, data),

  // Create prescription
  createPrescription: (data) => api.post('/api/prescriptions', data),

  // Create medical record
  createMedicalRecord: (data) => api.post('/api/medical-records', data),

  // Update medical record
  updateMedicalRecord: (id, data) => api.put(`/api/medical-records/${id}`, data),

  // Get patient medical history
  getPatientHistory: (patientId) => api.get(`/api/medical-records/patient/${patientId}/history`),

  // Check drug interactions
  checkDrugInteractions: (patientId, medications) =>
    api.post('/api/prescriptions/check-interactions', { patientId, newMedications: medications }),

  // Get patient details
  getPatientDetails: (patientId) => api.get(`/api/patients/${patientId}`),

  // Add allergy to patient
  addAllergy: (patientId, allergyData) => api.post(`/api/patients/${patientId}/allergies`, allergyData),

  // Add chronic condition
  addChronicCondition: (patientId, conditionData) =>
    api.post(`/api/patients/${patientId}/chronic-conditions`, conditionData),

  // Create billing
  createBilling: (data) => api.post('/api/billing', data)
};

export default doctorService;
