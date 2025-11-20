import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCalendar, FaFileMedical, FaPrescriptionBottle, FaMoneyBill, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isPatient, isDoctor, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-icon">🏥</span>
          <span className="brand-text">Australian Healthcare</span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/find-doctor" className="nav-link" onClick={closeMobileMenu}>
                Find a Doctor
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/find-hospital" className="nav-link" onClick={closeMobileMenu}>
                Find a Hospital
              </Link>
            </li>

            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                    Register
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && isPatient && (
              <>
                <li className="nav-item">
                  <Link to="/patient/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <span className="nav-link">My Health</span>
                  <div className="dropdown-menu">
                    <Link to="/patient/appointments" className="dropdown-item" onClick={closeMobileMenu}>
                      <FaCalendar /> Appointments
                    </Link>
                    <Link to="/patient/medical-records" className="dropdown-item" onClick={closeMobileMenu}>
                      <FaFilemedical /> Medical Records
                    </Link>
                    <Link to="/patient/prescriptions" className="dropdown-item" onClick={closeMobileMenu}>
                      <FaPrescriptionBottle /> Prescriptions
                    </Link>
                    <Link to="/patient/billing" className="dropdown-item" onClick={closeMobileMenu}>
                      <FaMoneyBill /> Billing
                    </Link>
                  </div>
                </li>
                <li className="nav-item">
                  <Link to="/patient/book-appointment" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
                    Book Appointment
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && isDoctor && (
              <>
                <li className="nav-item">
                  <Link to="/doctor/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/doctor/appointments" className="nav-link" onClick={closeMobileMenu}>
                    Appointments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/doctor/patients" className="nav-link" onClick={closeMobileMenu}>
                    Patients
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/doctor/schedule" className="nav-link" onClick={closeMobileMenu}>
                    Schedule
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && (
              <li className="nav-item dropdown">
                <span className="nav-link user-menu">
                  <FaUser /> {user?.name || 'Account'}
                </span>
                <div className="dropdown-menu dropdown-menu-right">
                  <Link
                    to={isPatient ? '/patient/profile' : '/doctor/profile'}
                    className="dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    <FaUser /> Profile
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
