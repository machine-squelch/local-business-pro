import React, { useState, useEffect } from 'react';
import { FiGrid, FiFilter, FiSearch, FiChevronDown, FiStar, FiClock, FiTrendingUp } from 'react-icons/fi';
import TemplateCard from '../components/TemplateCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const TemplateGallery = () => {
  const { currentUser, getToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    category: '',
    season: ''
  });
  const [sortBy, setSortBy] = useState('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Industry and category options
  const industries = [
    { value: '', label: 'All Industries' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'salon', label: 'Salon & Beauty' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'auto_repair', label: 'Auto Repair' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'legal', label: 'Legal' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' }
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

  const seasons = [
    { value: '', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: <FiStar /> },
    { value: 'newest', label: 'Newest', icon: <FiClock /> },
    { value: 'trending', label: 'Trending', icon: <FiTrendingUp /> }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [filters, sortBy]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.category) params.append('category', filters.category);
      if (filters.season) params.append('season', filters.season);
      
      // In a real app, this would be an actual API call
      // For now, we'll simulate the API response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock templates
      const mockTemplates = generateMockTemplates(filters, sortBy);
      setTemplates(mockTemplates);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please try again.');
      toast.error('Failed to load templates');
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

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    // In a real app, this would navigate to the template detail page or open a modal
  };

  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Function to generate mock templates for demo purposes
  const generateMockTemplates = (filters, sortBy) => {
    const templates = [];
    const categories = ['social_media', 'flyer', 'business_card', 'menu', 'promotion', 'advertisement', 'email'];
    const industries = ['restaurant', 'retail', 'salon', 'plumbing', 'electrical', 'landscaping', 'auto_repair', 'fitness', 'healthcare', 'legal', 'real_estate'];
    
    // Generate 20 templates
    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const usageCount = Math.floor(Math.random() * 1000);
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)); // Random date in last 90 days
      
      const template = {
        id: `template-${i}`,
        name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)} Template ${i}`,
        description: `Professional ${category} template designed specifically for ${industry} businesses.`,
        category,
        industry,
        thumbnailUrl: `https://source.unsplash.com/300x200/?${category},${industry}`,
        previewUrl: `https://source.unsplash.com/800x600/?${category},${industry}`,
        isPremium: Math.random() > 0.7, // 30% are premium
        tags: [industry, category, 'professional', 'modern'],
        popularity: {
          usageCount,
          rating: 3 + Math.random() * 2
        },
        seasonality: {
          spring: Math.random() > 0.5,
          summer: Math.random() > 0.5,
          fall: Math.random() > 0.5,
          winter: Math.random() > 0.5
        },
        createdAt
      };
      
      // Apply filters
      if (
        (filters.industry && template.industry !== filters.industry) ||
        (filters.category && template.category !== filters.category) ||
        (filters.season && !template.seasonality[filters.season])
      ) {
        continue;
      }
      
      templates.push(template);
    }
    
    // Sort templates
    if (sortBy === 'popular') {
      templates.sort((a, b) => b.popularity.usageCount - a.popularity.usageCount);
    } else if (sortBy === 'newest') {
      templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'trending') {
      // For trending, we'll use a combination of recency and popularity
      templates.sort((a, b) => {
        const aScore = a.popularity.usageCount * (1 + 1 / (1 + (Date.now() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24)));
        const bScore = b.popularity.usageCount * (1 + 1 / (1 + (Date.now() - new Date(b.createdAt)) / (1000 * 60 * 60 * 24)));
        return bScore - aScore;
      });
    }
    
    return templates;
  };

  return (
    <div className="template-gallery-page">
      <div className="page-header">
        <div className="page-title">
          <FiGrid className="page-title-icon" />
          <h1>Template Gallery</h1>
        </div>
        <p className="page-description">
          Browse our collection of professionally designed templates optimized for local businesses.
        </p>
      </div>

      <div className="template-gallery-controls">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="template-gallery-actions">
          <div className="filter-dropdown">
            <button className="btn btn-secondary" onClick={toggleFilters}>
              <FiFilter className="btn-icon" />
              <span>Filters</span>
              <FiChevronDown className={`dropdown-arrow ${filtersOpen ? 'open' : ''}`} />
            </button>
            
            {filtersOpen && (
              <div className="filter-dropdown-menu">
                <div className="filter-group">
                  <label className="filter-label">Industry</label>
                  <select 
                    className="filter-select"
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                  >
                    {industries.map(option => (
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
                
                <div className="filter-group">
                  <label className="filter-label">Season</label>
                  <select 
                    className="filter-select"
                    value={filters.season}
                    onChange={(e) => handleFilterChange('season', e.target.value)}
                  >
                    {seasons.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="sort-dropdown">
            <label className="sort-label">Sort by:</label>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
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
          <button className="btn btn-primary" onClick={fetchTemplates}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <h3>No templates found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="template-grid">
              {filteredTemplates.map(template => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onClick={() => handleTemplateClick(template)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateGallery;
