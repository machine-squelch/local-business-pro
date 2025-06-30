import { useState, useEffect } from 'react';
import axios from 'axios';

const useReviewIntegration = (business) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    if (!business) return;

    setLoading(true);
    setError(null);
    try {
      // This would be a real API call in production
      // Simulating a fetch call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockReviews = [
        { id: 1, source: 'Google', rating: 5, text: 'Fantastic service and great results!' },
        { id: 2, source: 'Yelp', rating: 4, text: 'Very reliable and professional. Would recommend.' },
      ];
      setReviews(mockReviews);
    } catch (err) {
      setError('Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [business]);

  return { reviews, loading, error, refetch: fetchReviews };
};

export default useReviewIntegration;