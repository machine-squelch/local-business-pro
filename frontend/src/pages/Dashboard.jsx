// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, api } = useAuth();
  const [stats, setStats] = useState({
    businesses: 0,
    locations: 0,
    designs: 0,
    templates: 0
  });
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [businessRes, locationRes, designRes, templateRes] = await Promise.all([
          api.get('/businesses'),
          api.get('/locations'),
          api.get('/designs?limit=5'),
          api.get('/templates?limit=1')
        ]);

        setStats({
          businesses: businessRes.data.businesses?.length || 0,
          locations: locationRes.data.locations?.length || 0,
          designs: designRes.data.designs?.length || 0,
          templates: templateRes.data.pagination?.total || 0
        });

        setRecentDesigns(designRes.data.designs || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [api]);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser?.firstName}!</h1>
        <p>Here's what's happening with your marketing materials</p>
      </div>

      <div className="dashboard-stats">
        <div className="row">
          <div className="col-3">
            <div className="stat-card">
              <h3>{stats.businesses}</h3>
              <p>Businesses</p>
              <Link to="/businesses" className="btn btn-secondary btn-sm">View All</Link>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-card">
              <h3>{stats.locations}</h3>
              <p>Locations</p>
              <Link to="/locations" className="btn btn-secondary btn-sm">View All</Link>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-card">
              <h3>{stats.designs}</h3>
              <p>Designs</p>
              <Link to="/designs" className="btn btn-secondary btn-sm">View All</Link>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-card">
              <h3>{stats.templates}</h3>
              <p>Templates</p>
              <Link to="/templates" className="btn btn-secondary btn-sm">Browse</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-header">
                <h3>Recent Designs</h3>
                <Link to="/designs" className="btn btn-primary">View All</Link>
              </div>
              <div className="card-body">
                {recentDesigns.length > 0 ? (
                  <div className="design-list">
                    {recentDesigns.map(design => (
                      <div key={design._id} className="design-item">
                        <div className="design-thumbnail">
                          <img src={design.adobeExpressData?.thumbnailUrl || '/placeholder-design.png'} alt={design.name} />
                        </div>
                        <div className="design-info">
                          <h4>{design.name}</h4>
                          <p>{design.category.replace('_', ' ')}</p>
                          <span className={`status ${design.status}`}>{design.status}</span>
                        </div>
                        <div className="design-actions">
                          <Link to={`/designs/${design._id}`} className="btn btn-secondary btn-sm">View</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No designs yet. <Link to="/templates">Create your first design</Link></p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions">
                  <Link to="/templates" className="action-btn">
                    <span>🎨</span>
                    <div>
                      <h4>Create Design</h4>
                      <p>Start with a template</p>
                    </div>
                  </Link>
                  <Link to="/businesses" className="action-btn">
                    <span>🏢</span>
                    <div>
                      <h4>Add Business</h4>
                      <p>Set up a new business</p>
                    </div>
                  </Link>
                  <Link to="/locations" className="action-btn">
                    <span>📍</span>
                    <div>
                      <h4>Add Location</h4>
                      <p>Add a business location</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;