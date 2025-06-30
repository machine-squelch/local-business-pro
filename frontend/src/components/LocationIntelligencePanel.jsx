import React from 'react';
import { FiMapPin } from 'react-icons/fi';

const LocationIntelligencePanel = ({ location, localIntelligence, onEnhance, loading }) => {
  return (
    <div className="location-intelligence-panel">
      <h2><FiMapPin className="panel-icon" /> Location Intelligence</h2>
      <p>Enhance your design with data-driven insights specific to your location.</p>
      <div className="intelligence-grid">
        <div className="info-card">
          <h4>Demographics</h4>
          <p>Tailor your message to the local population.</p>
        </div>
        <div className="info-card">
          <h4>Local Landmarks</h4>
          <p>Incorporate well-known local spots to build community connection.</p>
        </div>
        <div className="info-card">
          <h4>Weather & Seasons</h4>
          <p>Automatically adapt your designs to the current season or weather.</p>
        </div>
      </div>
      <button onClick={onEnhance} className="btn btn-primary mt-4" disabled={loading}>
        {loading ? 'Enhancing...' : 'Enhance with Location Data'}
      </button>
    </div>
  );
};

export default LocationIntelligencePanel;