import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiMapPin } from 'react-icons/fi';

const DesignCard = ({ design, viewMode }) => {
  if (!design) {
    return null;
  }

  const {
    id,
    name,
    thumbnailUrl,
    category,
    status,
    updatedAt,
    business,
    location,
  } = design;

  if (viewMode === 'list') {
    return (
      <div className="design-list-item">
        <img src={thumbnailUrl} alt={name} className="list-thumbnail" />
        <div className="list-item-details">
          <Link to={`/designs/${id}`}>
            <h3 className="list-item-title">{name}</h3>
          </Link>
          <p className="list-item-meta">
            <span>{category.replace('_', ' ')}</span> |
            <span className={`status-badge status-${status}`}>{status}</span> |
            <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="list-item-info">
            <span className="info-chip"><FiLayers size={14} /> {business.name}</span>
            {location && <span className="info-chip"><FiMapPin size={14} /> {location.name}</span>}
        </div>
        <div className="list-item-actions">
          <Link to={`/designs/${id}`} className="btn btn-sm btn-secondary">
            View
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="design-card">
      <Link to={`/designs/${id}`}>
        <div className="card-thumbnail">
          <img src={thumbnailUrl} alt={name} />
          <div className={`status-badge status-${status}`}>{status}</div>
        </div>
        <div className="card-content">
          <h3 className="card-title">{name}</h3>
          <p className="card-category">{category.replace('_', ' ')}</p>
          <div className="card-footer">
            <span className="card-business-name">{business.name}</span>
            <span className="card-date">{new Date(updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DesignCard;