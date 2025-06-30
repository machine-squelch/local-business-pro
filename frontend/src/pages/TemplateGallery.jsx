import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import apiConnector from '../services/apiConnector';
import { toast } from 'react-toastify';

const TemplateGallery = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'newest', 'name'
  const navigate = useNavigate();

  // Fetch templates and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const templatesData = await apiConnector.getTemplates();
        setTemplates(templatesData);
        
        // Extract unique categories from templates
        const uniqueCategories = [...new Set(templatesData.map(template => template.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        toast.error('Failed to load templates. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter and sort templates when dependencies change
  useEffect(() => {
    let result = [...templates];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(template => template.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(template => 
        template.name.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredTemplates(result);
  }, [templates, selectedCategory, searchQuery, sortBy]);

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    navigate(`/designs/new?templateId=${templateId}`);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle view change
  const toggleView = () => {
    setView(view === 'grid' ? 'list' : 'grid');
  };

  // Render loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="template-gallery-loading">
          <div className="spinner"></div>
          <h2>Loading Templates</h2>
          <p>Please wait while we fetch the latest templates...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="template-gallery">
        <div className="template-gallery-header">
          <h1>Template Gallery</h1>
          <p>Choose a template to start your design</p>
        </div>
        
        <div className="template-gallery-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="form-control"
            />
            <i className="icon-search"></i>
          </div>
          
          <div className="filter-options">
            <div className="category-filter">
              <label htmlFor="category-select">Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-control"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sort-filter">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
                className="form-control"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            
            <div className="view-toggle">
              <button
                className={`view-button ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
                title="Grid View"
              >
                <i className="icon-grid"></i>
              </button>
              <button
                className={`view-button ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
                title="List View"
              >
                <i className="icon-list"></i>
              </button>
            </div>
          </div>
        </div>
        
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <div className="no-templates-icon">
              <i className="icon-search"></i>
            </div>
            <h3>No templates found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`template-gallery-content ${view}`}>
            {filteredTemplates.map(template => (
              <div
                key={template._id}
                className="template-item"
                onClick={() => handleTemplateSelect(template._id)}
              >
                <div className="template-thumbnail">
                  <img src={template.thumbnail} alt={template.name} />
                  {template.premium && (
                    <span className="premium-badge">
                      <i className="icon-star"></i> Premium
                    </span>
                  )}
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <div className="template-meta">
                    <span className="template-category">
                      <i className="icon-folder"></i> {template.category}
                    </span>
                    <span className="template-usage">
                      <i className="icon-users"></i> {template.usageCount} uses
                    </span>
                  </div>
                  {view === 'list' && (
                    <p className="template-description">{template.description}</p>
                  )}
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="template-tag">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="template-tag more-tag">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="template-overlay">
                  <button className="btn-primary">
                    <i className="icon-edit"></i> Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="template-gallery-pagination">
          <button className="pagination-button" disabled>
            <i className="icon-chevron-left"></i> Previous
          </button>
          <div className="pagination-pages">
            <button className="pagination-page active">1</button>
            <button className="pagination-page">2</button>
            <button className="pagination-page">3</button>
            <span className="pagination-ellipsis">...</span>
            <button className="pagination-page">10</button>
          </div>
          <button className="pagination-button">
            Next <i className="icon-chevron-right"></i>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default TemplateGallery;
