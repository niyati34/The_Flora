import { useState, useEffect, useMemo } from "react";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import LazyImage from "./LazyImage";

export default function EnhancedProductComparison() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [selectedFeatures, setSelectedFeatures] = useState([
    'price', 'rating', 'care_level', 'size', 'light_requirements', 'water_needs'
  ]);
  const [viewMode, setViewMode] = useState('table'); // table, cards, detailed
  const [sortBy, setSortBy] = useState('name');
  const [showDifferences, setShowDifferences] = useState(false);

  // Available features for comparison
  const allFeatures = [
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'care_level', label: 'Care Level', type: 'text' },
    { key: 'size', label: 'Size', type: 'text' },
    { key: 'light_requirements', label: 'Light Requirements', type: 'text' },
    { key: 'water_needs', label: 'Water Needs', type: 'text' },
    { key: 'humidity', label: 'Humidity', type: 'text' },
    { key: 'temperature', label: 'Temperature', type: 'text' },
    { key: 'soil_type', label: 'Soil Type', type: 'text' },
    { key: 'fertilizer', label: 'Fertilizer', type: 'text' },
    { key: 'repotting', label: 'Repotting', type: 'text' },
    { key: 'propagation', label: 'Propagation', type: 'text' },
    { key: 'toxicity', label: 'Pet Safe', type: 'boolean' },
    { key: 'air_purifying', label: 'Air Purifying', type: 'boolean' },
    { key: 'blooming', label: 'Blooms', type: 'boolean' },
    { key: 'indoor_outdoor', label: 'Indoor/Outdoor', type: 'text' }
  ];

  // Mock product data with enhanced features
  const enhancedProducts = useMemo(() => {
    return compareItems.map(item => ({
      ...item,
      features: {
        price: item.price,
        rating: item.rating || 4.5,
        care_level: item.careLevel || 'Easy',
        size: item.size || 'Medium',
        light_requirements: item.lightRequirements || 'Bright Indirect',
        water_needs: item.waterNeeds || 'Moderate',
        humidity: item.humidity || 'Medium',
        temperature: item.temperature || '18-24°C',
        soil_type: item.soilType || 'Well-draining',
        fertilizer: item.fertilizer || 'Monthly',
        repotting: item.repotting || 'Every 2 years',
        propagation: item.propagation || 'Stem cuttings',
        toxicity: item.toxicity || false,
        air_purifying: item.airPurifying || true,
        blooming: item.blooming || false,
        indoor_outdoor: item.indoorOutdoor || 'Indoor'
      }
    }));
  }, [compareItems]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...enhancedProducts];
    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => a.features.price - b.features.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.features.rating - a.features.rating);
        break;
      case 'care_level':
        const careOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        sorted.sort((a, b) => careOrder[a.features.care_level] - careOrder[b.features.care_level]);
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [enhancedProducts, sortBy]);

  // Calculate differences between products
  const differences = useMemo(() => {
    if (sortedProducts.length < 2) return {};
    
    const diff = {};
    selectedFeatures.forEach(feature => {
      const values = sortedProducts.map(p => p.features[feature]);
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length > 1) {
        diff[feature] = {
          hasDifferences: true,
          values: values,
          bestValue: getBestValue(feature, values, sortedProducts)
        };
      }
    });
    return diff;
  }, [sortedProducts, selectedFeatures]);

  const getBestValue = (feature, values, products) => {
    switch (feature) {
      case 'price':
        return Math.min(...values);
      case 'rating':
        return Math.max(...values);
      case 'care_level':
        const careOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return Math.min(...values.map(v => careOrder[v]));
      default:
        return values[0]; // Default to first value
    }
  };

  const handleFeatureToggle = (featureKey) => {
    setSelectedFeatures(prev => 
      prev.includes(featureKey) 
        ? prev.filter(f => f !== featureKey)
        : [...prev, featureKey]
    );
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const formatFeatureValue = (feature, value) => {
    const featureConfig = allFeatures.find(f => f.key === feature);
    
    switch (featureConfig?.type) {
      case 'currency':
        return `₹${value}`;
      case 'rating':
        return `${value} ⭐`;
      case 'boolean':
        return value ? '✅ Yes' : '❌ No';
      default:
        return value;
    }
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      price: '💰',
      rating: '⭐',
      care_level: '🌱',
      size: '📏',
      light_requirements: '☀️',
      water_needs: '💧',
      humidity: '💨',
      temperature: '🌡️',
      soil_type: '🏺',
      fertilizer: '🌿',
      repotting: '🔄',
      propagation: '✂️',
      toxicity: '⚠️',
      air_purifying: '🫁',
      blooming: '🌸',
      indoor_outdoor: '🏠'
    };
    return icons[feature] || '📋';
  };

  if (compareItems.length === 0) {
    return (
      <div className="empty-comparison text-center py-5">
        <i className="fas fa-balance-scale fa-3x text-muted mb-3"></i>
        <h4>No products to compare</h4>
        <p className="text-muted">
          Add products to your comparison list to see detailed side-by-side analysis.
        </p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="enhanced-product-comparison">
      {/* Header Controls */}
      <div className="comparison-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h3 className="mb-0">
              <i className="fas fa-balance-scale text-primary me-2"></i>
              Product Comparison ({compareItems.length} items)
            </h3>
          </div>
          <div className="col-md-6 text-end">
            <div className="btn-group me-2" role="group">
              <button
                type="button"
                className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <i className="fas fa-table"></i> Table
              </button>
              <button
                type="button"
                className={`btn btn-outline-secondary ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <i className="fas fa-th"></i> Cards
              </button>
              <button
                type="button"
                className={`btn btn-outline-secondary ${viewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setViewMode('detailed')}
              >
                <i className="fas fa-list"></i> Detailed
              </button>
            </div>
            <button 
              className="btn btn-outline-danger"
              onClick={clearCompare}
            >
              <i className="fas fa-trash"></i> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Feature Selection */}
      <div className="feature-selection mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-cog me-2"></i>
              Select Features to Compare
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              {allFeatures.map(feature => (
                <div key={feature.key} className="col-md-3 col-sm-6 mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`feature-${feature.key}`}
                      checked={selectedFeatures.includes(feature.key)}
                      onChange={() => handleFeatureToggle(feature.key)}
                    />
                    <label className="form-check-label" htmlFor={`feature-${feature.key}`}>
                      {getFeatureIcon(feature.key)} {feature.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sorting and Filter Controls */}
      <div className="controls mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showDifferences"
                checked={showDifferences}
                onChange={(e) => setShowDifferences(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showDifferences">
                <i className="fas fa-highlighter me-2"></i>
                Highlight differences only
              </label>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <label className="form-label me-2">Sort by:</label>
            <select
              className="form-select d-inline-block w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="care_level">Care Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      {viewMode === 'table' && (
        <div className="comparison-table">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{width: '200px'}}>Features</th>
                  {sortedProducts.map(product => (
                    <th key={product.id} style={{width: '250px'}}>
                      <div className="product-header text-center">
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="product-thumbnail mb-2"
                        />
                        <h6 className="mb-1">{product.name}</h6>
                        <div className="product-actions">
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            View
                          </button>
                          <button
                            className={`btn btn-sm ${isInCart(product.id) ? 'btn-success' : 'btn-outline-success'} me-1`}
                            onClick={() => handleAddToCart(product)}
                          >
                            {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                          </button>
                          <button
                            className={`btn btn-sm ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleWishlistToggle(product)}
                          >
                            {isInWishlist(product.id) ? '❤️' : '🤍'}
                          </button>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-secondary mt-2"
                          onClick={() => removeFromCompare(product.id)}
                        >
                          <i className="fas fa-times"></i> Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedFeatures.map(feature => {
                  const featureConfig = allFeatures.find(f => f.key === feature);
                  const hasDifferences = differences[feature]?.hasDifferences;
                  
                  return (
                    <tr key={feature} className={showDifferences && !hasDifferences ? 'd-none' : ''}>
                      <td className="feature-name">
                        <strong>{getFeatureIcon(feature)} {featureConfig?.label}</strong>
                      </td>
                      {sortedProducts.map(product => (
                        <td 
                          key={product.id} 
                          className={`text-center ${hasDifferences ? 'highlight-difference' : ''}`}
                        >
                          {formatFeatureValue(feature, product.features[feature])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="comparison-cards">
          <div className="row">
            {sortedProducts.map(product => (
              <div key={product.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-header text-center">
                    <LazyImage
                      src={product.image}
                      alt={product.name}
                      className="product-image mb-2"
                    />
                    <h6 className="mb-1">{product.name}</h6>
                    <div className="product-price mb-2">
                      <span className="h5 text-primary">₹{product.features.price}</span>
                      {product.originalPrice && (
                        <span className="text-muted text-decoration-line-through ms-2">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="feature-list">
                      {selectedFeatures.map(feature => (
                        <div key={feature} className="feature-item d-flex justify-content-between mb-2">
                          <span className="text-muted">
                            {getFeatureIcon(feature)} {allFeatures.find(f => f.key === feature)?.label}
                          </span>
                          <span className="fw-bold">
                            {formatFeatureValue(feature, product.features[feature])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        View Details
                      </button>
                      <div className="btn-group">
                        <button
                          className={`btn btn-sm ${isInCart(product.id) ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                        </button>
                        <button
                          className={`btn btn-sm ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => handleWishlistToggle(product)}
                        >
                          {isInWishlist(product.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => removeFromCompare(product.id)}
                      >
                        Remove from Comparison
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="comparison-detailed">
          {sortedProducts.map(product => (
            <div key={product.id} className="product-detail-card mb-4">
              <div className="card">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <LazyImage
                        src={product.image}
                        alt={product.name}
                        className="product-image-large"
                      />
                    </div>
                    <div className="col-md-6">
                      <h5 className="mb-1">{product.name}</h5>
                      <div className="product-meta">
                        <span className="badge bg-primary me-2">₹{product.features.price}</span>
                        <span className="badge bg-success me-2">{product.features.rating} ⭐</span>
                        <span className="badge bg-info">{product.features.care_level}</span>
                      </div>
                    </div>
                    <div className="col-md-3 text-end">
                      <div className="btn-group-vertical">
                        <button
                          className="btn btn-outline-primary btn-sm mb-1"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          View Details
                        </button>
                        <button
                          className={`btn btn-sm mb-1 ${isInCart(product.id) ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                        </button>
                        <button
                          className={`btn btn-sm mb-1 ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => handleWishlistToggle(product)}
                        >
                          {isInWishlist(product.id) ? '❤️' : '🤍'}
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => removeFromCompare(product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    {selectedFeatures.map(feature => (
                      <div key={feature} className="col-md-4 mb-3">
                        <div className="feature-card">
                          <div className="feature-icon">
                            {getFeatureIcon(feature)}
                          </div>
                          <div className="feature-content">
                            <h6 className="feature-label">
                              {allFeatures.find(f => f.key === feature)?.label}
                            </h6>
                            <p className="feature-value mb-0">
                              {formatFeatureValue(feature, product.features[feature])}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Helper */}
      {sortedProducts.length >= 2 && (
        <div className="decision-helper mt-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Decision Helper
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Best Value for Money</h6>
                  <div className="recommendation">
                    {(() => {
                      const bestValue = sortedProducts.reduce((best, current) => 
                        (current.features.rating / current.features.price) > (best.features.rating / best.features.price) 
                          ? current : best
                      );
                      return (
                        <div className="d-flex align-items-center">
                          <LazyImage
                            src={bestValue.image}
                            alt={bestValue.name}
                            className="recommendation-image me-3"
                          />
                          <div>
                            <strong>{bestValue.name}</strong>
                            <br />
                            <small className="text-muted">
                              Best rating-to-price ratio
                            </small>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Easiest to Care For</h6>
                  <div className="recommendation">
                    {(() => {
                      const easiest = sortedProducts.find(p => p.features.care_level === 'Easy');
                      if (easiest) {
                        return (
                          <div className="d-flex align-items-center">
                            <LazyImage
                              src={easiest.image}
                              alt={easiest.name}
                              className="recommendation-image me-3"
                            />
                            <div>
                              <strong>{easiest.name}</strong>
                              <br />
                              <small className="text-muted">
                                Perfect for beginners
                              </small>
                            </div>
                          </div>
                        );
                      }
                      return <p className="text-muted">No easy-care plants in comparison</p>;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .enhanced-product-comparison {
          padding: 20px 0;
        }
        
        .comparison-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .feature-selection .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .comparison-table {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .product-header {
          padding: 15px;
        }
        
        .product-thumbnail {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .product-actions {
          margin: 10px 0;
        }
        
        .feature-name {
          background: #f8f9fa;
          font-weight: 600;
          vertical-align: middle;
        }
        
        .highlight-difference {
          background: #fff3cd;
          font-weight: 600;
        }
        
        .comparison-cards .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .comparison-cards .card:hover {
          transform: translateY(-2px);
        }
        
        .product-image {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .feature-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .product-detail-card .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .product-image-large {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .feature-card {
          display: flex;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          height: 100%;
        }
        
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
          width: 40px;
          text-align: center;
        }
        
        .feature-content {
          flex: 1;
        }
        
        .feature-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .feature-value {
          font-weight: 600;
          color: #333;
        }
        
        .decision-helper .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .recommendation {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .recommendation-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .empty-comparison {
          background: #f8f9fa;
          border-radius: 10px;
          border: 2px dashed #dee2e6;
        }
        
        .btn-group .btn.active {
          background-color: #007bff;
          border-color: #007bff;
          color: white;
        }
      `}</style>
    </div>
  );
}
