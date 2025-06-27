import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import LazyImage from "../components/LazyImage";
import ProductRecommendations from "../components/ProductRecommendations";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      addToRecentlyViewed(foundProduct);
    }
    setIsLoading(false);
  }, [id, addToRecentlyViewed]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - The Flora`;
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Go Back Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, null, selectedColor);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const cartItem = getCartItem(product.id, selectedColor);
  const isInCart = !!cartItem;

  return (
    <div className="product-detail-page">
      <style>
        {`
          .product-detail-page {
            background: #f8f9fa;
            min-height: 100vh;
          }
          
          .product-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
            margin: 20px 0;
          }
          
          .product-gallery {
            position: relative;
            background: #f8f9fa;
          }
          
          .main-image-container {
            position: relative;
            aspect-ratio: 1;
            background: white;
            cursor: pointer;
            overflow: hidden;
            border-radius: 12px;
          }
          
          .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .main-image:hover {
            transform: scale(1.05);
          }
          
          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            cursor: pointer;
          }
          
          .main-image-container:hover .image-overlay {
            opacity: 1;
          }
          
          .image-overlay i {
            color: white;
            font-size: 24px;
          }
          
          .thumbnail-gallery {
            display: flex;
            gap: 12px;
            margin-top: 16px;
            overflow-x: auto;
            padding: 8px 0;
          }
          
          .thumbnail {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          
          .thumbnail.active {
            border-color: #6A9304;
            transform: scale(1.05);
          }
          
          .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
          }
          
          .product-info {
            padding: 32px;
          }
          
          .product-title {
            font-size: 28px;
            font-weight: 700;
            color: #333;
            margin-bottom: 16px;
            line-height: 1.3;
          }
          
          .product-rating {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          
          .rating-stars {
            display: flex;
            gap: 4px;
          }
          
          .rating-stars i {
            color: #ffd700;
            font-size: 18px;
          }
          
          .rating-text {
            color: #666;
            font-size: 14px;
          }
          
          .product-price {
            margin-bottom: 24px;
          }
          
          .current-price {
            font-size: 32px;
            font-weight: 700;
            color: #6A9304;
            margin-right: 16px;
          }
          
          .original-price {
            font-size: 20px;
            color: #999;
            text-decoration: line-through;
          }
          
          .discount-badge {
            display: inline-block;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-left: 12px;
          }
          
          .product-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          
          .product-features {
            margin-bottom: 24px;
          }
          
          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: #555;
          }
          
          .feature-item i {
            color: #6A9304;
            width: 20px;
          }
          
          .product-options {
            margin-bottom: 32px;
          }
          
          .option-group {
            margin-bottom: 20px;
          }
          
          .option-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            display: block;
          }
          
          .color-options {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          .color-option {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }
          
          .color-option.active {
            border-color: #6A9304;
            transform: scale(1.1);
          }
          
          .color-option:hover {
            transform: scale(1.05);
          }
          
          .quantity-selector {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          
          .quantity-btn {
            width: 40px;
            height: 40px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .quantity-btn:hover {
            border-color: #6A9304;
            color: #6A9304;
          }
          
          .quantity-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .quantity-input {
            width: 60px;
            height: 40px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
          }
          
          .action-buttons {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
          }
          
          .btn-add-to-cart {
            flex: 2;
            height: 50px;
            background: #6A9304;
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .btn-add-to-cart:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .btn-add-to-cart:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
          }
          
          .btn-wishlist {
            width: 50px;
            height: 50px;
            border: 2px solid #6A9304;
            background: white;
            border-radius: 12px;
            color: #6A9304;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .btn-wishlist:hover {
            background: #6A9304;
            color: white;
          }
          
          .btn-wishlist.active {
            background: #ff6b6b;
            border-color: #ff6b6b;
            color: white;
          }
          
          .product-tabs {
            margin-top: 40px;
          }
          
          .tab-navigation {
            display: flex;
            border-bottom: 2px solid #f1f3f4;
            margin-bottom: 24px;
          }
          
          .tab-button {
            padding: 16px 24px;
            border: none;
            background: none;
            color: #666;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
          }
          
          .tab-button.active {
            color: #6A9304;
            border-bottom-color: #6A9304;
          }
          
          .tab-button:hover {
            color: #6A9304;
          }
          
          .tab-content {
            color: #666;
            line-height: 1.6;
          }
          
          .faq-item {
            margin-bottom: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          
          .faq-question {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          
          .faq-answer {
            color: #666;
          }
          
          .stock-status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
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
          
          .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: pointer;
          }
          
          .modal-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
          }
          
          .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            color: white;
            font-size: 32px;
            cursor: pointer;
            background: rgba(0,0,0,0.5);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>

      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="/category" className="text-decoration-none">Products</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="product-container">
          <div className="row g-0">
            <div className="col-lg-6">
              <div className="product-gallery p-4">
                <div 
                  className="main-image-container"
                  onClick={() => setShowImageModal(true)}
                >
                  <LazyImage
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="main-image"
                  />
                  <div className="image-overlay">
                    <i className="fas fa-expand"></i>
                  </div>
                </div>

                <div className="thumbnail-gallery">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <LazyImage
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="product-info">
                <h1 className="product-title">{product.name}</h1>
                
                <div className="product-rating">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star} 
                        className={`fas fa-star ${star <= (product.rating || 0) ? 'filled' : ''}`}
                      ></i>
                    ))}
                  </div>
                  <span className="rating-text">
                    {product.rating || 4.5} ({product.reviews || 128} reviews)
                  </span>
                </div>

                <div className="product-price">
                  <span className="current-price">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="original-price">₹{product.originalPrice}</span>
                      <span className="discount-badge">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="product-description">{product.description}</p>

                <div className="product-features">
                  {product.features?.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="stock-status in-stock">
                  <i className="fas fa-check-circle me-2"></i>
                  In Stock - Free Delivery
                </div>

                <div className="product-options">
                  <div className="option-group">
                    <label className="option-label">Color:</label>
                    <div className="color-options">
                      {["default", "black", "white", "brown"].map(color => (
                        <div
                          key={color}
                          className={`color-option ${selectedColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color === 'default' ? '#6A9304' : color }}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="option-group">
                    <label className="option-label">Quantity:</label>
                    <div className="quantity-selector">
                      <button
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max="99"
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.min(99, quantity + 1))}
                        disabled={quantity >= 99}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className={`btn-add-to-cart ${isInCart ? 'btn-secondary' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    {isInCart ? (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart me-2"></i>
                        Add to Cart - ₹{product.price}
                      </>
                    )}
                  </button>
                  
                  <button
                    className={`btn-wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={handleWishlistToggle}
                    title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <i className={`fas ${isInWishlist(product.id) ? 'fa-heart' : 'fa-heart'}`}></i>
                  </button>
                </div>

                <div className="product-tabs">
                  <div className="tab-navigation">
                    <button
                      className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                      onClick={() => setActiveTab('description')}
                    >
                      Description
                    </button>
                    <button
                      className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
                      onClick={() => setActiveTab('features')}
                    >
                      Features
                    </button>
                    <button
                      className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
                      onClick={() => setActiveTab('faq')}
                    >
                      FAQ
                    </button>
                  </div>

                  <div className="tab-content">
                    {activeTab === 'description' && (
                      <div>
                        <p>{product.info || product.description}</p>
                      </div>
                    )}
                    
                    {activeTab === 'features' && (
                      <div>
                        <ul>
                          {product.features?.map((feature, index) => (
                            <li key={index} className="mb-2">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activeTab === 'faq' && (
                      <div>
                        {product.faqs?.map((faq, index) => (
                          <div key={index} className="faq-item">
                            <div className="faq-question">{faq.q}</div>
                            <div className="faq-answer">{faq.a}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductRecommendations 
          currentProductId={product.id}
          category={product.category}
        />
      </div>

      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="modal-image"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="modal-close" onClick={() => setShowImageModal(false)}>
            <i className="fas fa-times"></i>
          </div>
        </div>
      )}
    </div>
  );
}
