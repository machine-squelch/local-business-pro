import React, { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ReviewsPanel = ({ business }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!business) return;
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const res = await axios.get('/api/integrations/reviews', {
          headers: { 'x-auth-token': token },
          params: { businessName: business.name }
        });
        setReviews(res.data.reviews);
      } catch (err) {
        setError('Failed to load reviews. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [business, getToken]);

  return (
    <div className="reviews-panel panel-content">
      <h2 className="panel-title"><FiStar className="panel-icon" /> Customer Reviews</h2>
      {loading && <p>Loading reviews...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={index} className="review-card">
            <div className="review-header">
              <strong>{review.author}</strong>
              <span>{'⭐'.repeat(review.rating)}</span>
            </div>
            <p className="review-text">"{review.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPanel;
