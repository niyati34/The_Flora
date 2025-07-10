import { useState, useEffect, useMemo, useCallback } from "react";
import { useCart, useWishlist } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function SmartShoppingAssistant({ className = "" }) {
  const { cart, getCartTotal, getCartSubtotal } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    budget: 5000,
    experience: "beginner",
    space: "medium",
    timeAvailable: "moderate",
    pets: false,
    children: false
  });

  // Calculate shopping insights
  const insights = useMemo(() => {
    const cartTotal = getCartTotal();
    const cartSubtotal = getCartSubtotal();
    const savings = cartSubtotal - cartTotal;
    const budgetRemaining = userPreferences.budget - cartTotal;
    const budgetUtilization = (cartTotal / userPreferences.budget) * 100;
    
    // Analyze cart composition
    const categories = cart.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {});
    
    const mostPopularCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";
    
    // Calculate average price per item
    const avgPricePerItem = cart.length > 0 ? cartTotal / cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    return {
      cartTotal,
      cartSubtotal,
      savings,
      budgetRemaining,
      budgetUtilization,
      categories,
      mostPopularCategory,
      avgPricePerItem,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart, getCartTotal, getCartSubtotal, userPreferences.budget]);

  // Generate personalized recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    // Budget-based recommendations
    if (insights.budgetRemaining > 1000) {
      recs.push({
        type: "budget",
        title: "Budget-Friendly Additions",
        message: `You have ₹${insights.budgetRemaining.toFixed(0)} remaining. Consider adding some budget plants!`,
        priority: "high",
        action: "Browse Budget Plants"
      });
    } else if (insights.budgetUtilization > 90) {
      recs.push({
        type: "budget",
        title: "Budget Alert",
        message: "You're close to your budget limit. Review your cart before checkout.",
        priority: "warning",
        action: "Review Cart"
      });
    }
    
    // Experience-based recommendations
    if (userPreferences.experience === "beginner" && cart.some(item => item.careLevel === "difficult")) {
      recs.push({
        type: "experience",
        title: "Care Level Warning",
        message: "You have some high-maintenance plants. Consider swapping for easier care options.",
        priority: "medium",
        action: "View Easy Care Plants"
      });
    }
    
    // Space-based recommendations
    if (userPreferences.space === "small" && cart.some(item => item.size === "large")) {
      recs.push({
        type: "space",
        title: "Space Consideration",
        message: "Large plants in your cart may not fit in small spaces.",
        priority: "medium",
        action: "Browse Small Plants"
      });
    }
    
    // Time-based recommendations
    if (userPreferences.timeAvailable === "limited" && cart.some(item => item.careLevel === "moderate")) {
      recs.push({
        type: "time",
        title: "Time Management",
        message: "Consider low-maintenance plants for busy schedules.",
        priority: "low",
        action: "View Low Maintenance"
      });
    }
    
    // Family-friendly recommendations
    if (userPreferences.children && cart.some(item => !item.petFriendly)) {
      recs.push({
        type: "family",
        title: "Family Safety",
        message: "Some plants may not be safe for children. Check safety ratings.",
        priority: "high",
        action: "View Safe Plants"
      });
    }
    
    // Complementary items
    if (cart.length > 0 && cart.length < 3) {
      recs.push({
        type: "complementary",
        title: "Complete Your Collection",
        message: "Add complementary plants for better visual appeal and care synergy.",
        priority: "low",
        action: "Get Recommendations"
      });
    }
    
    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1, warning: 4 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [cart, insights, userPreferences]);

  // Get shopping tips
  const shoppingTips = useMemo(() => {
    const tips = [];
    
    if (insights.savings > 0) {
      tips.push({
        icon: "💰",
        title: "Great Savings!",
        message: `You're saving ₹${insights.savings.toFixed(0)} on this order.`
      });
    }
    
    if (insights.itemCount >= 5) {
      tips.push({
        icon: "🚚",
        title: "Free Shipping",
        message: "Orders over ₹999 qualify for free shipping!"
      });
    }
    
    if (cart.some(item => item.discount)) {
      tips.push({
        icon: "🎉",
        title: "Sale Items",
        message: "You have items on sale in your cart."
      });
    }
    
    if (wishlist.length > 0) {
      tips.push({
        icon: "❤️",
        title: "Wishlist Items",
        message: `${wishlist.length} items in your wishlist. Consider adding them!`
      });
    }
    
    return tips;
  }, [insights, cart, wishlist]);

  // Handle recommendation actions
  const handleRecommendationAction = useCallback((recommendation) => {
    switch (recommendation.action) {
      case "Browse Budget Plants":
        navigate("/plants/low-maintenance");
        break;
      case "Review Cart":
        navigate("/cart");
        break;
      case "View Easy Care Plants":
        navigate("/plants/low-maintenance");
        break;
      case "Browse Small Plants":
        navigate("/plants/indoor");
        break;
      case "View Low Maintenance":
        navigate("/plants/low-maintenance");
        break;
      case "View Safe Plants":
        navigate("/plants/indoor");
        break;
      case "Get Recommendations":
        setIsExpanded(true);
        break;
      default:
        break;
    }
  });

  // Update user preferences
  const updatePreference = useCallback((key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  });

  return (
    <div className={`smart-shopping-assistant ${className}`}>
      {/* Header */}
      <div className="assistant-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-robot me-2 text-primary"></i>
            Smart Shopping Assistant
          </h5>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} me-1`}></i>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats mb-4">
        <div className="row text-center">
          <div className="col-3">
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-value">{insights.itemCount}</div>
              <div className="stat-label">Items</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">₹{insights.cartTotal.toFixed(0)}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{Math.round(insights.budgetUtilization)}%</div>
              <div className="stat-label">Budget Used</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{insights.mostPopularCategory}</div>
              <div className="stat-label">Top Category</div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section mb-4">
          <h6 className="section-title mb-3">
            <i className="fas fa-lightbulb me-2 text-warning"></i>
            Smart Recommendations
          </h6>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.priority}`}>
                <div className="recommendation-content">
                  <div className="recommendation-header">
                    <h6 className="recommendation-title">{rec.title}</h6>
                    <span className={`priority-badge ${rec.priority}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="recommendation-message">{rec.message}</p>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleRecommendationAction(rec)}
                  >
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping Tips */}
      {shoppingTips.length > 0 && (
        <div className="tips-section mb-4">
          <h6 className="section-title mb-3">
            <i className="fas fa-info-circle me-2 text-info"></i>
            Shopping Tips
          </h6>
          <div className="tips-list">
            {shoppingTips.map((tip, index) => (
              <div key={index} className="tip-card">
                <div className="tip-icon">{tip.icon}</div>
                <div className="tip-content">
                  <h6 className="tip-title">{tip.title}</h6>
                  <p className="tip-message">{tip.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="expanded-view">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-3">
                <i className="fas fa-cogs me-2"></i>
                Personalize Your Experience
              </h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Monthly Budget (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={userPreferences.budget}
                    onChange={(e) => updatePreference("budget", parseInt(e.target.value))}
                    min="1000"
                    max="50000"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Plant Care Experience</label>
                  <select
                    className="form-select"
                    value={userPreferences.experience}
                    onChange={(e) => updatePreference("experience", e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Available Space</label>
                  <select
                    className="form-select"
                    value={userPreferences.space}
                    onChange={(e) => updatePreference("space", e.target.value)}
                  >
                    <option value="small">Small (Apartment)</option>
                    <option value="medium">Medium (House)</option>
                    <option value="large">Large (Garden)</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Time Available</label>
                  <select
                    className="form-select"
                    value={userPreferences.timeAvailable}
                    onChange={(e) => updatePreference("timeAvailable", e.target.value)}
                  >
                    <option value="limited">Limited (Busy)</option>
                    <option value="moderate">Moderate</option>
                    <option value="plenty">Plenty (Flexible)</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hasPets"
                      checked={userPreferences.pets}
                      onChange={(e) => updatePreference("pets", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="hasPets">
                      I have pets
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hasChildren"
                      checked={userPreferences.children}
                      onChange={(e) => updatePreference("children", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="hasChildren">
                      I have children
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Progress */}
      <div className="budget-progress mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="budget-label">Budget Progress</span>
          <span className="budget-remaining">
            ₹{insights.budgetRemaining.toFixed(0)} remaining
          </span>
        </div>
        <div className="progress">
          <div 
            className={`progress-bar ${insights.budgetUtilization > 90 ? 'bg-warning' : 'bg-success'}`}
            style={{ width: `${Math.min(insights.budgetUtilization, 100)}%` }}
          ></div>
        </div>
        <small className="text-muted">
          Used: ₹{insights.cartTotal.toFixed(0)} / ₹{userPreferences.budget}
        </small>
      </div>

      <style jsx>{`
        .smart-shopping-assistant {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        
        .assistant-header {
          border-bottom: 2px solid #f8f9fa;
          padding-bottom: 15px;
        }
        
        .quick-stats {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          padding: 15px;
        }
        
        .stat-card {
          padding: 15px;
          text-align: center;
        }
        
        .stat-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #495057;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-title {
          color: #495057;
          font-weight: 600;
        }
        
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .recommendation-card {
          border-radius: 8px;
          padding: 15px;
          border-left: 4px solid;
          background: #f8f9fa;
        }
        
        .recommendation-card.high {
          border-left-color: #dc3545;
          background: #fff5f5;
        }
        
        .recommendation-card.medium {
          border-left-color: #ffc107;
          background: #fffbf0;
        }
        
        .recommendation-card.low {
          border-left-color: #28a745;
          background: #f0fff4;
        }
        
        .recommendation-card.warning {
          border-left-color: #fd7e14;
          background: #fff8f0;
        }
        
        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .recommendation-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
        
        .priority-badge {
          font-size: 10px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        
        .priority-badge.high {
          background: #dc3545;
          color: white;
        }
        
        .priority-badge.medium {
          background: #ffc107;
          color: #212529;
        }
        
        .priority-badge.low {
          background: #28a745;
          color: white;
        }
        
        .priority-badge.warning {
          background: #fd7e14;
          color: white;
        }
        
        .recommendation-message {
          font-size: 13px;
          color: #6c757d;
          margin-bottom: 12px;
        }
        
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .tip-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #e7f3ff;
          border-radius: 8px;
          border-left: 3px solid #0d6efd;
        }
        
        .tip-icon {
          font-size: 20px;
        }
        
        .tip-content {
          flex: 1;
        }
        
        .tip-title {
          margin: 0 0 4px 0;
          font-size: 13px;
          font-weight: 600;
          color: #0d6efd;
        }
        
        .tip-message {
          margin: 0;
          font-size: 12px;
          color: #495057;
        }
        
        .expanded-view {
          margin-top: 20px;
        }
        
        .budget-progress {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }
        
        .budget-label {
          font-weight: 600;
          color: #495057;
        }
        
        .budget-remaining {
          font-size: 14px;
          color: #6c757d;
        }
        
        .progress {
          height: 8px;
          border-radius: 4px;
          background: #e9ecef;
        }
        
        .progress-bar {
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}
