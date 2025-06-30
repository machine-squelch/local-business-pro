// pages/BusinessList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get('/businesses');
        setBusinesses(response.data.businesses);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [api]);

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="business-list-page">
      <div className="page-header">
        <h1>My Businesses</h1>
        <Link to="/businesses/new" className="btn btn-primary">Add Business</Link>
      </div>
      
      <div className="business-grid">
        {businesses.map(business => (
          <div key={business._id} className="card business-card">
            <div className="card-body">
              <h3>{business.name}</h3>
              <p>{business.description}</p>
              <span className="industry-tag">{business.industry}</span>
              <div className="card-actions">
                <Link to={`/businesses/${business._id}`} className="btn btn-secondary">View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {businesses.length === 0 && (
        <div className="empty-state">
          <h3>No businesses yet</h3>
          <p>Create your first business to get started</p>
          <Link to="/businesses/new" className="btn btn-primary">Add Business</Link>
        </div>
      )}
    </div>
  );
};

export default BusinessList;