import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "../data/products";
import LazyImage from "./LazyImage";

export default function AdvancedSearch({ onProductSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
    rating: "all",
    inStock: false
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    "Peace Lily", "Spider Plant", "Succulents", "Indoor Plants", 
    "Air Purifying", "Low Maintenance", "Planters", "Terrariums"
  ]);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flora-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem("flora-recent-searches", JSON.stringify(recentSearches.slice(0, 10)));
    }
  }, [recentSearches]);

  // Search products based on query and filters
  const searchProducts = useCallback((searchQuery, searchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filteredProducts = products.filter(product => {
      // Text search
      const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;

      // Category filter
      if (searchFilters.category !== "all" && product.category !== searchFilters.category) {
        return false;
      }

      // Price range filter
      if (searchFilters.priceRange !== "all") {
        const price = parseFloat(product.price);
        switch (searchFilters.priceRange) {
          case "0-200":
            if (price > 200) return false;
            break;
          case "200-500":
            if (price < 200 || price > 500) return false;
            break;
          case "500-1000":
            if (price < 500 || price > 1000) return false;
            break;
          case "1000+":
            if (price < 1000) return false;
            break;
        }
      }

      // Rating filter
      if (searchFilters.rating !== "all" && product.rating) {
        const rating = parseFloat(product.rating);
        switch (searchFilters.rating) {
          case "4+":
            if (rating < 4) return false;
            break;
          case "3+":
            if (rating < 3) return false;
            break;
        }
      }

      // Stock filter
      if (searchFilters.inStock && product.stock === 0) {
        return false;
      }

      return true;
    });

    // Sort by relevance (exact matches first, then partial matches)
    const sortedResults = filteredProducts.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery.toLowerCase();
      const bExact = b.name.toLowerCase() === searchQuery.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then sort by rating (higher first)
      if (a.rating && b.rating) {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      
      return 0;
    });

    setResults(sortedResults.slice(0, 10)); // Limit to 10 results
  }, []);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query, filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, searchProducts]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleProductSelect(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
    }
  }, [results, selectedIndex, query]);

  // Handle product selection
  const handleProductSelect = (product) => {
    // Add to recent searches
    const newSearch = {
      query: product.name,
      timestamp: Date.now(),
      productId: product.id
    };
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.query !== product.name);
      return [newSearch, ...filtered];
    });

    if (onProductSelect) {
      onProductSelect(product);
    } else {
      navigate(`/product/${product.id}`);
    }
    
    handleClose();
  };

  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      const newSearch = {
        query: query.trim(),
        timestamp: Date.now()
      };
      
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.query !== query.trim());
        return [newSearch, ...filtered];
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
    if (onClose) onClose();
  };

  // Handle recent search click
  const handleRecentSearch = (search) => {
    setQuery(search.query);
    if (search.productId) {
      const product = products.find(p => p.id === search.productId);
      if (product) {
        handleProductSelect(product);
      }
    }
  };

  // Handle popular search click
  const handlePopularSearch = (searchTerm) => {
    setQuery(searchTerm);
  };

  return (
    <div className="advanced-search" ref={searchRef}>
      <style>
        {`
          .advanced-search {
            position: relative;
            width: 100%;
            max-width: 600px;
          }
          
          .search-input-container {
            position: relative;
            width: 100%;
          }
          
          .search-input {
            width: 100%;
            padding: 12px 50px 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #6A9304;
            box-shadow: 0 0 0 3px rgba(106, 147, 4, 0.1);
          }
          
          .search-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: #6A9304;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .search-button:hover {
            background: #5a7d03;
            transform: translateY(-50%) scale(1.05);
          }
          
          .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            margin-top: 8px;
            max-height: 500px;
            overflow-y: auto;
            z-index: 1000;
            border: 1px solid #e9ecef;
          }
          
          .search-section {
            padding: 16px;
            border-bottom: 1px solid #f1f3f4;
          }
          
          .search-section:last-child {
            border-bottom: none;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #666;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .search-item {
            display: flex;
            align-items: center;
            padding: 12px;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s ease;
            gap: 12px;
          }
          
          .search-item:hover,
          .search-item.selected {
            background: #f8f9fa;
          }
          
          .search-item.selected {
            background: #e8f5e8;
            border-left: 3px solid #6A9304;
          }
          
          .search-item-image {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            object-fit: cover;
            flex-shrink: 0;
          }
          
          .search-item-info {
            flex: 1;
            min-width: 0;
          }
          
          .search-item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .search-item-details {
            font-size: 12px;
            color: #666;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .search-filters {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 12px;
          }
          
          .filter-chip {
            padding: 6px 12px;
            border: 1px solid #e9ecef;
            border-radius: 16px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: white;
            color: #666;
          }
          
          .filter-chip:hover {
            border-color: #6A9304;
            color: #6A9304;
          }
          
          .filter-chip.active {
            background: #6A9304;
            color: white;
            border-color: #6A9304;
          }
          
          .recent-search-item {
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 6px;
            transition: background 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .recent-search-item:hover {
            background: #f8f9fa;
          }
          
          .popular-search-item {
            padding: 6px 12px;
            background: #f8f9fa;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
            color: #666;
          }
          
          .popular-search-item:hover {
            background: #6A9304;
            color: white;
          }
          
          .no-results {
            padding: 20px;
            text-align: center;
            color: #666;
          }
          
          .search-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
        `}
      </style>

      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search for plants, planters, or gardening tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="search-button"
          onClick={handleSearch}
          title="Search"
        >
          <i className="fas fa-search"></i>
        </button>
      </div>

      {isOpen && (
        <div className="search-results">
          {query.trim() && results.length > 0 && (
            <div className="search-section">
              <div className="section-title">
                <i className="fas fa-search"></i>
                Search Results ({results.length})
              </div>
              
              <div className="search-filters">
                <select 
                  value={filters.category} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-chip"
                >
                  <option value="all">All Categories</option>
                  <option value="Plants">Plants</option>
                  <option value="Planters">Planters</option>
                  <option value="Tools">Tools</option>
                </select>
                
                <select 
                  value={filters.priceRange} 
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="filter-chip"
                >
                  <option value="all">All Prices</option>
                  <option value="0-200">Under ₹200</option>
                  <option value="200-500">₹200 - ₹500</option>
                  <option value="500-1000">₹500 - ₹1000</option>
                  <option value="1000+">Above ₹1000</option>
                </select>
                
                <select 
                  value={filters.rating} 
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="filter-chip"
                >
                  <option value="all">All Ratings</option>
                  <option value="4+">4+ Stars</option>
                  <option value="3+">3+ Stars</option>
                </select>
                
                <label className="filter-chip">
                  <input 
                    type="checkbox" 
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    style={{ marginRight: '6px' }}
                  />
                  In Stock
                </label>
              </div>

              {results.map((product, index) => (
                <div
                  key={`${product.id}-${product.color || 'default'}`}
                  className={`search-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleProductSelect(product)}
                >
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="search-item-image"
                  />
                  <div className="search-item-info">
                    <div className="search-item-name">{product.name}</div>
                    <div className="search-item-details">
                      <span>₹{product.price}</span>
                      {product.rating && (
                        <>
                          <span>•</span>
                          <span>
                            <i className="fas fa-star" style={{ color: '#ffd700' }}></i>
                            {product.rating}
                          </span>
                        </>
                      )}
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="search-section">
              <div className="no-results">
                <i className="fas fa-search" style={{ fontSize: '24px', color: '#ccc', marginBottom: '8px' }}></i>
                <p>No products found for "{query}"</p>
                <p style={{ fontSize: '12px', color: '#999' }}>Try adjusting your search terms or filters</p>
              </div>
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="search-section">
              <div className="section-title">
                <i className="fas fa-history"></i>
                Recent Searches
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="recent-search-item"
                  onClick={() => handleRecentSearch(search)}
                >
                  <i className="fas fa-clock" style={{ color: '#999' }}></i>
                  <span>{search.query}</span>
                </div>
              ))}
            </div>
          )}

          <div className="search-section">
            <div className="section-title">
              <i className="fas fa-fire"></i>
              Popular Searches
            </div>
            <div className="search-suggestions">
              {popularSearches.map((search, index) => (
                <div
                  key={index}
                  className="popular-search-item"
                  onClick={() => handlePopularSearch(search)}
                >
                  {search}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
