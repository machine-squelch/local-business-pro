import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiConnector from '../services/apiConnector';
import { toast } from 'react-toastify';

/**
 * ResponsiveDesignTester component provides tools for testing responsive design
 * across different device sizes and orientations
 */
const ResponsiveDesignTester = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');
  const [customWidth, setCustomWidth] = useState(375);
  const [customHeight, setCustomHeight] = useState(667);
  const navigate = useNavigate();

  // Device presets
  const devices = {
    desktop: { width: '100%', height: '100%', name: 'Desktop' },
    laptop: { width: '1366px', height: '768px', name: 'Laptop' },
    tablet: { width: '768px', height: '1024px', name: 'Tablet' },
    mobile: { width: '375px', height: '667px', name: 'Mobile' },
    custom: { width: `${customWidth}px`, height: `${customHeight}px`, name: 'Custom' }
  };

  // Toggle visibility of the tester panel
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Change device preset
  const changeDevice = (device) => {
    setCurrentDevice(device);
  };

  // Toggle orientation between portrait and landscape
  const toggleOrientation = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  // Apply custom dimensions
  const applyCustomDimensions = () => {
    setCurrentDevice('custom');
  };

  // Get current dimensions based on device and orientation
  const getCurrentDimensions = () => {
    const device = devices[currentDevice];
    
    if (currentDevice === 'desktop') {
      return { width: device.width, height: device.height };
    }
    
    if (orientation === 'portrait' || currentDevice === 'custom') {
      return { width: device.width, height: device.height };
    } else {
      // Swap width and height for landscape
      return { width: device.height, height: device.width };
    }
  };

  // Keyboard shortcut to toggle tester
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Shift + R to toggle responsive tester
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        toggleVisibility();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button 
        className="responsive-tester-toggle"
        onClick={toggleVisibility}
        title="Toggle Responsive Design Tester (Ctrl+Shift+R)"
      >
        <i className="icon-devices"></i>
      </button>
    );
  }

  const dimensions = getCurrentDimensions();

  return (
    <div className="responsive-tester">
      <div className="responsive-tester-header">
        <h3>Responsive Design Tester</h3>
        <div className="responsive-tester-controls">
          <div className="device-selector">
            {Object.keys(devices).map(device => (
              <button
                key={device}
                className={`device-button ${currentDevice === device ? 'active' : ''}`}
                onClick={() => changeDevice(device)}
              >
                {devices[device].name}
              </button>
            ))}
          </div>
          
          {currentDevice !== 'desktop' && (
            <button
              className="orientation-button"
              onClick={toggleOrientation}
              title="Toggle Orientation"
            >
              <i className={`icon-${orientation === 'portrait' ? 'mobile' : 'mobile-landscape'}`}></i>
              {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
            </button>
          )}
          
          {currentDevice === 'custom' && (
            <div className="custom-dimensions">
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                min="320"
                max="2560"
              />
              <span>×</span>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                min="320"
                max="2560"
              />
              <button onClick={applyCustomDimensions}>Apply</button>
            </div>
          )}
          
          <button
            className="close-button"
            onClick={toggleVisibility}
            title="Close Tester"
          >
            <i className="icon-x"></i>
          </button>
        </div>
      </div>
      
      <div className="responsive-tester-viewport" style={{
        width: dimensions.width,
        height: dimensions.height
      }}>
        <div className="viewport-content">
          {/* Current page content is rendered here */}
          <iframe
            src={window.location.href}
            title="Responsive Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
        
        <div className="viewport-info">
          {dimensions.width} × {dimensions.height} - {orientation}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDesignTester;
