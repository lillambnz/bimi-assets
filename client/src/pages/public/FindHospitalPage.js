import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hospitalService from '../../services/hospitalService';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import './FindPages.css';

const FindHospitalPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    facilityType: '',
    state: '',
    suburb: '',
    emergency: false,
    bulkBilling: false
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const res = await hospitalService.searchHospitals({ ...filters, ...searchFilters });
      setHospitals(res.data.data);
    } catch (error) {
      toast.error('Failed to load hospitals');
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
    fetchHospitals(filters);
  };

  if (loading) return <LoadingSpinner message="Loading hospitals..." />;

  return (
    <div className="find-page">
      <div className="container">
        <div className="page-header">
          <h1>Find a Hospital or Clinic</h1>
          <p>Locate healthcare facilities across Australia</p>
        </div>

        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <select name="facilityType" className="form-control" onChange={handleFilterChange} value={filters.facilityType}>
                <option value="">All Facilities</option>
                <option value="public-hospital">Public Hospital</option>
                <option value="private-hospital">Private Hospital</option>
                <option value="gp-clinic">GP Clinic</option>
                <option value="medical-centre">Medical Centre</option>
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
                  name="emergency"
                  checked={filters.emergency}
                  onChange={handleFilterChange}
                />
                Emergency Services
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="bulkBilling"
                  checked={filters.bulkBilling}
                  onChange={handleFilterChange}
                />
                Bulk Billing
              </label>
            </div>
          </form>
        </div>

        <div className="results-grid">
          {hospitals.length === 0 ? (
            <div className="no-results">
              <p>No hospitals found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            hospitals.map(hospital => (
              <div key={hospital._id} className="result-card">
                <h3>{hospital.name}</h3>
                <p className="facility-type">{hospital.facilityType.replace('-', ' ').toUpperCase()}</p>
                <p className="location">
                  <FaMapMarkerAlt /> {hospital.address.suburb}, {hospital.address.state} {hospital.address.postcode}
                </p>
                <p className="contact">
                  <FaPhone /> {hospital.phone}
                </p>
                <div className="hospital-tags">
                  {hospital.emergencyServices?.available && <span className="badge badge-danger">Emergency</span>}
                  {hospital.bulkBillingAvailable && <span className="badge badge-success">Bulk Billing</span>}
                </div>
                <Link to={`/hospital/${hospital._id}`} className="btn btn-outline btn-sm">View Details</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FindHospitalPage;
