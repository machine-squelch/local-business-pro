import React from 'react';
import { FiStar } from 'react-icons/fi';

const ReviewsPanel = ({ location, reviewsIncluded, onAddReviews, loading }) => {
  return (
    <div className="reviews-panel">
      <h2><FiStar className="panel-icon" /> Review Integration</h2>
      <p>Turn your best customer reviews into powerful marketing assets.</p>
      <button onClick={onAddReviews} className="btn btn-primary mt-4" disabled={loading}>
         {loading ? 'Adding Reviews...' : 'Add Top Reviews to Design'}
      </button>
    </div>
  );
};

export default ReviewsPanel;