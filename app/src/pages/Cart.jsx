import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LazyImage from "../components/LazyImage";

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartSummary,
    applyCoupon,
    removeCoupon,
    setShippingMethod
  } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");

  const cartSummary = getCartSummary();

  const shippingMethods = [
    { id: "standard", name: "Standard Delivery", price: 99, days: "3-5 days" },
    { id: "express", name: "Express Delivery", price: 199, days: "1-2 days" },
    { id: "free", name: "Free Delivery", price: 0, days: "5-7 days", minOrder: 999 }
  ];

  const handleQuantityChange = (id, color, newQuantity) => {
    if (newQuantity > 0 && newQuantity <= 99) {
      updateQuantity(id, color, newQuantity);
    }
  };

  const handleRemoveItem = (id, color) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      removeFromCart(id, color);
    }
  };

  const handleMoveToWishlist = (item) => {
    removeFromCart(item.id, item.color);
    addToWishlist(item);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponMessage("");
    
    try {
      const result = applyCoupon(couponCode.trim());
      if (result.success) {
        setCouponMessage(result.message);
        setCouponCode("");
      } else {
        setCouponMessage(result.message);
      }
    } catch (error) {
      setCouponMessage("Error applying coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage("");
  };

  const handleShippingMethodChange = (methodId) => {
    setSelectedShippingMethod(methodId);
    const method = shippingMethods.find(m => m.id === methodId);
    if (method) {
      setShippingMethod(method);
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // In a real app, this would redirect to checkout
    alert("Redirecting to checkout...");
    // navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  useEffect(() => {
    // Set default shipping method
    if (cartSummary.subtotal >= 999) {
      handleShippingMethodChange("free");
    } else {
      handleShippingMethodChange("standard");
    }
  }, [cartSummary.subtotal]);

  if (cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <style>
          {`
            .empty-cart {
              text-align: center;
              padding: 80px 20px;
              background: #f8f9fa;
              min-height: 60vh;
            }
            
            .empty-cart-icon {
              font-size: 80px;
              color: #ccc;
              margin-bottom: 24px;
            }
            
            .empty-cart-title {
              font-size: 28px;
              font-weight: 600;
              color: #333;
              margin-bottom: 16px;
            }
            
            .empty-cart-text {
              color: #666;
              margin-bottom: 32px;
              font-size: 16px;
            }
            
            .empty-cart-actions {
              display: flex;
              gap: 16px;
              justify-content: center;
              flex-wrap: wrap;
            }
            
            .btn-primary-custom {
              background: #6A9304;
              border: none;
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              text-decoration: none;
              transition: all 0.3s ease;
            }
            
            .btn-primary-custom:hover {
              background: #5a7d03;
              transform: translateY(-2px);
              color: white;
            }
            
            .btn-outline-custom {
              border: 2px solid #6A9304;
              background: white;
              color: #6A9304;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              text-decoration: none;
              transition: all 0.3s ease;
            }
            
            .btn-outline-custom:hover {
              background: #6A9304;
              color: white;
            }
          `}
        </style>
        
        <div className="empty-cart-icon">
          <i className="fas fa-shopping-cart"></i>
        </div>
        <h2 className="empty-cart-title">Your cart is empty</h2>
        <p className="empty-cart-text">
          Looks like you haven't added any plants to your cart yet.
        </p>
        <div className="empty-cart-actions">
          <Link to="/" className="btn-primary-custom">
            <i className="fas fa-leaf me-2"></i>
            Start Shopping
          </Link>
          <Link to="/plants/indoor" className="btn-outline-custom">
            <i className="fas fa-home me-2"></i>
            Browse Indoor Plants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <style>
        {`
          .cart-page {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 20px 0;
          }
          
          .cart-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          
          .cart-header {
            background: linear-gradient(135deg, #6A9304, #8bc34a);
            color: white;
            padding: 24px;
            text-align: center;
          }
          
          .cart-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          
          .cart-header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
          }
          
          .cart-content {
            padding: 32px;
          }
          
          .cart-items {
            margin-bottom: 32px;
          }
          
          .cart-item {
            display: flex;
            gap: 20px;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            margin-bottom: 16px;
            background: white;
            transition: all 0.3s ease;
          }
          
          .cart-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
          
          .item-image {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
          }
          
          .item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .item-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          
          .item-meta {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
            color: #666;
          }
          
          .item-color {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .color-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 0 1px #ddd;
          }
          
          .item-actions {
            display: flex;
            gap: 12px;
            align-items: center;
          }
          
          .quantity-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 4px;
          }
          
          .quantity-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: #f8f9fa;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .quantity-btn:hover {
            background: #6A9304;
            color: white;
          }
          
          .quantity-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .quantity-input {
            width: 50px;
            text-align: center;
            border: none;
            background: transparent;
            font-size: 14px;
            font-weight: 600;
          }
          
          .item-price {
            font-size: 20px;
            font-weight: 700;
            color: #6A9304;
            text-align: right;
            min-width: 120px;
          }
          
          .action-buttons {
            display: flex;
            gap: 8px;
          }
          
          .btn-action {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
            font-weight: 600;
          }
          
          .btn-remove {
            background: #f8d7da;
            color: #721c24;
          }
          
          .btn-remove:hover {
            background: #f5c6cb;
          }
          
          .btn-wishlist {
            background: #fff3cd;
            color: #856404;
          }
          
          .btn-wishlist:hover {
            background: #ffeaa7;
          }
          
          .cart-summary {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin-top: 32px;
          }
          
          .summary-title {
            font-size: 20px;
            font-weight: 700;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e9ecef;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
          }
          
          .summary-row.total {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            border-top: 1px solid #e9ecef;
            padding-top: 12px;
            margin-top: 12px;
          }
          
          .coupon-section {
            margin-bottom: 24px;
          }
          
          .coupon-input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
          }
          
          .coupon-input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
          }
          
          .coupon-input:focus {
            outline: none;
            border-color: #6A9304;
          }
          
          .btn-apply-coupon {
            background: #6A9304;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .btn-apply-coupon:hover {
            background: #5a7d03;
          }
          
          .btn-apply-coupon:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          
          .coupon-message {
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 12px;
          }
          
          .coupon-message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .coupon-message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
          
          .shipping-section {
            margin-bottom: 24px;
          }
          
          .shipping-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .shipping-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .shipping-option:hover {
            border-color: #6A9304;
          }
          
          .shipping-option.selected {
            border-color: #6A9304;
            background: #f0f8e8;
          }
          
          .shipping-option input[type="radio"] {
            margin: 0;
          }
          
          .shipping-info {
            flex: 1;
          }
          
          .shipping-name {
            font-weight: 600;
            color: #333;
          }
          
          .shipping-details {
            font-size: 12px;
            color: #666;
          }
          
          .shipping-price {
            font-weight: 600;
            color: #6A9304;
          }
          
          .checkout-section {
            text-align: center;
            margin-top: 24px;
          }
          
          .btn-checkout {
            background: linear-gradient(135deg, #6A9304, #8bc34a);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 16px;
          }
          
          .btn-checkout:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(106, 147, 4, 0.3);
          }
          
          .btn-continue-shopping {
            background: transparent;
            border: 2px solid #6A9304;
            color: #6A9304;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-block;
          }
          
          .btn-continue-shopping:hover {
            background: #6A9304;
            color: white;
          }
          
          .cart-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e9ecef;
          }
          
          .btn-clear-cart {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .btn-clear-cart:hover {
            background: #c82333;
          }
          
          @media (max-width: 768px) {
            .cart-item {
              flex-direction: column;
              text-align: center;
            }
            
            .item-actions {
              justify-content: center;
            }
            
            .item-price {
              text-align: center;
              margin-top: 12px;
            }
            
            .coupon-input-group {
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="container">
        <div className="cart-container">
          <div className="cart-header">
            <h1>
              <i className="fas fa-shopping-cart me-3"></i>
              Shopping Cart
            </h1>
            <p>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="cart-content">
            <div className="cart-actions">
              <button 
                className="btn-clear-cart"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your cart?")) {
                    clearCart();
                  }
                }}
              >
                <i className="fas fa-trash me-2"></i>
                Clear Cart
              </button>
              <span className="text-muted">
                Total: ₹{cartSummary.grandTotal}
              </span>
            </div>

            <div className="cart-items">
              {cart.items.map((item, index) => (
                <div key={`${item.id}-${item.color}`} className="cart-item">
                  <div className="item-image">
                    <LazyImage
                      src={item.image}
                      alt={item.name}
                    />
                  </div>
                  
                  <div className="item-details">
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        <span className="item-color">
                          <div 
                            className="color-dot" 
                            style={{ backgroundColor: item.color === 'default' ? '#6A9304' : item.color }}
                          ></div>
                          {item.color === 'default' ? 'Default' : item.color}
                        </span>
                        <span>SKU: {item.sku || `${item.id}-${item.color}`}</span>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.color, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          className="quantity-input"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, item.color, parseInt(e.target.value) || 1)}
                          min="1"
                          max="99"
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.color, item.quantity + 1)}
                          disabled={item.quantity >= 99}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-remove"
                          onClick={() => handleRemoveItem(item.id, item.color)}
                          title="Remove from cart"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <button
                          className="btn-action btn-wishlist"
                          onClick={() => handleMoveToWishlist(item)}
                          title="Move to wishlist"
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>
              
              <div className="coupon-section">
                <h5>Have a coupon?</h5>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    className="coupon-input"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    className="btn-apply-coupon"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                
                {couponMessage && (
                  <div className={`coupon-message ${couponMessage.includes('applied') ? 'success' : 'error'}`}>
                    {couponMessage}
                    {couponMessage.includes('applied') && (
                      <button
                        onClick={handleRemoveCoupon}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'inherit', 
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="shipping-section">
                <h5>Shipping Method</h5>
                <div className="shipping-options">
                  {shippingMethods.map((method) => (
                    <label key={method.id} className={`shipping-option ${selectedShippingMethod === method.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShippingMethod === method.id}
                        onChange={() => handleShippingMethodChange(method.id)}
                      />
                      <div className="shipping-info">
                        <div className="shipping-name">{method.name}</div>
                        <div className="shipping-details">
                          {method.days}
                          {method.minOrder && ` • Min order ₹${method.minOrder}`}
                        </div>
                      </div>
                      <div className="shipping-price">
                        {method.price === 0 ? 'FREE' : `₹${method.price}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span>₹{cartSummary.subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹{cartSummary.tax}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{cartSummary.shipping === 0 ? 'FREE' : `₹${cartSummary.shipping}`}</span>
                </div>
                {cartSummary.discount > 0 && (
                  <div className="summary-row">
                    <span>Discount</span>
                    <span style={{ color: '#28a745' }}>-₹{cartSummary.discount}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{cartSummary.grandTotal}</span>
                </div>
              </div>

              <div className="checkout-section">
                <button className="btn-checkout" onClick={handleCheckout}>
                  <i className="fas fa-credit-card me-2"></i>
                  Proceed to Checkout
                </button>
                <br />
                <button className="btn-continue-shopping" onClick={handleContinueShopping}>
                  <i className="fas fa-arrow-left me-2"></i>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
