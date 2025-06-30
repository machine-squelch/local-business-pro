import { useState, useCallback } from 'react';
import axios from 'axios';

// In a real app, the API key would be handled securely on the backend.
// For this frontend simulation, we'll assume it's available as an environment variable.
const API_KEY = import.meta.env.VITE_ADOBE_EXPRESS_API_KEY;

const useAdobeExpressService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDesign = useCallback(async (templateId, variables) => {
    setLoading(true);
    setError(null);
    try {
      // This simulates a call to your backend, which would then call the Adobe API
      console.log('Simulating design creation with Adobe Express SDK...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockDesignData = {
        id: `ae-${Date.now()}`,
        editUrl: `https://express.adobe.com/design/mock-edit-url-${Date.now()}`,
        previewUrl: 'https://source.unsplash.com/800x600/?business,design',
      };

      return mockDesignData;
    } catch (err) {
      setError('Failed to create design.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createDesign, loading, error };
};

export default useAdobeExpressService;