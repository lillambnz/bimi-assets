import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthPages.css';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'doctor' ? 'doctor' : 'patient';

  const [userType, setUserType] = useState(initialType);
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',

    // Patient specific
    medicareNumber: '',
    irnNumber: '',

    // Doctor specific
    ahpraNumber: '',
    medicareProviderNumber: '',
    specialty: ''
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender
    };

    if (userType === 'patient') {
      submitData.medicareNumber = formData.medicareNumber;
      submitData.irnNumber = formData.irnNumber;
      submitData.consentToTreat = true;
      submitData.consentToShareInfo = true;
      submitData.address = { state: 'NSW', country: 'Australia' };
      submitData.emergencyContact = { name: '', relationship: '', phone: '' };
    } else {
      submitData.ahpraNumber = formData.ahpraNumber;
      submitData.medicareProviderNumber = formData.medicareProviderNumber;
      submitData.specialty = formData.specialty;
      submitData.title = 'Dr';
      submitData.address = { state: 'NSW', country: 'Australia' };
      submitData.yearsOfExperience = 0;
      submitData.employmentStatus = 'full-time';
      submitData.qualifications = [];
      submitData.ahpraRegistrationExpiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    }

    const result = await register(submitData, userType);

    if (result.success) {
      toast.success('Registration successful!');
      if (userType === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/doctor/dashboard');
      }
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card auth-card-large">
            <h1>Create Account</h1>
            <p className="auth-subtitle">Join Australia's leading healthcare platform</p>

            <div className="user-type-selector">
              <button
                className={`user-type-btn ${userType === 'patient' ? 'active' : ''}`}
                onClick={() => setUserType('patient')}
              >
                Patient
              </button>
              <button
                className={`user-type-btn ${userType === 'doctor' ? 'active' : ''}`}
                onClick={() => setUserType('doctor')}
              >
                Doctor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="04XX XXX XXX"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {userType === 'patient' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Medicare Number</label>
                      <input
                        type="text"
                        name="medicareNumber"
                        className="form-control"
                        value={formData.medicareNumber}
                        onChange={handleChange}
                        placeholder="10 digits"
                        maxLength="10"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IRN</label>
                      <input
                        type="text"
                        name="irnNumber"
                        className="form-control"
                        value={formData.irnNumber}
                        onChange={handleChange}
                        placeholder="1 digit"
                        maxLength="1"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {userType === 'doctor' && (
                <>
                  <div className="form-group">
                    <label className="form-label">AHPRA Number</label>
                    <input
                      type="text"
                      name="ahpraNumber"
                      className="form-control"
                      value={formData.ahpraNumber}
                      onChange={handleChange}
                      placeholder="e.g., MED0123456789"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medicare Provider Number</label>
                    <input
                      type="text"
                      name="medicareProviderNumber"
                      className="form-control"
                      value={formData.medicareProviderNumber}
                      onChange={handleChange}
                      placeholder="e.g., 1234567AB"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialty</label>
                    <select
                      name="specialty"
                      className="form-control"
                      value={formData.specialty}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select specialty</option>
                      <option value="General Practice">General Practice</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Paediatrics">Paediatrics</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
