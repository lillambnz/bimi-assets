import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaHospital, FaPrescriptionBottle, FaFileMedical, FaMoneyBillWave } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const features = [
    {
      icon: <FaCalendarAlt />,
      title: 'Book Appointments',
      description: 'Schedule appointments with GPs and specialists across Australia'
    },
    {
      icon: <FaUserMd />,
      title: 'Find Doctors',
      description: 'Search for AHPRA-verified doctors by specialty and location'
    },
    {
      icon: <FaHospital />,
      title: 'Find Hospitals',
      description: 'Locate hospitals and medical centres near you'
    },
    {
      icon: <FaPrescriptionBottle />,
      title: 'E-Prescriptions',
      description: 'Access and manage your prescriptions digitally'
    },
    {
      icon: <FaFileMedical />,
      title: 'Medical Records',
      description: 'Securely access your complete medical history'
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Medicare Integration',
      description: 'Bulk billing and Medicare rebate calculations'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Australian Healthcare Management System</h1>
            <p className="hero-subtitle">
              Your complete healthcare solution - Book appointments, manage medical records,
              and access quality healthcare services across Australia
            </p>
            <div className="hero-buttons">
              <Link to="/find-doctor" className="btn btn-primary btn-lg">
                Find a Doctor
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Complete Healthcare Management</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p>Create your account with your Medicare details</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Find Care</h3>
              <p>Search for doctors and healthcare facilities</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Book</h3>
              <p>Schedule appointments online or via telehealth</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Manage</h3>
              <p>Access records, prescriptions, and billing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <h3>5,000+</h3>
              <p>Registered Doctors</p>
            </div>
            <div className="stat">
              <h3>500+</h3>
              <p>Healthcare Facilities</p>
            </div>
            <div className="stat">
              <h3>100,000+</h3>
              <p>Patients Served</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of Australians managing their healthcare online</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Register as Patient
            </Link>
            <Link to="/register?type=doctor" className="btn btn-secondary btn-lg">
              Register as Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
