import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiDownload, FiShare2, FiCopy, FiTrash2, FiEye, FiBarChart2, FiMapPin, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import LocationIntelligencePanel from '../components/LocationIntelligencePanel';
import ReviewsPanel from '../components/ReviewsPanel';
import AnalyticsPanel from '../components/AnalyticsPanel';
import ExportModal from '../components/ExportModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const DesignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getToken } = useAuth();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormats, setExportFormats] = useState([]);

  useEffect(() => {
    fetchDesign();
  }, [id]);

  const fetchDesign = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // In a real app, this would be an actual API call
      // For now, we'll simulate the API response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock design
      const mockDesign = generateMockDesign(id);
      setDesign(mockDesign);
      setExportFormats(mockDesign.exportFormats || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching design:', err);
      setError('Failed to load design. Please try again.');
      toast.error('Failed to load design');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/editor/${id}`);
  };

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Design duplicated successfully');
      navigate('/designs');
    } catch (err) {
      console.error('Error duplicating design:', err);
      toast.error('Failed to duplicate design');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    setShowExportModal(false);
    setExportLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      const newExport = {
        id: `export-${Date.now()}`,
        format,
        url: `https://localbrand.pro/exports/${id}-${format}-${Date.now()}.${format}`,
        size: Math.floor(Math.random() * 5000000) + 100000, // Random size between 100KB and 5MB
        createdAt: new Date()
      };
      
      setExportFormats([newExport, ...exportFormats]);
      setExportLoading(false);
      toast.success(`Design exported as ${format.toUpperCase()} successfully`);
    }, 2000);
  };

  const handleShare = () => {
    // Copy share link to clipboard
    const shareUrl = `${window.location.origin}/shared/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  const handleDelete = async () => {
    try {
      setShowDeleteModal(false);
      setLoading(true);
      const token = await getToken();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Design deleted successfully');
      navigate('/designs');
    } catch (err) {
      console.error('Error deleting design:', err);
      toast.error('Failed to delete design');
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update design status
      setDesign(prev => ({
        ...prev,
        status: 'published',
        analytics: {
          ...prev.analytics,
          lastPublishedAt: new Date()
        }
      }));
      
      toast.success('Design published successfully');
    } catch (err) {
      console.error('Error publishing design:', err);
      toast.error('Failed to publish design');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceWithLocation = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update design with location intelligence
      setDesign(prev => ({
        ...prev,
        localIntelligence: {
          demographicsApplied: true,
          weatherInfluenced: true,
          landmarksIncluded: ['Downtown', 'Central Park'],
          seasonalAdjustments: 'summer',
          localKeywords: [
            prev.location.address.city,
            prev.location.address.state,
            `${prev.location.address.city} ${prev.business.industry}`
          ]
        }
      }));
      
      toast.success('Design enhanced with location intelligence');
    } catch (err) {
      console.error('Error enhancing design:', err);
      toast.error('Failed to enhance design with location data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReviews = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update design with reviews
      setDesign(prev => ({
        ...prev,
        reviewsIncluded: [
          {
            source: 'Google',
            id: 'review-1',
            snippet: 'Amazing service! I was impressed with their attention to detail and professionalism.'
          },
          {
            source: 'Yelp',
            id: 'review-2',
            snippet: 'I\'ve been using them for years and they never disappoint. Best in the area!'
          }
        ]
      }));
      
      toast.success('Reviews added to design');
    } catch (err) {
      console.error('Error adding reviews:', err);
      toast.error('Failed to add reviews to design');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate mock design for demo purposes
  const generateMockDesign = (id) => {
    const categories = ['social_media', 'flyer', 'business_card', 'menu', 'promotion', 'advertisement', 'email'];
    const statuses = ['draft', 'published'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)); // Random date in last 90 days
    const updatedAt = new Date(Math.max(createdAt.getTime(), Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))); // Random date between createdAt and now
    
    return {
      id,
      name: `Coastal Cafe Summer Promotion`,
      description: `Summer promotional ${category} for Coastal Cafe's downtown location featuring seasonal menu items and local landmarks.`,
      category,
      status,
      business: {
        id: 'business-1',
        name: 'Coastal Cafe',
        industry: 'restaurant'
      },
      location: {
        id: 'location-1',
        name: 'Downtown',
        address: {
          street: '123 Main St',
          city: 'Oceanview',
          state: 'CA',
          zipCode: '92101',
          country: 'USA'
        },
        coordinates: [-117.161084, 32.715736]
      },
      template: {
        id: 'template-5',
        name: `Restaurant ${category.charAt(0).toUpperCase() + category.slice(1)} Template`,
        category,
        thumbnailUrl: `https://source.unsplash.com/300x200/?cafe,${category}`
      },
      thumbnailUrl: `https://source.unsplash.com/600x400/?cafe,summer`,
      adobeExpressData: {
        designId: `ae-${Math.random().toString(36).substring(2, 15)}`,
        editUrl: `https://express.adobe.com/design/${Math.random().toString(36).substring(2, 15)}`,
        previewUrl: `https://source.unsplash.com/1200x800/?cafe,summer`,
        lastSyncedAt: updatedAt
      },
      content: {
        variables: {
          businessName: 'Coastal Cafe',
          tagline: 'Fresh Ocean Flavors',
          primaryColor: '#00b4d8',
          secondaryColor: '#0077b6',
          fontFamily: 'Poppins'
        },
        customizations: {
          logoPosition: 'top-left',
          showAddress: true,
          showPhone: true,
          imageFilter: 'none'
        }
      },
      localIntelligence: null, // Will be populated when enhanced
      reviewsIncluded: null, // Will be populated when reviews are added
      analytics: {
        views: 342,
        shares: 28,
        clicks: 76,
        conversions: 12,
        lastPublishedAt: status === 'published' ? updatedAt : null
      },
      exportFormats: [
        {
          id: 'export-1',
          format: 'png',
          url: `https://localbrand.pro/exports/${id}-png-1623456789.png`,
          size: 2457600, // 2.4MB
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          id: 'export-2',
          format: 'pdf',
          url: `https://localbrand.pro/exports/${id}-pdf-1623456789.pdf`,
          size: 4251648, // 4.1MB
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ],
      dimensions: {
        width: 1200,
        height: 628,
        unit: 'px'
      },
      createdAt,
      updatedAt,
      createdBy: {
        id: 'user-1',
        name: 'John Doe'
      },
      updatedBy: {
        id: 'user-1',
        name: 'John Doe'
      }
    };
  };

  if (loading && !design) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchDesign}>
          Try Again
        </button>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="error-container">
        <p className="error-message">Design not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/designs')}>
          Back to Designs
        </button>
      </div>
    );
  }

  return (
    <div className="design-detail-page">
      <div className="page-header">
        <div>
          <h1>{design.name}</h1>
          <p className="design-meta">
            {design.category.charAt(0).toUpperCase() + design.category.slice(1)} • 
            Last updated {new Date(design.updatedAt).toLocaleDateString()} • 
            <span className={`status-badge status-${design.status}`}>
              {design.status.charAt(0).toUpperCase() + design.status.slice(1)}
            </span>
          </p>
        </div>
        
        <div className="page-actions">
          {design.status === 'draft' && (
            <button className="btn btn-primary" onClick={handlePublish} disabled={loading}>
              Publish
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleEdit} disabled={loading}>
            <FiEdit className="btn-icon" />
            Edit
          </button>
          <button className="btn btn-secondary" onClick={() => setShowExportModal(true)} disabled={loading || exportLoading}>
            <FiDownload className="btn-icon" />
            Export
          </button>
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle">
              More
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleShare}>
                <FiShare2 className="dropdown-icon" />
                Share
              </button>
              <button className="dropdown-item" onClick={handleDuplicate} disabled={loading}>
                <FiCopy className="dropdown-icon" />
                Duplicate
              </button>
              <button className="dropdown-item text-danger" onClick={() => setShowDeleteModal(true)}>
                <FiTrash2 className="dropdown-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="design-detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <FiEye className="tab-icon" />
          Preview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FiBarChart2 className="tab-icon" />
          Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
          disabled={!design.location}
        >
          <FiMapPin className="tab-icon" />
          Location Intelligence
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
          disabled={!design.location}
        >
          <FiStar className="tab-icon" />
          Reviews
        </button>
      </div>

      <div className="design-detail-content">
        {activeTab === 'preview' && (
          <div className="design-preview">
            <div className="design-preview-container">
              <img 
                src={design.adobeExpressData.previewUrl} 
                alt={design.name} 
                className="design-preview-image"
              />
            </div>
            <div className="design-info">
              <div className="design-info-section">
                <h3>Design Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Business</span>
                    <span className="info-value">{design.business.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{design.location ? design.location.name : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Template</span>
                    <span className="info-value">{design.template.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dimensions</span>
                    <span className="info-value">{`${design.dimensions.width} × ${design.dimensions.height} ${design.dimensions.unit}`}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Created</span>
                    <span className="info-value">{new Date(design.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Synced</span>
                    <span className="info-value">{new Date(design.adobeExpressData.lastSyncedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="design-info-section">
                <h3>Description</h3>
                <p>{design.description}</p>
              </div>
              
              {design.localIntelligence && (
                <div className="design-info-section">
                  <h3>Location Intelligence</h3>
                  <div className="tags-container">
                    {design.localIntelligence.demographicsApplied && <span className="tag">Demographics</span>}
                    {design.localIntelligence.weatherInfluenced && <span className="tag">Weather</span>}
                    {design.localIntelligence.seasonalAdjustments && <span className="tag">{design.localIntelligence.seasonalAdjustments}</span>}
                    {design.localIntelligence.landmarksIncluded && design.localIntelligence.landmarksIncluded.map(landmark => (
                      <span key={landmark} className="tag">{landmark}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {design.reviewsIncluded && (
                <div className="design-info-section">
                  <h3>Included Reviews</h3>
                  <div className="reviews-preview">
                    {design.reviewsIncluded.map(review => (
                      <div key={review.id} className="review-snippet">
                        <div className="review-source">{review.source}</div>
                        <p className="review-text">"{review.snippet}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="design-info-section">
                <h3>Previous Exports</h3>
                {exportFormats.length > 0 ? (
                  <div className="exports-list">
                    {exportFormats.map(exportItem => (
                      <div key={exportItem.id} className="export-item">
                        <div className="export-info">
                          <span className="export-format">{exportItem.format.toUpperCase()}</span>
                          <span className="export-date">{new Date(exportItem.createdAt).toLocaleDateString()}</span>
                          <span className="export-size">{(exportItem.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <a href={exportItem.url} download className="btn btn-sm btn-secondary">
                          <FiDownload className="btn-icon" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No exports yet. Click the Export button to create one.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel design={design} />
        )}

        {activeTab === 'location' && design.location && (
          <LocationIntelligencePanel 
            location={design.location} 
            localIntelligence={design.localIntelligence}
            onEnhance={handleEnhanceWithLocation}
            loading={loading}
          />
        )}

        {activeTab === 'reviews' && design.location && (
          <ReviewsPanel 
            location={design.location} 
            reviewsIncluded={design.reviewsIncluded}
            onAddReviews={handleAddReviews}
            loading={loading}
          />
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal 
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          loading={exportLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={design.name}
          itemType="design"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={loading}
        />
      )}
    </div>
  );
};

export default DesignDetail;
