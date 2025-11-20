import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      {message && <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--gray-text)' }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
