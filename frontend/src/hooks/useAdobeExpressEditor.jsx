// Integration of Adobe Express SDK with DesignEditor component
// This file connects the DesignEditor.jsx component with the Adobe Express SDK

import React, { useEffect, useRef, useState } from 'react';
import apiConnector from './apiConnector';
import adobeExpressService from './adobeExpressService';
import locationIntelligenceService from './locationIntelligenceService';
import reviewIntegrationService from './reviewIntegrationService';

// Custom hook for Adobe Express SDK integration
export const useAdobeExpressEditor = (designId, locationId, businessId) => {
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize the editor
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        setLoading(true);
        
        // Load the Adobe Express SDK script if not already loaded
        if (!window.CCEverywhere) {
          await loadAdobeExpressSDK();
        }
        
        // Load design data if editing an existing design
        let designData = null;
        if (designId && designId !== 'new') {
          designData = await apiConnector.getDesign(designId);
          setDesign(designData);
        } else {
          // For new design, create a basic structure
          setDesign({
            name: 'Untitled Design',
            description: '',
            businessId,
            locationId,
            type: 'custom',
            status: 'draft'
          });
        }
        
        // Initialize the editor
        await createEditor(designData);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize Adobe Express editor:', err);
        setError('Failed to initialize design editor. Please try again.');
        setLoading(false);
      }
    };
    
    initializeEditor();
    
    // Cleanup function
    return () => {
      if (editorRef.current) {
        try {
          // Attempt to destroy the editor instance
          editorRef.current.destroy();
        } catch (err) {
          console.error('Error destroying Adobe Express editor:', err);
        }
        editorRef.current = null;
      }
    };
  }, [designId, locationId, businessId]);
  
  // Load the Adobe Express SDK script
  const loadAdobeExpressSDK = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.cc-embed.adobe.com/v2/CCEverywhere.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };
  
  // Create the Adobe Express editor instance
  const createEditor = async (designData) => {
    if (!window.CCEverywhere || !containerRef.current) return;
    
    try {
      const ccEverywhere = new window.CCEverywhere({
        clientId: process.env.REACT_APP_ADOBE_CLIENT_ID,
        appName: 'LocalBrand Pro',
        appVersion: { major: 1, minor: 0 },
        redirectUri: window.location.origin + '/auth/adobe/callback'
      });
      
      // Create the editor instance
      editorRef.current = await ccEverywhere.createDesignEditor({
        containerNode: containerRef.current,
        fullscreen: false,
        onLoad: handleEditorLoad,
        onError: handleEditorError,
        onAutoSave: handleAutoSave
      });
      
      // If editing existing design, load the content
      if (designData && designData.adobeExpressData) {
        await editorRef.current.loadDocument(designData.adobeExpressData);
      } else if (designData && designData.templateId) {
        // Load template if specified
        await editorRef.current.loadTemplate(designData.templateId);
      }
    } catch (err) {
      console.error('Error creating Adobe Express editor:', err);
      throw new Error('Failed to initialize Adobe Express Editor');
    }
  };
  
  // Handler for editor load event
  const handleEditorLoad = () => {
    console.log('Adobe Express Editor loaded successfully');
    setEditorReady(true);
    
    // Apply location intelligence if we have location data
    if (locationId) {
      applyLocationIntelligence(locationId);
    }
  };
  
  // Handler for editor error event
  const handleEditorError = (error) => {
    console.error('Adobe Express Editor error:', error);
    setError('An error occurred in the design editor. Please try again.');
  };
  
  // Handler for auto-save event from Adobe Express Editor
  const handleAutoSave = (documentData) => {
    setUnsavedChanges(true);
    
    // Store the latest document data
    setDesign(prevDesign => ({
      ...prevDesign,
      adobeExpressData: documentData
    }));
  };
  
  // Apply location intelligence to enhance the design
  const applyLocationIntelligence = async (locationId) => {
    if (!editorRef.current || !editorReady) return;
    
    try {
      // Get location intelligence data
      const locationData = await locationIntelligenceService.getLocationIntelligence(locationId);
      
      // Apply location-specific enhancements to the design
      // This is a simplified example - actual implementation would use Adobe Express SDK APIs
      
      // Example: Set location name in a text element
      if (locationData.name && editorRef.current.setText) {
        editorRef.current.setText('locationName', locationData.name);
      }
      
      // Example: Apply local color scheme based on location data
      if (locationData.intelligence?.colorScheme && editorRef.current.applyColorScheme) {
        editorRef.current.applyColorScheme(locationData.intelligence.colorScheme);
      }
      
      // Example: Add local landmarks or imagery
      if (locationData.intelligence?.landmarks && 
          locationData.intelligence.landmarks.length > 0 && 
          editorRef.current.addImages) {
        editorRef.current.addImages(locationData.intelligence.landmarks);
      }
    } catch (err) {
      console.error('Failed to apply location intelligence:', err);
      // Non-blocking error - the editor will still work without location enhancements
    }
  };
  
  // Apply review data to the design
  const applyReviewData = async (locationId, reviewIds) => {
    if (!editorRef.current || !editorReady) return;
    
    try {
      // Get reviews
      let reviews;
      if (reviewIds && reviewIds.length > 0) {
        reviews = await Promise.all(
          reviewIds.map(reviewId => 
            apiConnector.getReview(reviewId)
          )
        );
      } else {
        // If no specific reviews provided, get top reviews
        reviews = await reviewIntegrationService.getTopReviews(locationId, 3);
      }
      
      // Apply reviews to the design
      // This is a simplified example - actual implementation would use Adobe Express SDK APIs
      
      if (reviews && reviews.length > 0 && editorRef.current.addReviews) {
        editorRef.current.addReviews(reviews);
      }
    } catch (err) {
      console.error('Failed to apply review data:', err);
      // Non-blocking error - the editor will still work without review enhancements
    }
  };
  
  // Apply seasonal adjustments to the design
  const applySeasonalAdjustments = async (locationId) => {
    if (!editorRef.current || !editorReady) return;
    
    try {
      // Get location data
      const location = await apiConnector.getLocation(locationId);
      
      // Get seasonal data for the location
      const seasonalData = await locationIntelligenceService.getSeasonalData(location.coordinates);
      
      // Apply seasonal adjustments to the design
      // This is a simplified example - actual implementation would use Adobe Express SDK APIs
      
      if (seasonalData && editorRef.current.applySeasonalTheme) {
        editorRef.current.applySeasonalTheme(seasonalData);
      }
    } catch (err) {
      console.error('Failed to apply seasonal adjustments:', err);
      // Non-blocking error - the editor will still work without seasonal enhancements
    }
  };
  
  // Save the current design
  const saveDesign = async (designName, designDescription) => {
    if (!editorRef.current || !editorReady) {
      throw new Error('Editor not ready');
    }
    
    try {
      // Get the latest design data from the editor
      const documentData = await editorRef.current.getDocument();
      const thumbnail = await editorRef.current.createThumbnail();
      
      const designData = {
        ...design,
        name: designName || design.name,
        description: designDescription || design.description,
        adobeExpressData: documentData,
        thumbnail
      };
      
      let response;
      if (design._id) {
        // Update existing design
        response = await apiConnector.updateDesign(design._id, designData);
      } else {
        // Create new design
        response = await apiConnector.createDesign(designData);
      }
      
      setDesign(response);
      setUnsavedChanges(false);
      
      return response;
    } catch (err) {
      console.error('Failed to save design:', err);
      throw new Error('Failed to save design. Please try again.');
    }
  };
  
  // Export the design in various formats
  const exportDesign = async (format = 'png') => {
    if (!editorRef.current || !editorReady) {
      throw new Error('Editor not ready');
    }
    
    try {
      let exportedData;
      
      switch (format) {
        case 'png':
          exportedData = await editorRef.current.exportPNG();
          break;
        case 'jpg':
          exportedData = await editorRef.current.exportJPG();
          break;
        case 'pdf':
          exportedData = await editorRef.current.exportPDF();
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      return exportedData;
    } catch (err) {
      console.error(`Failed to export design as ${format}:`, err);
      throw new Error(`Failed to export design as ${format}. Please try again.`);
    }
  };
  
  return {
    design,
    loading,
    error,
    editorReady,
    unsavedChanges,
    containerRef,
    saveDesign,
    exportDesign,
    applyLocationIntelligence,
    applyReviewData,
    applySeasonalAdjustments
  };
};

export default useAdobeExpressEditor;
