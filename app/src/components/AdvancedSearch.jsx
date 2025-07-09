import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LazyImage from "./LazyImage";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
    rating: "all",
    inStock: false,
    onSale: false,
    plantType: "all",
    careLevel: "all",
    sunlight: "all",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock product data
  const allProducts = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      category: "indoor",
      price: 1299,
      originalPrice: 1599,
      rating: 4.8,
      inStock: true,
      onSale: true,
      plantType: "tropical",
      careLevel: "easy",
      sunlight: "indirect",
      image: "/plant1.gif",
      description: "Large tropical plant with distinctive split leaves",
    },
    {
      id: 2,
      name: "Snake Plant",
      category: "indoor",
      price: 899,
      originalPrice: 899,
      rating: 4.6,
      inStock: true,
      onSale: false,
      plantType: "succulent",
      careLevel: "very-easy",
      sunlight: "low",
      image: "/plant1.gif",
      description: "Low-maintenance plant perfect for beginners",
    },
  ];

  const popularSearchesData = [
    "indoor plants",
    "succulents",
    "air purifying",
    "low maintenance",
    "flowering plants",
    "tropical plants",
    "bonsai",
    "herbs",
  ];

  useEffect(() => {
    loadRecentSearches();
    loadPopularSearches();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, filters]);

  const loadRecentSearches = () => {
    const recent = JSON.parse(
      localStorage.getItem("flora_recent_searches") || "[]"
    );
    setRecentSearches(recent.slice(0, 5));
  };

  const loadPopularSearches = () => {
    setPopularSearches(popularSearchesData);
  };

  const saveSearch = (term) => {
    const recent = JSON.parse(
      localStorage.getItem("flora_recent_searches") || "[]"
    );
    const updated = [term, ...recent.filter((s) => s !== term)].slice(0, 10);
    localStorage.setItem("flora_recent_searches", JSON.stringify(updated));
    loadRecentSearches();
  };

  const performSearch = useCallback(() => {
    setIsSearching(true);

    setTimeout(() => {
      let filtered = allProducts.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filters.category !== "all" && product.category !== filters.category)
          return false;
        if (
          filters.plantType !== "all" &&
          product.plantType !== filters.plantType
        )
          return false;
        if (
          filters.careLevel !== "all" &&
          product.careLevel !== filters.careLevel
        )
          return false;
        if (filters.sunlight !== "all" && product.sunlight !== filters.sunlight)
          return false;
        if (filters.inStock && !product.inStock) return false;
        if (filters.onSale && !product.onSale) return false;

        if (filters.priceRange !== "all") {
          const [min, max] = filters.priceRange.split("-").map(Number);
          if (max && product.price > max) return false;
          if (min && product.price < min) return false;
        }

        if (filters.rating !== "all") {
          const minRating = Number(filters.rating);
          if (product.rating < minRating) return false;
        }

        return true;
      });

      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  }, [searchTerm, filters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    saveSearch(term);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
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

  const clearFilters = () => {
    setFilters({
      category: "all",
      priceRange: "all",
      rating: "all",
      inStock: false,
      onSale: false,
      plantType: "all",
      careLevel: "all",
      sunlight: "all",
    });
  };

  const getFilterCount = () => {
    return Object.values(filters).filter((v) => v !== "all" && v !== false)
      .length;
  };

  return (
    <div className="advanced-search-container">
      <style>
        {`
          .advanced-search-container {
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .search-header {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .search-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #2B5943;
            margin-bottom: 10px;
          }
          
          .search-subtitle {
            font-size: 1.1rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .search-input-container {
            position: relative;
            margin-bottom: 20px;
          }
          
          .search-input {
            width: 100%;
            padding: 18px 24px;
            font-size: 1.1rem;
            border: 3px solid #e9ecef;
            border-radius: 50px;
            outline: none;
            transition: all 0.3s ease;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .search-input:focus {
            border-color: #6A9304;
            box-shadow: 0 6px 20px rgba(106, 147, 4, 0.3);
            transform: translateY(-2px);
          }
          
          .search-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #6A9304, #8BC34A);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
          }
          
          .search-button:hover {
            transform: translateY(-50%) translateY(-2px);
            box-shadow: 0 6px 20px rgba(106, 147, 4, 0.4);
          }
          
          .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #e9ecef;
          }
          
          .suggestion-item {
            padding: 12px 20px;
            cursor: pointer;
            border-bottom: 1px solid #f8f9fa;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .suggestion-item:hover,
          .suggestion-item.selected {
            background-color: #f8f9fa;
          }
          
          .suggestion-item:last-child {
            border-bottom: none;
          }
          
          .suggestion-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6A9304;
          }
          
          .suggestion-content {
            flex: 1;
          }
          
          .suggestion-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }
          
          .suggestion-details {
            font-size: 0.9rem;
            color: #666;
          }
          
          .search-options {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .search-option {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            padding: 8px 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            color: #666;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .search-option:hover {
            border-color: #6A9304;
            color: #6A9304;
            transform: translateY(-2px);
          }
          
          .search-option.active {
            background: #6A9304;
            border-color: #6A9304;
            color: white;
          }
          
          .advanced-filters-toggle {
            background: none;
            border: none;
            color: #6A9304;
            font-weight: 600;
            cursor: pointer;
            padding: 10px 20px;
            border-radius: 8px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 auto 20px;
          }
          
          .advanced-filters-toggle:hover {
            background: rgba(106, 147, 4, 0.1);
          }
          
          .advanced-filters {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
          }
          
          .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .filter-group {
            display: flex;
            flex-direction: column;
          }
          
          .filter-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            font-size: 0.9rem;
          }
          
          .filter-select {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 10px 12px;
            background: white;
            transition: border-color 0.3s ease;
          }
          
          .filter-select:focus {
            border-color: #6A9304;
            outline: none;
          }
          
          .filter-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }
          
          .filter-checkbox input {
            width: 18px;
            height: 18px;
            accent-color: #6A9304;
          }
          
          .filters-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
          }
          
          .filter-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .filter-btn.primary {
            background: #6A9304;
            color: white;
          }
          
          .filter-btn.primary:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .filter-btn.secondary {
            background: #6c757d;
            color: white;
          }
          
          .filter-btn.secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
          }
          
          .search-results {
            margin-top: 30px;
          }
          
          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .results-count {
            font-weight: 600;
            color: #333;
          }
          
          .results-sort {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .sort-select {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 8px 12px;
            background: white;
          }
          
          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .result-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .result-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
          }
          
          .result-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #f8f9fa;
          }
          
          .result-content {
            padding: 20px;
          }
          
          .result-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            line-height: 1.4;
          }
          
          .result-description {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 15px;
            line-height: 1.5;
          }
          
          .result-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .result-price {
            font-size: 1.2rem;
            font-weight: 700;
            color: #6A9304;
          }
          
          .result-original-price {
            font-size: 1rem;
            color: #999;
            text-decoration: line-through;
            margin-left: 8px;
          }
          
          .result-rating {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #666;
            font-size: 0.9rem;
          }
          
          .result-actions {
            display: flex;
            gap: 10px;
          }
          
          .action-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          
          .action-btn.primary {
            background: #6A9304;
            color: white;
          }
          
          .action-btn.primary:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .action-btn.secondary {
            background: #f8f9fa;
            color: #333;
            border: 2px solid #e9ecef;
          }
          
          .action-btn.secondary:hover {
            background: #e9ecef;
            transform: translateY(-2px);
          }
          
          .action-btn.wishlist {
            background: #ff6b6b;
            color: white;
          }
          
          .action-btn.wishlist:hover {
            background: #ee5a24;
            transform: translateY(-2px);
          }
          
          .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          
          .no-results i {
            font-size: 64px;
            color: #ddd;
            margin-bottom: 20px;
          }
          
          .loading-spinner {
            text-align: center;
            padding: 40px;
            color: #666;
          }
          
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #6A9304;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .recent-popular {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .recent-searches,
          .popular-searches {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .section-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .search-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .search-tag {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 0.9rem;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .search-tag:hover {
            background: #6A9304;
            color: white;
            border-color: #6A9304;
            transform: translateY(-2px);
          }
          
          @media (max-width: 768px) {
            .advanced-search-container {
              padding: 15px;
            }
            
            .search-title {
              font-size: 2rem;
            }
            
            .filters-grid {
              grid-template-columns: 1fr;
            }
            
            .recent-popular {
              grid-template-columns: 1fr;
            }
            
            .results-grid {
              grid-template-columns: 1fr;
            }
            
            .results-header {
              flex-direction: column;
              gap: 15px;
              align-items: stretch;
            }
          }
        `}
      </style>

      <div className="search-header">
        <h1 className="search-title">
          <i className="fas fa-search me-3" style={{ color: "#6A9304" }}></i>
          Advanced Plant Search
        </h1>
        <p className="search-subtitle">
          Find the perfect plants for your space with our advanced search and
          filtering options
        </p>
      </div>

      <div className="search-input-container">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search for plants, care tips, or gardening advice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
        <button
          className="search-button"
          onClick={() => handleSearch(searchTerm.trim())}
        >
          <i className="fas fa-search me-2"></i>
          Search
        </button>
      </div>

      <div className="search-options">
        <div
          className={`search-option ${
            filters.category !== "all" ? "active" : ""
          }`}
          onClick={() =>
            handleFilterChange(
              "category",
              filters.category === "all" ? "indoor" : "all"
            )
          }
        >
          <i className="fas fa-home me-2"></i>
          Indoor Plants
        </div>
        <div
          className={`search-option ${
            filters.plantType !== "all" ? "active" : ""
          }`}
          onClick={() =>
            handleFilterChange(
              "plantType",
              filters.plantType === "all" ? "succulent" : "all"
            )
          }
        >
          <i className="fas fa-seedling me-2"></i>
          Succulents
        </div>
        <div
          className={`search-option ${
            filters.careLevel !== "all" ? "active" : ""
          }`}
          onClick={() =>
            handleFilterChange(
              "careLevel",
              filters.careLevel === "all" ? "easy" : "all"
            )
          }
        >
          <i className="fas fa-thumbs-up me-2"></i>
          Easy Care
        </div>
        <div
          className={`search-option ${filters.onSale ? "active" : ""}`}
          onClick={() => handleFilterChange("onSale", !filters.onSale)}
        >
          <i className="fas fa-tag me-2"></i>
          On Sale
        </div>
      </div>

      <button
        className="advanced-filters-toggle"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
      >
        <i
          className={`fas fa-${
            showAdvancedFilters ? "chevron-up" : "chevron-down"
          }`}
        ></i>
        Advanced Filters {getFilterCount() > 0 && `(${getFilterCount()})`}
      </button>

      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="indoor">Indoor Plants</option>
                <option value="outdoor">Outdoor Plants</option>
                <option value="succulents">Succulents</option>
                <option value="herbs">Herbs</option>
                <option value="trees">Trees</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <select
                className="filter-select"
                value={filters.priceRange}
                onChange={(e) =>
                  handleFilterChange("priceRange", e.target.value)
                }
              >
                <option value="all">All Prices</option>
                <option value="0-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
                <option value="2000-">Above ₹2000</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Rating</label>
              <select
                className="filter-select"
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Plant Type</label>
              <select
                className="filter-select"
                value={filters.plantType}
                onChange={(e) =>
                  handleFilterChange("plantType", e.target.value)
                }
              >
                <option value="all">All Types</option>
                <option value="tropical">Tropical</option>
                <option value="succulent">Succulent</option>
                <option value="flowering">Flowering</option>
                <option value="foliage">Foliage</option>
                <option value="cactus">Cactus</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Care Level</label>
              <select
                className="filter-select"
                value={filters.careLevel}
                onChange={(e) =>
                  handleFilterChange("careLevel", e.target.value)
                }
              >
                <option value="all">All Levels</option>
                <option value="very-easy">Very Easy</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sunlight</label>
              <select
                className="filter-select"
                value={filters.sunlight}
                onChange={(e) => handleFilterChange("sunlight", e.target.value)}
              >
                <option value="all">All Light Levels</option>
                <option value="low">Low Light</option>
                <option value="indirect">Indirect Light</option>
                <option value="bright">Bright Light</option>
                <option value="full-sun">Full Sun</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Availability</label>
              <div className="filter-checkbox">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) =>
                    handleFilterChange("inStock", e.target.checked)
                  }
                />
                <label htmlFor="inStock">In Stock Only</label>
              </div>
              <div className="filter-checkbox">
                <input
                  type="checkbox"
                  id="onSale"
                  checked={filters.onSale}
                  onChange={(e) =>
                    handleFilterChange("onSale", e.target.checked)
                  }
                />
                <label htmlFor="onSale">On Sale Only</label>
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button className="filter-btn primary" onClick={performSearch}>
              <i className="fas fa-search me-2"></i>
              Apply Filters
            </button>
            <button className="filter-btn secondary" onClick={clearFilters}>
              <i className="fas fa-times me-2"></i>
              Clear All
            </button>
          </div>
        </div>
      )}

      <div className="recent-popular">
        <div className="recent-searches">
          <h3 className="section-title">
            <i className="fas fa-history" style={{ color: "#6A9304" }}></i>
            Recent Searches
          </h3>
          <div className="search-tags">
            {recentSearches.length > 0 ? (
              recentSearches.map((search, index) => (
                <span
                  key={index}
                  className="search-tag"
                  onClick={() => handleSearch(search)}
                >
                  {search}
                </span>
              ))
            ) : (
              <span className="text-muted">No recent searches</span>
            )}
          </div>
        </div>

        <div className="popular-searches">
          <h3 className="section-title">
            <i className="fas fa-fire" style={{ color: "#ff6b6b" }}></i>
            Popular Searches
          </h3>
          <div className="search-tags">
            {popularSearches.map((search, index) => (
              <span
                key={index}
                className="search-tag"
                onClick={() => handleSearch(search)}
              >
                {search}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="search-results">
        {isSearching ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching for plants...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-count">
                Found {searchResults.length} plant
                {searchResults.length !== 1 ? "s" : ""}
              </div>
              <div className="results-sort">
                <label>Sort by:</label>
                <select className="sort-select">
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            <div className="results-grid">
              {searchResults.map((product) => (
                <div key={product.id} className="result-card">
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="result-image"
                    fallbackSrc="/plant1.gif"
                  />
                  <div className="result-content">
                    <h3 className="result-name">{product.name}</h3>
                    <p className="result-description">{product.description}</p>

                    <div className="result-meta">
                      <div>
                        <span className="result-price">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="result-original-price">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="result-rating">
                        <i
                          className="fas fa-star"
                          style={{ color: "#ffd700" }}
                        ></i>
                        {product.rating}
                      </div>
                    </div>

                    <div className="result-actions">
                      <button
                        className="action-btn primary"
                        onClick={() => handleAddToCart(product)}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        Add to Cart
                      </button>
                      <button
                        className={`action-btn ${
                          isInWishlist(product.id) ? "wishlist" : "secondary"
                        }`}
                        onClick={() => handleWishlistToggle(product)}
                      >
                        <i
                          className={`fas ${
                            isInWishlist(product.id) ? "fa-heart" : "fa-heart"
                          }`}
                        ></i>
                        {isInWishlist(product.id) ? "Saved" : "Wishlist"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : searchTerm.length > 2 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No plants found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
