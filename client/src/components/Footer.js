import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>Australian Healthcare</h3>
            <p>
              Connecting patients with quality healthcare providers across Australia.
              Book appointments, manage medical records, and access healthcare services online.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/find-doctor">Find a Doctor</Link></li>
              <li><Link to="/find-hospital">Find a Hospital</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>For Patients</h4>
            <ul className="footer-links">
              <li><Link to="/patient/appointments">Book Appointment</Link></li>
              <li><Link to="/patient/medical-records">Medical Records</Link></li>
              <li><Link to="/patient/prescriptions">Prescriptions</Link></li>
              <li><Link to="/patient/billing">Billing</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Information</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Australian Healthcare Management System. All rights reserved.</p>
          <p>
            <small>
              Medicare compliant | AHPRA verified | PBS integrated
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
