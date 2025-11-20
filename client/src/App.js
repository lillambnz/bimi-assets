import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import FindDoctorPage from './pages/public/FindDoctorPage';
import FindHospitalPage from './pages/public/FindHospitalPage';
import DoctorProfilePage from './pages/public/DoctorProfilePage';
import HospitalProfilePage from './pages/public/HospitalProfilePage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientBilling from './pages/patient/PatientBilling';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import PatientDetailPage from './pages/doctor/PatientDetailPage';
import CreatePrescription from './pages/doctor/CreatePrescription';
import CreateMedicalRecord from './pages/doctor/CreateMedicalRecord';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 200px)' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/find-doctor" element={<FindDoctorPage />} />
              <Route path="/find-hospital" element={<FindHospitalPage />} />
              <Route path="/doctor/:id" element={<DoctorProfilePage />} />
              <Route path="/hospital/:id" element={<HospitalProfilePage />} />

              {/* Patient Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <PrivateRoute role="patient">
                    <PatientDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <PrivateRoute role="patient">
                    <PatientAppointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/book-appointment"
                element={
                  <PrivateRoute role="patient">
                    <BookAppointment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/medical-records"
                element={
                  <PrivateRoute role="patient">
                    <PatientMedicalRecords />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/prescriptions"
                element={
                  <PrivateRoute role="patient">
                    <PatientPrescriptions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/billing"
                element={
                  <PrivateRoute role="patient">
                    <PatientBilling />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <PrivateRoute role="patient">
                    <PatientProfile />
                  </PrivateRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <PrivateRoute role="doctor">
                    <DoctorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <PrivateRoute role="doctor">
                    <DoctorAppointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <PrivateRoute role="doctor">
                    <DoctorPatients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/patients/:patientId"
                element={
                  <PrivateRoute role="doctor">
                    <PatientDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/prescriptions/create"
                element={
                  <PrivateRoute role="doctor">
                    <CreatePrescription />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/medical-records/create"
                element={
                  <PrivateRoute role="doctor">
                    <CreateMedicalRecord />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/schedule"
                element={
                  <PrivateRoute role="doctor">
                    <DoctorSchedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/profile"
                element={
                  <PrivateRoute role="doctor">
                    <DoctorProfile />
                  </PrivateRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
