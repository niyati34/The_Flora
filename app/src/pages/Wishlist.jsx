import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import LazyImage from "../components/LazyImage";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const navigate = useNavigate();
  const {
    wishlist,
    name,
    description,
    isPrivate,
    filters,
    getWishlistStats,
    getFilteredWishlist,
    setWishlistName,
    setWishlistDescription,
    setWishlistPrivate,
    clearWishlist,
    exportWishlist,
    shareWishlist,
    sortWishlist,
    filterWishlist,
    getWishlistSummary
  } = useWishlist();
  
  const { addToCart } = useCart();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);
  const [editPrivate, setEditPrivate] = useState(isPrivate);
  const [selectedSort, setSelectedSort] = useState("recent");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [maxDisplayItems] = useState(8);

  useEffect(() => {
    setEditName(name);
    setEditDescription(description);
    setEditPrivate(isPrivate);
  }, [name, description, isPrivate]);

  const handleSaveWishlist = () => {
    setWishlistName(editName);
    setWishlistDescription(editDescription);
    setWishlistPrivate(editPrivate);
    setIsEditing(false);
  };

  const handleSortChange = (sortBy) => {
    setSelectedSort(sortBy);
    sortWishlist(sortBy);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    filterWishlist(filter);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExport = () => {
    exportWishlist();
  };

  const handleShare = async () => {
    try {
      await shareWishlist();
    } catch (error) {
      console.error("Failed to share wishlist:", error);
    }
  };

  const handleMoveAllToCart = () => {
    wishlist.items.forEach(item => {
      addToCart(item, 1);
    });
  };

  const filteredItems = getFilteredWishlist().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, maxDisplayItems);
  const stats = getWishlistStats();
  const summary = getWishlistSummary();

  if (wishlist.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="empty-wishlist-icon mb-4">
            <i className="fas fa-heart" style={{ fontSize: "64px", color: "#ff6b6b" }}></i>
          </div>
          <h2 className="mb-3">Your Wishlist is Empty</h2>
          <p className="text-muted mb-4">
            Start building your collection by adding plants and products you love!
          </p>
          <Link to="/" className="btn btn-success btn-lg">
            <i className="fas fa-leaf me-2"></i>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <style>
        {`
          .wishlist-header {
            background: linear-gradient(135deg, #6A9304, #8BC34A);
            color: white;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
          }
          
          .wishlist-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(50%, -50%);
          }
          
          .wishlist-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .wishlist-description {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 20px;
          }
          
          .wishlist-meta {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          
          .edit-form {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          .form-label {
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
          }
          
          .form-control {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 10px 12px;
            transition: border-color 0.3s ease;
          }
          
          .form-control:focus {
            border-color: #6A9304;
            box-shadow: 0 0 0 0.2rem rgba(106, 147, 4, 0.25);
          }
          
          .wishlist-controls {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .control-section {
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
            margin-bottom: 15px;
          }
          
          .control-section:last-child {
            margin-bottom: 0;
          }
          
          .control-label {
            font-weight: 600;
            color: #555;
            min-width: 80px;
          }
          
          .select-control {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 8px 12px;
            background: white;
            min-width: 150px;
          }
          
          .search-box {
            flex: 1;
            min-width: 200px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 8px 12px;
            background: white;
          }
          
          .action-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          
          .btn-action {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .btn-primary {
            background: #6A9304;
            color: white;
          }
          
          .btn-primary:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
          }
          
          .btn-success {
            background: #28a745;
            color: white;
          }
          
          .btn-success:hover {
            background: #218838;
            transform: translateY(-2px);
          }
          
          .btn-danger {
            background: #dc3545;
            color: white;
          }
          
          .btn-danger:hover {
            background: #c82333;
            transform: translateY(-2px);
          }
          
          .wishlist-stats {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #6A9304;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #6A9304;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 0.9rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .wishlist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .show-more-section {
            text-align: center;
            margin: 30px 0;
          }
          
          .show-more-btn {
            background: linear-gradient(135deg, #6A9304, #8BC34A);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
          }
          
          .show-more-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(106, 147, 4, 0.4);
          }
          
          .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
          }
          
          .empty-state i {
            font-size: 48px;
            color: #ddd;
            margin-bottom: 20px;
          }
          
          @media (max-width: 768px) {
            .wishlist-header {
              padding: 20px;
            }
            
            .wishlist-title {
              font-size: 2rem;
            }
            
            .wishlist-meta {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .control-section {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .wishlist-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="wishlist-header">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label className="form-label">Wishlist Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter wishlist name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe your wishlist"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={editPrivate}
                      onChange={(e) => setEditPrivate(e.target.checked)}
                    />
                    Make this wishlist private
                  </label>
                </div>
                <div className="action-buttons">
                  <button className="btn-action btn-primary" onClick={handleSaveWishlist}>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </button>
                  <button className="btn-action btn-secondary" onClick={() => setIsEditing(false)}>
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="wishlist-title">{name || "My Wishlist"}</h1>
                <p className="wishlist-description">
                  {description || "A collection of plants and products I love"}
                </p>
                <div className="wishlist-meta">
                  <div className="meta-item">
                    <i className="fas fa-heart"></i>
                    <span>{wishlist.items.length} items</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-eye"></i>
                    <span>{isPrivate ? "Private" : "Public"}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-calendar"></i>
                    <span>Updated {new Date(wishlist.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="action-buttons">
            <button className="btn-action btn-primary" onClick={() => setIsEditing(!isEditing)}>
              <i className="fas fa-edit"></i>
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button className="btn-action btn-success" onClick={handleExport}>
              <i className="fas fa-download"></i>
              Export
            </button>
            <button className="btn-action btn-secondary" onClick={handleShare}>
              <i className="fas fa-share"></i>
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="wishlist-controls">
        <div className="control-section">
          <span className="control-label">Sort by:</span>
          <select
            className="select-control"
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        
        <div className="control-section">
          <span className="control-label">Filter:</span>
          <select
            className="select-control"
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="in-stock">In Stock</option>
            <option value="on-sale">On Sale</option>
            <option value="indoor">Indoor Plants</option>
            <option value="outdoor">Outdoor Plants</option>
          </select>
        </div>
        
        <div className="control-section">
          <span className="control-label">Search:</span>
          <input
            type="text"
            className="search-box"
            placeholder="Search wishlist items..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="control-section">
          <span className="control-label">Actions:</span>
          <div className="action-buttons">
            <button className="btn-action btn-success" onClick={handleMoveAllToCart}>
              <i className="fas fa-shopping-cart"></i>
              Move All to Cart
            </button>
            <button className="btn-action btn-danger" onClick={clearWishlist}>
              <i className="fas fa-trash"></i>
              Clear Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="wishlist-stats">
        <h3 className="mb-3">
          <i className="fas fa-chart-bar me-2" style={{ color: "#6A9304" }}></i>
          Wishlist Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalItems}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">₹{stats.totalValue.toLocaleString()}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.avgRating.toFixed(1)}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.onSaleCount}</div>
            <div className="stat-label">On Sale</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.inStockCount}</div>
            <div className="stat-label">In Stock</div>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <h4>No items found</h4>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {displayedItems.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                showQuickView={true}
                showWishlist={true}
                showRating={true}
                showDiscount={true}
              />
            ))}
          </div>

          {filteredItems.length > maxDisplayItems && (
            <div className="show-more-section">
              <button
                className="show-more-btn"
                onClick={() => setShowAll(!showAll)}
              >
                <i className={`fas fa-${showAll ? 'chevron-up' : 'chevron-down'} me-2`}></i>
                {showAll ? 'Show Less' : `Show ${filteredItems.length - maxDisplayItems} More`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
