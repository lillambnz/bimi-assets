import React from 'react';
import { useParams } from 'react-router-dom';

const DoctorProfilePage = () => {
  const { id } = useParams();
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card">
        <h1>Doctor Profile</h1>
        <p>View detailed doctor profile for ID: {id}</p>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
