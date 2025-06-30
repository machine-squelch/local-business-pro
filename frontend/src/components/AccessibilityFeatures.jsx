import React, { useEffect } from 'react';

/**
 * AccessibilityFeatures component enhances the application with accessibility features
 * This component doesn't render any visible UI but adds keyboard navigation,
 * screen reader support, and other accessibility enhancements
 */
const AccessibilityFeatures = () => {
  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip navigation for users using Tab key
      if (e.key === 'Tab' && e.shiftKey) {
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink) {
          skipLink.focus();
        }
      }
      
      // Keyboard shortcuts for common actions
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            // Navigate to businesses
            e.preventDefault();
            window.location.href = '/businesses';
            break;
          case 'l':
            // Navigate to locations
            e.preventDefault();
            window.location.href = '/locations';
            break;
          case 'd':
            // Navigate to designs
            e.preventDefault();
            window.location.href = '/designs';
            break;
          case 't':
            // Navigate to templates
            e.preventDefault();
            window.location.href = '/templates';
            break;
          case 'n':
            // Create new design
            e.preventDefault();
            window.location.href = '/designs/new';
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Add skip navigation link
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-content';
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add role and aria attributes to main sections
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.setAttribute('role', 'main');
      mainContent.id = 'main-content';
      mainContent.setAttribute('tabindex', '-1');
    }
    
    const header = document.querySelector('.main-header');
    if (header) {
      header.setAttribute('role', 'banner');
    }
    
    const nav = document.querySelector('.main-nav');
    if (nav) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Main Navigation');
    }
    
    const footer = document.querySelector('.main-footer');
    if (footer) {
      footer.setAttribute('role', 'contentinfo');
    }
    
    // Add focus styles
    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary);
        color: white;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 0;
        outline: none;
      }
      
      /* High contrast mode support */
      @media (forced-colors: active) {
        .btn-primary, .btn-secondary, .btn-outline {
          border: 2px solid ButtonText;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const skipLinkElement = document.getElementById('skip-to-content');
      if (skipLinkElement) {
        skipLinkElement.remove();
      }
      style.remove();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default AccessibilityFeatures;
