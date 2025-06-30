// pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container text-center">
        <h1 className="text-gradient">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-gradient">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;