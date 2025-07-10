import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdvancedProductFilter({ products, onFilterChange, className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priceRange: [0, 10000],
    rating: 0,
    inStock: false,
    onSale: false,
    careLevel: "all",
    size: "all",
    petFriendly: false,
    airPurifying: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters = {
      search: params.get("search") || "",
      category: params.get("category") || "all",
      priceRange: [
        parseInt(params.get("minPrice")) || 0,
        parseInt(params.get("maxPrice")) || 10000
      ],
      rating: parseInt(params.get("rating")) || 0,
      inStock: params.get("inStock") === "true",
      onSale: params.get("onSale") === "true",
      careLevel: params.get("careLevel") || "all",
      size: params.get("size") || "all",
      petFriendly: params.get("petFriendly") === "true",
      airPurifying: params.get("airPurifying") === "true"
    };
    setFilters(urlFilters);
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.priceRange[0] > 0) params.set("minPrice", filters.priceRange[0]);
    if (filters.priceRange[1] < 10000) params.set("maxPrice", filters.priceRange[1]);
    if (filters.rating > 0) params.set("rating", filters.rating);
    if (filters.inStock) params.set("inStock", "true");
    if (filters.onSale) params.set("onSale", "true");
    if (filters.careLevel !== "all") params.set("careLevel", filters.careLevel);
    if (filters.size !== "all") params.set("size", filters.size);
    if (filters.petFriendly) params.set("petFriendly", "true");
    if (filters.airPurifying) params.set("airPurifying", "true");

    const newUrl = params.toString() ? `${location.pathname}?${params.toString()}` : location.pathname;
    navigate(newUrl, { replace: true });
  }, [filters, navigate, location.pathname]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      // Stock filter
      if (filters.inStock && product.stock <= 0) {
        return false;
      }

      // Sale filter
      if (filters.onSale && !product.discount) {
        return false;
      }

      // Care level filter
      if (filters.careLevel !== "all" && product.careLevel !== filters.careLevel) {
        return false;
      }

      // Size filter
      if (filters.size !== "all" && product.size !== filters.size) {
        return false;
      }

      // Pet friendly filter
      if (filters.petFriendly && !product.petFriendly) {
        return false;
      }

      // Air purifying filter
      if (filters.airPurifying && !product.airPurifying) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "popular":
        return sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Update filters
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    onFilterChange?.();
  });

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "all",
      priceRange: [0, 10000],
      rating: 0,
      inStock: false,
      onSale: false,
      careLevel: "all",
      size: "all",
      petFriendly: false,
      airPurifying: false
    });
    setSortBy("relevance");
  });

  // Get filter statistics
  const filterStats = useMemo(() => {
    const total = products.length;
    const filtered = filteredProducts.length;
    const categories = [...new Set(products.map(p => p.category))];
    const priceRanges = {
      "Under ₹500": products.filter(p => p.price < 500).length,
      "₹500-₹1000": products.filter(p => p.price >= 500 && p.price < 1000).length,
      "₹1000-₹2000": products.filter(p => p.price >= 1000 && p.price < 2000).length,
      "Above ₹2000": products.filter(p => p.price >= 2000).length
    };

    return { total, filtered, categories, priceRanges };
  }, [products, filteredProducts]);

  return (
    <div className={`advanced-product-filter ${className}`}>
      {/* Filter Header */}
      <div className="filter-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2 text-primary"></i>
            Advanced Filters
          </h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'} me-1`}></i>
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={resetFilters}
            >
              <i className="fas fa-times me-1"></i>
              Reset
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="filter-stats mt-3">
          <div className="row text-center">
            <div className="col-3">
              <div className="stat-item">
                <div className="stat-number text-primary">{filterStats.total}</div>
                <div className="stat-label">Total Products</div>
              </div>
            </div>
            <div className="col-3">
              <div className="stat-item">
                <div className="stat-number text-success">{filterStats.filtered}</div>
                <div className="stat-label">Showing</div>
              </div>
            </div>
            <div className="col-3">
              <div className="stat-item">
                <div className="stat-number text-info">{filterStats.categories.length}</div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
            <div className="col-3">
              <div className="stat-item">
                <div className="stat-number text-warning">
                  {products.filter(p => p.discount).length}
                </div>
                <div className="stat-label">On Sale</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="basic-filters mb-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Search Products</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, description..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              {filterStats.categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-3 mb-3">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters mb-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-3">
                <i className="fas fa-cogs me-2"></i>
                Advanced Options
              </h6>
              
              <div className="row">
                {/* Price Range */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price Range (₹)</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => updateFilter("priceRange", [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], parseInt(e.target.value) || 10000])}
                    />
                  </div>
                  
                  {/* Price Range Chart */}
                  <div className="price-chart mt-2">
                    {Object.entries(filterStats.priceRanges).map(([range, count]) => (
                      <div key={range} className="price-bar">
                        <div className="price-label">{range}</div>
                        <div className="price-bar-container">
                          <div 
                            className="price-bar-fill"
                            style={{ width: `${(count / filterStats.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="price-count">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="col-md-6 mb-3">
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Minimum Rating</label>
                      <select
                        className="form-select"
                        value={filters.rating}
                        onChange={(e) => updateFilter("rating", parseInt(e.target.value))}
                      >
                        <option value={0}>Any Rating</option>
                        <option value={4}>4+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={2}>2+ Stars</option>
                      </select>
                    </div>
                    
                    <div className="col-6 mb-3">
                      <label className="form-label">Care Level</label>
                      <select
                        className="form-select"
                        value={filters.careLevel}
                        onChange={(e) => updateFilter("careLevel", e.target.value)}
                      >
                        <option value="all">Any Level</option>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="difficult">Difficult</option>
                      </select>
                    </div>
                    
                    <div className="col-6 mb-3">
                      <label className="form-label">Size</label>
                      <select
                        className="form-select"
                        value={filters.size}
                        onChange={(e) => updateFilter("size", e.target.value)}
                      >
                        <option value="all">Any Size</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    
                    <div className="col-6 mb-3">
                      <label className="form-label">Special Features</label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="inStock"
                          checked={filters.inStock}
                          onChange={(e) => updateFilter("inStock", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="inStock">
                          In Stock Only
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="onSale"
                          checked={filters.onSale}
                          onChange={(e) => updateFilter("onSale", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="onSale">
                          On Sale Only
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="petFriendly"
                          checked={filters.petFriendly}
                          onChange={(e) => updateFilter("petFriendly", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="petFriendly">
                          Pet Friendly
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="airPurifying"
                          checked={filters.airPurifying}
                          onChange={(e) => updateFilter("airPurifying", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="airPurifying">
                          Air Purifying
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {Object.values(filters).some(value => 
        value !== "" && value !== "all" && value !== 0 && value !== false && 
        !(Array.isArray(value) && value[0] === 0 && value[1] === 10000)
      ) && (
        <div className="active-filters mb-3">
          <div className="d-flex flex-wrap gap-2">
            <span className="text-muted">Active filters:</span>
            {filters.search && (
              <span className="badge bg-primary">
                Search: {filters.search}
                <button
                  className="btn-close btn-close-white ms-2"
                  onClick={() => updateFilter("search", "")}
                ></button>
              </span>
            )}
            {filters.category !== "all" && (
              <span className="badge bg-secondary">
                Category: {filters.category}
                <button
                  className="btn-close btn-close-white ms-2"
                  onClick={() => updateFilter("category", "all")}
                ></button>
              </span>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
              <span className="badge bg-info">
                Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                <button
                  className="btn-close btn-close-white ms-2"
                  onClick={() => updateFilter("priceRange", [0, 10000])}
                ></button>
              </span>
            )}
            {filters.rating > 0 && (
              <span className="badge bg-warning">
                Rating: {filters.rating}+ stars
                <button
                  className="btn-close btn-close-white ms-2"
                  onClick={() => updateFilter("rating", 0)}
                ></button>
              </span>
            )}
            {filters.inStock && (
              <span className="badge bg-success">
                In Stock Only
                <button
                  className="btn-close btn-close-white ms-2"
                  onClick={() => updateFilter("inStock", false)}
                ></button>
              </span>
            )}
            {filters.onSale && (
              <span className="badge bg-danger">
                On Sale Only
                <button
                  className="btn-close btn-close-white ms-2"
                  onClick={() => updateFilter("onSale", false)}
                ></button>
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .advanced-product-filter {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        
        .filter-header {
          border-bottom: 2px solid #f8f9fa;
          padding-bottom: 15px;
        }
        
        .filter-stats {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }
        
        .stat-item {
          padding: 10px;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .basic-filters {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        
        .advanced-filters {
          transition: all 0.3s ease;
        }
        
        .price-chart {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 10px;
        }
        
        .price-bar {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .price-label {
          width: 80px;
          color: #6c757d;
        }
        
        .price-bar-container {
          flex: 1;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          margin: 0 10px;
          overflow: hidden;
        }
        
        .price-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }
        
        .price-count {
          width: 30px;
          text-align: right;
          font-weight: 500;
        }
        
        .active-filters {
          background: #e7f3ff;
          border-radius: 8px;
          padding: 15px;
          border-left: 4px solid #0d6efd;
        }
        
        .badge {
          font-size: 12px;
          padding: 8px 12px;
          display: inline-flex;
          align-items: center;
        }
        
        .btn-close {
          font-size: 8px;
          margin-left: 5px;
        }
        
        .form-check {
          margin-bottom: 8px;
        }
        
        .form-check-label {
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
