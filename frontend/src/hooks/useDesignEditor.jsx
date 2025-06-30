import React, { useState, useEffect } from 'react';
import { useAdobeExpress } from './useAdobeExpressContext';

/**
 * Custom hook for integrating with Adobe Express SDK's design editor
 * Provides methods for creating, loading, and saving designs
 */
const useDesignEditor = (containerId, options = {}) => {
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [designState, setDesignState] = useState({
    isDirty: false,
    canUndo: false,
    canRedo: false,
  });
  
  const { sdkLoaded, sdkError, ccEverywhere, createDesignEditor } = useAdobeExpress();
  
  // Initialize the design editor when the SDK is loaded
  useEffect(() => {
    const initializeEditor = async () => {
      if (!sdkLoaded || !ccEverywhere) {
        return;
      }
      
      try {
        setLoading(true);
        
        const containerNode = document.getElementById(containerId);
        if (!containerNode) {
          throw new Error(`Container element with ID "${containerId}" not found`);
        }
        
        const editorInstance = await createDesignEditor({
          containerNode,
          ...options
        });
        
        // Set up event listeners
        editorInstance.on('dirty', (isDirty) => {
          setDesignState(prev => ({ ...prev, isDirty }));
        });
        
        editorInstance.on('historyStateChange', ({ canUndo, canRedo }) => {
          setDesignState(prev => ({ ...prev, canUndo, canRedo }));
        });
        
        setEditor(editorInstance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize design editor:', err);
        setError(err.message || 'Failed to initialize design editor');
        setLoading(false);
      }
    };
    
    initializeEditor();
    
    // Cleanup function
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [sdkLoaded, ccEverywhere, containerId, options, createDesignEditor]);
  
  // Handle SDK errors
  useEffect(() => {
    if (sdkError) {
      setError(sdkError);
      setLoading(false);
    }
  }, [sdkError]);
  
  // Create a new design
  const createNewDesign = async (templateId = null) => {
    if (!editor) return;
    
    try {
      setLoading(true);
      
      if (templateId) {
        await editor.loadTemplate(templateId);
      } else {
        await editor.createNew();
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to create new design:', err);
      setError(err.message || 'Failed to create new design');
      setLoading(false);
    }
  };
  
  // Load an existing design
  const loadDesign = async (designId) => {
    if (!editor) return;
    
    try {
      setLoading(true);
      await editor.loadDesign(designId);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load design:', err);
      setError(err.message || 'Failed to load design');
      setLoading(false);
    }
  };
  
  // Save the current design
  const saveDesign = async () => {
    if (!editor) return null;
    
    try {
      const result = await editor.save();
      setDesignState(prev => ({ ...prev, isDirty: false }));
      return result;
    } catch (err) {
      console.error('Failed to save design:', err);
      setError(err.message || 'Failed to save design');
      throw err;
    }
  };
  
  // Export the design as an image
  const exportAsImage = async (format = 'png') => {
    if (!editor) return null;
    
    try {
      return await editor.exportImage({ format });
    } catch (err) {
      console.error('Failed to export design as image:', err);
      setError(err.message || 'Failed to export design as image');
      throw err;
    }
  };
  
  // Apply location-specific enhancements to the design
  const applyLocationEnhancements = async (locationData) => {
    if (!editor) return;
    
    try {
      // Get current design elements
      const elements = await editor.getElements();
      
      // Find text elements that can be enhanced with location data
      const textElements = elements.filter(el => el.type === 'text');
      
      // Apply location-specific text replacements
      for (const element of textElements) {
        const text = element.props.text;
        
        // Replace placeholders with location data
        if (text.includes('{{location.name}}')) {
          await editor.updateElement(element.id, {
            props: {
              text: text.replace('{{location.name}}', locationData.name)
            }
          });
        }
        
        if (text.includes('{{location.address}}')) {
          await editor.updateElement(element.id, {
            props: {
              text: text.replace('{{location.address}}', locationData.address)
            }
          });
        }
        
        // Add more location-specific replacements as needed
      }
      
      // If there are image elements that should show location imagery
      const imageElements = elements.filter(el => el.type === 'image' && el.props.alt?.includes('location'));
      
      if (imageElements.length > 0 && locationData.images?.length > 0) {
        // Update the first location image placeholder with actual location image
        await editor.updateElement(imageElements[0].id, {
          props: {
            url: locationData.images[0],
            alt: `Image of ${locationData.name}`
          }
        });
      }
      
      return true;
    } catch (err) {
      console.error('Failed to apply location enhancements:', err);
      setError(err.message || 'Failed to apply location enhancements');
      return false;
    }
  };
  
  // Apply review content to the design
  const applyReviewContent = async (reviewData) => {
    if (!editor) return;
    
    try {
      // Get current design elements
      const elements = await editor.getElements();
      
      // Find text elements that can be enhanced with review data
      const textElements = elements.filter(el => el.type === 'text');
      
      // Apply review text replacements
      for (const element of textElements) {
        const text = element.props.text;
        
        // Replace placeholders with review data
        if (text.includes('{{review.text}}')) {
          await editor.updateElement(element.id, {
            props: {
              text: text.replace('{{review.text}}', reviewData.text)
            }
          });
        }
        
        if (text.includes('{{review.author}}')) {
          await editor.updateElement(element.id, {
            props: {
              text: text.replace('{{review.author}}', reviewData.author)
            }
          });
        }
        
        if (text.includes('{{review.rating}}')) {
          await editor.updateElement(element.id, {
            props: {
              text: text.replace('{{review.rating}}', '★'.repeat(reviewData.rating))
            }
          });
        }
      }
      
      return true;
    } catch (err) {
      console.error('Failed to apply review content:', err);
      setError(err.message || 'Failed to apply review content');
      return false;
    }
  };
  
  // Apply seasonal adjustments to the design
  const applySeasonalAdjustments = async (seasonData) => {
    if (!editor) return;
    
    try {
      // Get current design elements
      const elements = await editor.getElements();
      
      // Apply seasonal color scheme if available
      if (seasonData.colorScheme) {
        // Find background elements
        const bgElements = elements.filter(el => el.type === 'background' || el.type === 'shape');
        
        for (const element of bgElements) {
          // Only update elements with seasonal class or attribute
          if (element.props.className?.includes('seasonal') || element.props.id?.includes('seasonal')) {
            await editor.updateElement(element.id, {
              props: {
                fill: seasonData.colorScheme.background
              }
            });
          }
        }
        
        // Update text colors for seasonal elements
        const seasonalTextElements = elements.filter(
          el => el.type === 'text' && 
          (el.props.className?.includes('seasonal') || el.props.id?.includes('seasonal'))
        );
        
        for (const element of seasonalTextElements) {
          await editor.updateElement(element.id, {
            props: {
              color: seasonData.colorScheme.text
            }
          });
        }
      }
      
      // Replace seasonal imagery if available
      if (seasonData.imagery) {
        const seasonalImageElements = elements.filter(
          el => el.type === 'image' && 
          (el.props.className?.includes('seasonal') || el.props.id?.includes('seasonal'))
        );
        
        if (seasonalImageElements.length > 0) {
          await editor.updateElement(seasonalImageElements[0].id, {
            props: {
              url: seasonData.imagery,
              alt: `Seasonal image for ${seasonData.name}`
            }
          });
        }
      }
      
      return true;
    } catch (err) {
      console.error('Failed to apply seasonal adjustments:', err);
      setError(err.message || 'Failed to apply seasonal adjustments');
      return false;
    }
  };
  
  return {
    editor,
    loading,
    error,
    designState,
    createNewDesign,
    loadDesign,
    saveDesign,
    exportAsImage,
    applyLocationEnhancements,
    applyReviewContent,
    applySeasonalAdjustments
  };
};

export default useDesignEditor;
