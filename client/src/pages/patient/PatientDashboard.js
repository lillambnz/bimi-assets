import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { FaCalendar, FaFileMedical, FaPrescriptionBottle, FaMoneyBill } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PatientPages.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [upcoming Appointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await patientService.getUpcomingAppointments();
      setUpcomingAppointments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="patient-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <Link to="/patient/book-appointment" className="btn btn-primary">Book Appointment</Link>
        </div>

        <div className="quick-links">
          <Link to="/patient/appointments" className="quick-link-card">
            <FaCalendar className="quick-link-icon" />
            <h3>Appointments</h3>
            <p>View and manage your appointments</p>
          </Link>
          <Link to="/patient/medical-records" className="quick-link-card">
            <FaFileMedical className="quick-link-icon" />
            <h3>Medical Records</h3>
            <p>Access your medical history</p>
          </Link>
          <Link to="/patient/prescriptions" className="quick-link-card">
            <FaPrescriptionBottle className="quick-link-icon" />
            <h3>Prescriptions</h3>
            <p>Manage your prescriptions</p>
          </Link>
          <Link to="/patient/billing" className="quick-link-card">
            <FaMoneyBill className="quick-link-icon" />
            <h3>Billing</h3>
            <p>View invoices and payments</p>
          </Link>
        </div>

        <div className="card">
          <div className="card-header">Upcoming Appointments</div>
          {upcomingAppointments.length === 0 ? (
            <p>No upcoming appointments</p>
          ) : (
            <div className="appointments-list">
              {upcomingAppointments.slice(0, 5).map(apt => (
                <div key={apt._id} className="appointment-item">
                  <div>
                    <strong>{new Date(apt.appointmentDate).toLocaleDateString()}</strong> at {apt.startTime}
                  </div>
                  <div>{apt.doctor?.firstName} {apt.doctor?.lastName}</div>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
