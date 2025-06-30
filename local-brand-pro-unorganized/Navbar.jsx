import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import { FiMenu, FiX, FiSun, FiMoon, FiBell, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar-container">
      <div className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="d-flex align-items-center">
            <Logo size={32} />
            <span className="ml-2 text-gradient">LocalBrand Pro</span>
          </Link>
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <div className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/businesses" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Businesses
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/locations" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Locations
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/templates" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Templates
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/designs" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Designs
              </Link>
            </li>
          </ul>

          <div className="navbar-actions">
            <button 
              className="navbar-action-btn" 
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            <div className="navbar-dropdown">
              <button 
                className="navbar-action-btn" 
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <FiBell size={20} />
                <span className="notification-badge">3</span>
              </button>

              {isNotificationsOpen && (
                <div className="dropdown-menu notifications-dropdown">
                  <h6 className="dropdown-header">Notifications</h6>
                  <div className="notification-item">
                    <div className="notification-icon success">
                      <span>✓</span>
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">Your design was successfully published</p>
                      <p className="notification-time">Just now</p>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon info">
                      <span>i</span>
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">New template available for your industry</p>
                      <p className="notification-time">2 hours ago</p>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon warning">
                      <span>!</span>
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">Your subscription will expire soon</p>
                      <p className="notification-time">3 days ago</p>
                    </div>
                  </div>
                  <div className="dropdown-footer">
                    <Link to="/notifications">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="navbar-dropdown">
              <button 
                className="navbar-action-btn profile-btn" 
                onClick={toggleProfile}
                aria-label="User profile"
              >
                <div className="profile-avatar">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <FiUser size={20} />}
                </div>
              </button>

              {isProfileOpen && (
                <div className="dropdown-menu profile-dropdown">
                  <div className="dropdown-header profile-header">
                    <div className="profile-avatar large">
                      {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <FiUser size={24} />}
                    </div>
                    <div className="profile-info">
                      <h6>{currentUser?.displayName || 'User'}</h6>
                      <p>{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
