import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "./ProductCard";

export default function AdvancedProductSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    "monstera", "succulents", "air plants", "bonsai", "orchids", "ferns", "cactus"
  ]);

  // Mock products data - in real app this would come from API
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flora_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock products data
      const mockProducts = [
        {
          id: 1,
          name: "Monstera Deliciosa",
          price: 1299,
          originalPrice: 1599,
          category: "indoor",
          rating: 4.8,
          inStock: true,
          image: "https://images.unsplash.com/photo-1604762524889-3e8f3d4b4b4b?w=400",
          tags: ["monstera", "indoor", "large", "tropical"]
        },
        {
          id: 2,
          name: "Snake Plant",
          price: 899,
          originalPrice: 999,
          category: "indoor",
          rating: 4.6,
          inStock: true,
          image: "https://images.unsplash.com/photo-1604762524889-3e8f3d4b4b4b?w=400",
          tags: ["snake plant", "indoor", "low maintenance", "air purifying"]
        },
        {
          id: 3,
          name: "Succulent Collection",
          price: 599,
          originalPrice: 799,
          category: "succulents",
          rating: 4.7,
          inStock: true,
          image: "https://images.unsplash.com/photo-1604762524889-3e8f3d4b4b4b?w=400",
          tags: ["succulents", "small", "low maintenance", "desert"]
        },
        {
          id: 4,
          name: "Peace Lily",
          price: 799,
          originalPrice: 899,
          category: "indoor",
          rating: 4.5,
          inStock: false,
          image: "https://images.unsplash.com/photo-1604762524889-3e8f3d4b4b4b?w=400",
          tags: ["peace lily", "indoor", "flowering", "air purifying"]
        },
        {
          id: 5,
          name: "Bonsai Tree",
          price: 2499,
          originalPrice: 2999,
          category: "bonsai",
          rating: 4.9,
          inStock: true,
          image: "https://images.unsplash.com/photo-1604762524889-3e8f3d4b4b4b?w=400",
          tags: ["bonsai", "indoor", "artistic", "zen"]
        },
        {
          id: 6,
          name: "Orchid Phalaenopsis",
          price: 899,
          originalPrice: 1099,
          category: "orchids",
          rating: 4.4,
          inStock: true,
          image: "https://images.unsplash.com/photo-1604762524889-3e8f3d4b4b4b?w=400",
          tags: ["orchid", "indoor", "flowering", "elegant"]
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Rating filter
      const matchesRating = product.rating >= selectedRating;
      
      // Stock filter
      const matchesStock = !inStockOnly || product.inStock;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "relevance":
      default:
        // Relevance scoring based on search term match
        if (searchTerm) {
          filtered.sort((a, b) => {
            const aScore = getRelevanceScore(a, searchTerm);
            const bScore = getRelevanceScore(b, searchTerm);
            return bScore - aScore;
          });
        }
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, selectedRating, inStockOnly, sortBy]);

  const getRelevanceScore = (product, term) => {
    let score = 0;
    const lowerTerm = term.toLowerCase();
    
    if (product.name.toLowerCase().includes(lowerTerm)) score += 10;
    if (product.tags.some(tag => tag.toLowerCase().includes(lowerTerm))) score += 5;
    if (product.category.toLowerCase().includes(lowerTerm)) score += 3;
    
    return score;
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    // Add to recent searches
    if (term.trim()) {
      const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('flora_recent_searches', JSON.stringify(newRecent));
    }
  }, [recentSearches]);

  // Handle quick search
  const handleQuickSearch = (term) => {
    handleSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'price':
        setPriceRange(value);
        break;
      case 'rating':
        setSelectedRating(value);
        break;
      case 'stock':
        setInStockOnly(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
    setSelectedRating(0);
    setInStockOnly(false);
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // Handle product actions
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

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "indoor", label: "Indoor Plants" },
    { value: "succulents", label: "Succulents" },
    { value: "bonsai", label: "Bonsai" },
    { value: "orchids", label: "Orchids" },
    { value: "ferns", label: "Ferns" },
    { value: "cactus", label: "Cactus" }
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "name", label: "Name: A to Z" }
  ];

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-product-search">
      {/* Search Header */}
      <div className="search-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="search-input-group">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search for plants, categories, or features..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="btn btn-primary btn-lg">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div className="col-md-4 text-end">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter"></i> Filters
            </button>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                type="button"
                className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Suggestions */}
      {(recentSearches.length > 0 || popularSearches.length > 0) && (
        <div className="search-suggestions mb-4">
          {recentSearches.length > 0 && (
            <div className="mb-3">
              <h6 className="text-muted mb-2">Recent Searches</h6>
              <div className="d-flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleQuickSearch(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h6 className="text-muted mb-2">Popular Searches</h6>
            <div className="d-flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleQuickSearch(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel mb-4">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Price Range</label>
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => handleFilterChange('price', [Number(e.target.value), priceRange[1]])}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => handleFilterChange('price', [priceRange[0], Number(e.target.value)])}
                    />
                  </div>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">Min Rating</label>
                  <select
                    className="form-select"
                    value={selectedRating}
                    onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">Availability</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="inStockOnly"
                      checked={inStockOnly}
                      onChange={(e) => handleFilterChange('stock', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="inStockOnly">
                      In Stock Only
                    </label>
                  </div>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <button className="btn btn-outline-secondary" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <p className="mb-0">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </span>
            {selectedRating > 0 && (
              <span className="text-muted">
                Min Rating: {selectedRating}+ ⭐
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {currentProducts.length > 0 ? (
        <>
          <div className={`products-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
            {currentProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onWishlistToggle={() => handleWishlistToggle(product)}
                onQuickView={() => handleQuickView(product)}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="no-results text-center py-5">
          <i className="fas fa-search fa-3x text-muted mb-3"></i>
          <h4>No products found</h4>
          <p className="text-muted">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button className="btn btn-primary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      <style jsx>{`
        .advanced-product-search {
          padding: 20px 0;
        }
        
        .search-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .search-input-group {
          position: relative;
          display: flex;
        }
        
        .search-input-group .form-control {
          border-radius: 25px 0 0 25px;
          border-right: none;
          padding-left: 20px;
          padding-right: 20px;
        }
        
        .search-input-group .btn {
          border-radius: 0 25px 25px 0;
          border-left: none;
          padding-left: 20px;
          padding-right: 20px;
        }
        
        .search-suggestions {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .filters-panel {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .results-summary {
          background: #f8f9fa;
          padding: 15px 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        
        .products-container.grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .products-container.list-view {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .no-results {
          background: #f8f9fa;
          border-radius: 10px;
          border: 2px dashed #dee2e6;
        }
        
        .pagination .page-link {
          border-radius: 8px;
          margin: 0 2px;
          border: 1px solid #dee2e6;
        }
        
        .pagination .page-item.active .page-link {
          background-color: #007bff;
          border-color: #007bff;
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
