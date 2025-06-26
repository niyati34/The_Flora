import { useState } from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ 
  product, 
  showQuickView = true,
  showWishlist = true,
  showRating = true,
  showDiscount = true,
  className = "",
  onQuickView
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || !product.price) return 0;
    const original = parseFloat(product.originalPrice.replace('₹', ''));
    const current = parseFloat(product.price.replace('₹', ''));
    return Math.round(((original - current) / original) * 100);
  };

  const discountPercentage = calculateDiscount();

  return (
    <div 
      className={`product-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>
        {`
          .product-card {
            position: relative;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
          }
          
          .product-image-container {
            position: relative;
            overflow: hidden;
            aspect-ratio: 1;
            background: #f8f9fa;
          }
          
          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .product-card:hover .product-image {
            transform: scale(1.05);
          }
          
          .product-badges {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            z-index: 10;
          }
          
          .discount-badge {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          }
          
          .rating-badge {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .wishlist-button {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
            z-index: 10;
          }
          
          .wishlist-button:hover {
            background: white;
            transform: scale(1.1);
          }
          
          .wishlist-button.active {
            background: #ff6b6b;
            color: white;
          }
          
          .quick-actions {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            padding: 20px 12px 12px;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            display: flex;
            gap: 8px;
          }
          
          .product-card:hover .quick-actions {
            transform: translateY(0);
          }
          
          .quick-action-btn {
            flex: 1;
            background: white;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #333;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          
          .quick-action-btn:hover {
            background: #6A9304;
            color: white;
            transform: translateY(-2px);
          }
          
          .product-info {
            padding: 16px;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .product-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .product-price {
            margin-bottom: 12px;
          }
          
          .current-price {
            font-size: 18px;
            font-weight: bold;
            color: #6A9304;
            margin-right: 8px;
          }
          
          .original-price {
            font-size: 14px;
            color: #999;
            text-decoration: line-through;
          }
          
          .product-meta {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
          }
          
          .stock-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
          
          .stock-status.in-stock {
            background: #d4edda;
            color: #155724;
          }
          
          .stock-status.low-stock {
            background: #fff3cd;
            color: #856404;
          }
          
          .stock-status.out-of-stock {
            background: #f8d7da;
            color: #721c24;
          }
        `}
      </style>

      <div className="product-image-container">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="product-image"
          onLoad={() => setIsImageLoaded(true)}
        />
        
        <div className="product-badges">
          {showDiscount && discountPercentage > 0 && (
            <div className="discount-badge">
              {discountPercentage}% OFF
            </div>
          )}
          
          {showRating && product.rating && (
            <div className="rating-badge">
              <i className="fas fa-star" style={{ color: "#ffd700" }}></i>
              {product.rating}
            </div>
          )}
        </div>

        {showWishlist && (
          <button
            className={`wishlist-button ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`fas ${isInWishlist(product.id) ? 'fa-heart' : 'fa-heart'}`}></i>
          </button>
        )}

        {showQuickView && (
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={handleQuickView}>
              <i className="fas fa-eye"></i>
              Quick View
            </button>
            <button className="quick-action-btn" onClick={handleAddToCart}>
              <i className="fas fa-shopping-cart"></i>
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-title">
          {product.name}
        </Link>
        
        <div className="product-price">
          <span className="current-price">{product.price}</span>
          {product.originalPrice && product.originalPrice !== product.price && (
            <span className="original-price">{product.originalPrice}</span>
          )}
        </div>

        <div className="product-meta">
          <span className="stock-status in-stock">
            <i className="fas fa-check-circle me-1"></i>
            In Stock
          </span>
          
          {product.reviews && (
            <span>
              <i className="fas fa-comment me-1"></i>
              {product.reviews} reviews
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
