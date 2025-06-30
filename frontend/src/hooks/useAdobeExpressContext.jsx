// Integration of Adobe Express SDK with the main application
// This file ensures proper initialization and configuration of the SDK

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context for Adobe Express SDK
const AdobeExpressContext = createContext(null);

// Provider component for Adobe Express SDK
export const AdobeExpressProvider = ({ children }) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const [ccEverywhere, setCCEverywhere] = useState(null);

  // Load the Adobe Express SDK
  useEffect(() => {
    const loadAdobeExpressSDK = async () => {
      try {
        // Check if SDK is already loaded
        if (window.CCEverywhere) {
          initializeSDK();
          return;
        }

        // Load the SDK script
        const script = document.createElement('script');
        script.src = 'https://sdk.cc-embed.adobe.com/v2/CCEverywhere.js';
        script.async = true;
        
        script.onload = () => {
          initializeSDK();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Adobe Express SDK:', error);
          setSdkError('Failed to load Adobe Express SDK. Please refresh the page and try again.');
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Adobe Express SDK:', error);
        setSdkError('An error occurred while loading the Adobe Express SDK.');
      }
    };

    // Initialize the SDK after loading
    const initializeSDK = () => {
      try {
        const ccSDK = new window.CCEverywhere({
          clientId: process.env.REACT_APP_ADOBE_CLIENT_ID,
          appName: 'LocalBrand Pro',
          appVersion: { major: 1, minor: 0 },
          redirectUri: window.location.origin + '/auth/adobe/callback'
        });
        
        setCCEverywhere(ccSDK);
        setSdkLoaded(true);
        console.log('Adobe Express SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Adobe Express SDK:', error);
        setSdkError('Failed to initialize Adobe Express SDK. Please check your credentials and try again.');
      }
    };

    loadAdobeExpressSDK();

    // Cleanup function
    return () => {
      // Any cleanup needed for the SDK
    };
  }, []);

  // Context value
  const contextValue = {
    sdkLoaded,
    sdkError,
    ccEverywhere,
    // Add additional methods as needed
    createDesignEditor: async (containerNode, options = {}) => {
      if (!sdkLoaded || !ccEverywhere) {
        throw new Error('Adobe Express SDK not loaded');
      }
      
      try {
        return await ccEverywhere.createDesignEditor({
          containerNode,
          ...options
        });
      } catch (error) {
        console.error('Failed to create design editor:', error);
        throw new Error('Failed to create design editor');
      }
    }
  };

  return (
    <AdobeExpressContext.Provider value={contextValue}>
      {children}
    </AdobeExpressContext.Provider>
  );
};

// Custom hook to use Adobe Express SDK
export const useAdobeExpress = () => {
  const context = useContext(AdobeExpressContext);
  
  if (!context) {
    throw new Error('useAdobeExpress must be used within an AdobeExpressProvider');
  }
  
  return context;
};

export default { AdobeExpressProvider, useAdobeExpress };
