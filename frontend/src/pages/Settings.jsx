// pages/Settings.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { darkMode, toggleDarkMode, primaryColor, secondaryColor, setThemeColors, resetTheme } = useTheme();

  const handleColorChange = (type, color) => {
    if (type === 'primary') {
      setThemeColors(color, secondaryColor);
    } else {
      setThemeColors(primaryColor, color);
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        <h1>Settings</h1>
        
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <h3>Appearance</h3>
            </div>
            <div className="card-body">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  Dark Mode
                </label>
              </div>
              
              <div className="setting-item">
                <label htmlFor="primaryColor">Primary Color</label>
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="secondaryColor">Secondary Color</label>
                <input
                  type="color"
                  id="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                />
              </div>
              
              <button
                type="button"
                onClick={resetTheme}
                className="btn btn-secondary"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

// Placeholder pages for router completion
// pages/BusinessDetail.jsx, LocationList.jsx, LocationDetail.jsx, TemplateGallery.jsx, etc.
// can be created following similar patterns as above