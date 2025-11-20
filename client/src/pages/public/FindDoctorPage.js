import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import { toast } from 'react-toastify';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import './FindPages.css';

const FindDoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: '',
    state: '',
    suburb: '',
    bulkBilling: false,
    acceptingPatients: false
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const res = await doctorService.searchDoctors({ ...filters, ...searchFilters });
      setDoctors(res.data.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(filters);
  };

  if (loading) return <LoadingSpinner message="Loading doctors..." />;

  return (
    <div className="find-page">
      <div className="container">
        <div className="page-header">
          <h1>Find a Doctor</h1>
          <p>Search for AHPRA-verified doctors across Australia</p>
        </div>

        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <select name="specialty" className="form-control" onChange={handleFilterChange} value={filters.specialty}>
                <option value="">All Specialties</option>
                <option value="General Practice">General Practice</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Paediatrics">Paediatrics</option>
                <option value="Surgery">Surgery</option>
              </select>

              <select name="state" className="form-control" onChange={handleFilterChange} value={filters.state}>
                <option value="">All States</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="SA">SA</option>
                <option value="WA">WA</option>
                <option value="TAS">TAS</option>
                <option value="NT">NT</option>
                <option value="ACT">ACT</option>
              </select>

              <input
                type="text"
                name="suburb"
                className="form-control"
                placeholder="Suburb"
                onChange={handleFilterChange}
                value={filters.suburb}
              />

              <button type="submit" className="btn btn-primary">Search</button>
            </div>

            <div className="filter-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="bulkBilling"
                  checked={filters.bulkBilling}
                  onChange={handleFilterChange}
                />
                Bulk Billing
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acceptingPatients"
                  checked={filters.acceptingPatients}
                  onChange={handleFilterChange}
                />
                Accepting New Patients
              </label>
            </div>
          </form>
        </div>

        <div className="results-grid">
          {doctors.length === 0 ? (
            <div className="no-results">
              <p>No doctors found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            doctors.map(doctor => (
              <div key={doctor._id} className="result-card">
                <div className="doctor-header">
                  <h3>{doctor.title} {doctor.firstName} {doctor.lastName}</h3>
                  <div className="rating">
                    <FaStar /> {doctor.statistics?.patientSatisfactionRating || 0}
                  </div>
                </div>
                <p className="specialty">{doctor.specialty}</p>
                {doctor.primaryWorkplace && (
                  <p className="location">
                    <FaMapMarkerAlt /> {doctor.primaryWorkplace.name}
                  </p>
                )}
                <div className="doctor-tags">
                  {doctor.bulkBillingAvailable && <span className="badge badge-success">Bulk Billing</span>}
                  {doctor.acceptingNewPatients && <span className="badge badge-primary">Accepting Patients</span>}
                </div>
                <Link to={`/doctor/${doctor._id}`} className="btn btn-outline btn-sm">View Profile</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FindDoctorPage;
