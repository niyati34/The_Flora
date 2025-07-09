import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "./ProductCard";

export default function ProductRecommendations({
  currentProductId,
  category,
  maxItems = 8,
  showTitle = true,
  showFilters = true,
  className = "",
}) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedFilter, setSelectedFilter] = "all";
  const [sortBy, setSortBy] = useState("relevance");
  const [showAll, setShowAll] = useState(false);

  // Generate recommendations based on current product and category
  const recommendations = useMemo(() => {
    let filteredProducts = products.filter(
      (product) => product.id !== currentProductId
    );

    // Filter by category if specified
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }

    // Apply additional filtering
    switch (selectedFilter) {
      case "similar-price":
        const currentProduct = products.find((p) => p.id === currentProductId);
        if (currentProduct) {
          const priceRange = currentProduct.price * 0.3; // ±30% price range
          filteredProducts = filteredProducts.filter(
            (product) =>
              Math.abs(product.price - currentProduct.price) <= priceRange
          );
        }
        break;
      case "same-category":
        if (category) {
          filteredProducts = filteredProducts.filter(
            (product) => product.category === category
          );
        }
        break;
      case "high-rated":
        filteredProducts = filteredProducts.filter(
          (product) => product.rating && product.rating >= 4.5
        );
        break;
      case "on-sale":
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.originalPrice && product.originalPrice > product.price
        );
        break;
      default:
        break;
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popularity":
        filteredProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case "newest":
        // Assuming newer products have higher IDs or we could add a date field
        filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Relevance sorting - prioritize same category, then similar price, then rating
        filteredProducts.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Category match bonus
          if (category && a.category === category) scoreA += 10;
          if (category && b.category === category) scoreB += 10;

          // Price similarity bonus
          if (currentProductId) {
            const currentProduct = products.find(
              (p) => p.id === currentProductId
            );
            if (currentProduct) {
              const priceDiffA = Math.abs(a.price - currentProduct.price);
              const priceDiffB = Math.abs(b.price - currentProduct.price);
              scoreA += (1000 - priceDiffA) / 100;
              scoreB += (1000 - priceDiffB) / 100;
            }
          }

          // Rating bonus
          scoreA += (a.rating || 0) * 2;
          scoreB += (b.rating || 0) * 2;

          return scoreB - scoreA;
        });
        break;
    }

    return filteredProducts;
  }, [currentProductId, category, selectedFilter, sortBy]);

  // Limit displayed items
  const displayedProducts = showAll
    ? recommendations
    : recommendations.slice(0, maxItems);

  const handleQuickView = (product) => {
    // In a real app, this would open a quick view modal
    console.log("Quick view for:", product.name);
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

  const getFilterLabel = (filter) => {
    switch (filter) {
      case "similar-price":
        return "Similar Price";
      case "same-category":
        return "Same Category";
      case "high-rated":
        return "Highly Rated";
      case "on-sale":
        return "On Sale";
      default:
        return "All Products";
    }
  };

  const getSortLabel = (sort) => {
    switch (sort) {
      case "price-low":
        return "Price: Low to High";
      case "price-high":
        return "Price: High to Low";
      case "rating":
        return "Highest Rated";
      case "popularity":
        return "Most Popular";
      case "newest":
        return "Newest First";
      default:
        return "Most Relevant";
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`product-recommendations ${className}`}>
      <style>
        {`
          .product-recommendations {
            margin-top: 60px;
            padding: 40px 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 20px;
          }
          
          .recommendations-header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .recommendations-title {
            font-size: 32px;
            font-weight: 700;
            color: #333;
            margin-bottom: 16px;
            position: relative;
          }
          
          .recommendations-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: linear-gradient(135deg, #6A9304, #8bc34a);
            border-radius: 2px;
          }
          
          .recommendations-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 32px;
          }
          
          .recommendations-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 32px;
            flex-wrap: wrap;
          }
          
          .filter-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .filter-label {
            font-weight: 600;
            color: #333;
            font-size: 14px;
          }
          
          .filter-select {
            padding: 8px 16px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            background: white;
            color: #333;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .filter-select:focus {
            outline: none;
            border-color: #6A9304;
            box-shadow: 0 0 0 3px rgba(106, 147, 4, 0.1);
          }
          
          .filter-select:hover {
            border-color: #6A9304;
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
          }
          
          .show-more-section {
            text-align: center;
          }
          
          .btn-show-more {
            background: linear-gradient(135deg, #6A9304, #8bc34a);
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 16px;
          }
          
          .btn-show-more:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(106, 147, 4, 0.3);
          }
          
          .btn-show-more:active {
            transform: translateY(0);
          }
          
          .btn-view-all {
            background: transparent;
            border: 2px solid #6A9304;
            color: #6A9304;
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.2s ease;
          }
          
          .btn-view-all:hover {
            background: #6A9304;
            color: white;
            text-decoration: none;
          }
          
          .recommendations-stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 32px;
            flex-wrap: wrap;
          }
          
          .stat-item {
            text-align: center;
            padding: 16px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            min-width: 120px;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #6A9304;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .no-recommendations {
            text-align: center;
            padding: 40px;
            color: #666;
          }
          
          .no-recommendations-icon {
            font-size: 48px;
            color: #ccc;
            margin-bottom: 16px;
          }
          
          @media (max-width: 768px) {
            .recommendations-controls {
              flex-direction: column;
              gap: 16px;
            }
            
            .filter-group {
              flex-direction: column;
              align-items: stretch;
            }
            
            .products-grid {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 16px;
            }
            
            .recommendations-stats {
              gap: 20px;
            }
            
            .stat-item {
              min-width: 100px;
              padding: 12px;
            }
          }
        `}
      </style>

      <div className="container">
        {showTitle && (
          <div className="recommendations-header">
            <h2 className="recommendations-title">
              <i
                className="fas fa-lightbulb me-3"
                style={{ color: "#ffd700" }}
              ></i>
              You Might Also Like
            </h2>
            <p className="recommendations-subtitle">
              Discover more amazing plants and gardening essentials
            </p>
          </div>
        )}

        {showFilters && (
          <div className="recommendations-controls">
            <div className="filter-group">
              <label className="filter-label">Filter:</label>
              <select
                className="filter-select"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="similar-price">Similar Price</option>
                <option value="same-category">Same Category</option>
                <option value="high-rated">Highly Rated</option>
                <option value="on-sale">On Sale</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort by:</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations-stats">
            <div className="stat-item">
              <div className="stat-value">{recommendations.length}</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                ₹
                {Math.round(
                  recommendations.reduce((sum, p) => sum + p.price, 0) /
                    recommendations.length
                )}
              </div>
              <div className="stat-label">Avg Price</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Math.round(
                  (recommendations.reduce(
                    (sum, p) => sum + (p.rating || 0),
                    0
                  ) /
                    recommendations.length) *
                    10
                ) / 10}
              </div>
              <div className="stat-label">Avg Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {
                  recommendations.filter(
                    (p) => p.originalPrice && p.originalPrice > p.price
                  ).length
                }
              </div>
              <div className="stat-label">On Sale</div>
            </div>
          </div>
        )}

        {displayedProducts.length > 0 ? (
          <>
            <div className="products-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showQuickView={true}
                  showWishlist={true}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>

            {recommendations.length > maxItems && (
              <div className="show-more-section">
                {!showAll ? (
                  <button
                    className="btn-show-more"
                    onClick={() => setShowAll(true)}
                  >
                    <i className="fas fa-chevron-down me-2"></i>
                    Show More ({recommendations.length - maxItems} more)
                  </button>
                ) : (
                  <button
                    className="btn-show-more"
                    onClick={() => setShowAll(false)}
                  >
                    <i className="fas fa-chevron-up me-2"></i>
                    Show Less
                  </button>
                )}

                <br />
                <Link to="/category" className="btn-view-all">
                  <i className="fas fa-th-large me-2"></i>
                  View All Products
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="no-recommendations">
            <div className="no-recommendations-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>No recommendations found</h3>
            <p>Try adjusting your filters or browse our full collection</p>
            <Link to="/category" className="btn-view-all">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
