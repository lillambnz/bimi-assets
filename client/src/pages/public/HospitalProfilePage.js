import React from 'react';
import { useParams } from 'react-router-dom';

const HospitalProfilePage = () => {
  const { id } = useParams();
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card">
        <h1>Hospital Profile</h1>
        <p>View detailed hospital profile for ID: {id}</p>
      </div>
    </div>
  );
};

export default HospitalProfilePage;
