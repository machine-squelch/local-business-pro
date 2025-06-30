import React, { useState, useEffect } from 'react';
import { FiLayers, FiPlus, FiFilter, FiSearch, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import DesignCard from '../components/DesignCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DesignList = () => {
  const { currentUser, getToken } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    business: '',
    status: '',
    category: ''
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [businesses, setBusinesses] = useState([]);

  // Status and category options
  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'flyer', label: 'Flyer' },
    { value: 'business_card', label: 'Business Card' },
    { value: 'menu', label: 'Menu' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'email', label: 'Email' },
    { value: 'logo', label: 'Logo' },
    { value: 'brochure', label: 'Brochure' },
    { value: 'postcard', label: 'Postcard' },
    { value: 'banner', label: 'Banner' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchBusinesses();
    fetchDesigns();
  }, [filters]);

  const fetchBusinesses = async () => {
    try {
      const token = await getToken();
      
      // In a real app, this would be an actual API call
      // For now, we'll simulate the API response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate mock businesses
      const mockBusinesses = [
        { id: 'business-1', name: 'Coastal Cafe' },
        { id: 'business-2', name: 'Mountain View Spa' },
        { id: 'business-3', name: 'Urban Plumbing Services' },
        { id: 'business-4', name: 'Sunset Landscaping' }
      ];
      
      setBusinesses([{ id: '', name: 'All Businesses' }, ...mockBusinesses]);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      toast.error('Failed to load businesses');
    }
  };

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.business) params.append('business', filters.business);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      // In a real app, this would be an actual API call
      // For now, we'll simulate the API response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock designs
      const mockDesigns = generateMockDesigns(filters);
      setDesigns(mockDesigns);
      setError(null);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError('Failed to load designs. Please try again.');
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const filteredDesigns = designs.filter(design => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      design.name.toLowerCase().includes(query) ||
      design.description.toLowerCase().includes(query) ||
      design.business.name.toLowerCase().includes(query) ||
      (design.location && design.location.name.toLowerCase().includes(query))
    );
  });

  // Function to generate mock designs for demo purposes
  const generateMockDesigns = (filters) => {
    const designs = [];
    const categories = ['social_media', 'flyer', 'business_card', 'menu', 'promotion', 'advertisement', 'email'];
    const statuses = ['draft', 'published', 'archived'];
    const businessIds = ['business-1', 'business-2', 'business-3', 'business-4'];
    const businessNames = ['Coastal Cafe', 'Mountain View Spa', 'Urban Plumbing Services', 'Sunset Landscaping'];
    const locationIds = ['location-1', 'location-2', 'location-3', 'location-4'];
    const locationNames = ['Downtown', 'Westside', 'Northside', 'Eastside'];
    
    // Generate 15 designs
    for (let i = 1; i <= 15; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const businessIndex = Math.floor(Math.random() * businessIds.length);
      const businessId = businessIds[businessIndex];
      const businessName = businessNames[businessIndex];
      const hasLocation = Math.random() > 0.3; // 70% have a location
      const locationIndex = Math.floor(Math.random() * locationIds.length);
      const locationId = locationIds[locationIndex];
      const locationName = locationNames[locationIndex];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)); // Random date in last 90 days
      const updatedAt = new Date(Math.max(createdAt.getTime(), Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))); // Random date between createdAt and now
      
      const design = {
        id: `design-${i}`,
        name: `${businessName} ${category.charAt(0).toUpperCase() + category.slice(1)} ${i}`,
        description: `${status === 'published' ? 'Active' : status === 'draft' ? 'In-progress' : 'Archived'} ${category} design for ${businessName}.`,
        category,
        status,
        business: {
          id: businessId,
          name: businessName
        },
        location: hasLocation ? {
          id: locationId,
          name: locationName
        } : null,
        thumbnailUrl: `https://source.unsplash.com/300x200/?${category},business`,
        adobeExpressData: {
          designId: `ae-${Math.random().toString(36).substring(2, 15)}`,
          editUrl: `https://express.adobe.com/design/${Math.random().toString(36).substring(2, 15)}`,
          previewUrl: `https://source.unsplash.com/800x600/?${category},business`,
          lastSyncedAt: updatedAt
        },
        analytics: {
          views: Math.floor(Math.random() * 500),
          shares: Math.floor(Math.random() * 100),
          clicks: Math.floor(Math.random() * 200),
          conversions: Math.floor(Math.random() * 50),
          lastPublishedAt: status === 'published' ? updatedAt : null
        },
        createdAt,
        updatedAt
      };
      
      // Apply filters
      if (
        (filters.business && design.business.id !== filters.business) ||
        (filters.status && design.status !== filters.status) ||
        (filters.category && design.category !== filters.category)
      ) {
        continue;
      }
      
      designs.push(design);
    }
    
    // Sort designs by updated date (newest first)
    designs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return designs;
  };

  return (
    <div className="design-list-page">
      <div className="page-header">
        <div className="page-title">
          <FiLayers className="page-title-icon" />
          <h1>My Designs</h1>
        </div>
        <Link to="/templates" className="btn btn-primary">
          <FiPlus className="btn-icon" />
          <span>Create New Design</span>
        </Link>
      </div>

      <div className="design-list-controls">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="design-list-actions">
          <div className="filter-dropdown">
            <button className="btn btn-secondary" onClick={toggleFilters}>
              <FiFilter className="btn-icon" />
              <span>Filters</span>
              <FiChevronDown className={`dropdown-arrow ${filtersOpen ? 'open' : ''}`} />
            </button>
            
            {filtersOpen && (
              <div className="filter-dropdown-menu">
                <div className="filter-group">
                  <label className="filter-label">Business</label>
                  <select 
                    className="filter-select"
                    value={filters.business}
                    onChange={(e) => handleFilterChange('business', e.target.value)}
                  >
                    {businesses.map(business => (
                      <option key={business.id} value={business.id}>{business.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <select 
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {statuses.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <select 
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {categories.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <FiGrid />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={fetchDesigns}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {filteredDesigns.length === 0 ? (
            <div className="empty-state">
              <h3>No designs found</h3>
              <p>Try adjusting your filters or search query, or create a new design.</p>
              <Link to="/templates" className="btn btn-gradient mt-3">
                <FiPlus className="btn-icon" />
                <span>Create New Design</span>
              </Link>
            </div>
          ) : (
            <div className={`design-${viewMode}`}>
              {filteredDesigns.map(design => (
                <DesignCard 
                  key={design.id} 
                  design={design} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DesignList;
