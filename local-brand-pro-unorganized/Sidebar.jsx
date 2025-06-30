import React from 'react';
import { FiHome, FiBriefcase, FiMapPin, FiGrid, FiLayers, FiBarChart2, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const { currentUser } = useAuth();
  
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <Logo size={24} />
            <span className="ml-2">LocalBrand Pro</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiHome className="sidebar-icon" />
                {!collapsed && <span>Dashboard</span>}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/businesses" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiBriefcase className="sidebar-icon" />
                {!collapsed && <span>Businesses</span>}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/locations" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiMapPin className="sidebar-icon" />
                {!collapsed && <span>Locations</span>}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/templates" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiGrid className="sidebar-icon" />
                {!collapsed && <span>Templates</span>}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/designs" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiLayers className="sidebar-icon" />
                {!collapsed && <span>Designs</span>}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/analytics" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiBarChart2 className="sidebar-icon" />
                {!collapsed && <span>Analytics</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-divider"></div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiSettings className="sidebar-icon" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/help" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                <FiHelpCircle className="sidebar-icon" />
                {!collapsed && <span>Help</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{currentUser?.displayName || 'User'}</p>
              <p className="sidebar-user-role">Pro Account</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
