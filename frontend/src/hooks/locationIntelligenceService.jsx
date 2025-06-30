import { useState, useCallback } from 'react';
import axios from 'axios';

const useLocationIntelligence = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async (location) => {
    setLoading(true);
    setError(null);
    try {
      // This simulates a call to your backend, which would then call location APIs
      console.log(`Fetching insights for:`, location);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockInsights = {
        demographics: { medianAge: 32, medianIncome: 65000 },
        weather: { current: 'Sunny, 85°F' },
        trending_topics: ['Summer specials', 'AC maintenance'],
        local_events: ['Austin Food & Wine Festival']
      };

      return mockInsights;
    } catch (err) {
      setError('Failed to fetch location insights.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchInsights, loading, error };
};

export default useLocationIntelligence;