import { createContext, useContext, useReducer, useEffect, useCallback } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id && item.color === action.payload.color
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id && item.color === action.payload.color
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          lastUpdated: Date.now(),
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, addedAt: Date.now() }],
        lastUpdated: Date.now(),
      };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.id === action.payload.id &&
              item.color === action.payload.color
            )
        ),
        lastUpdated: Date.now(),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id && item.color === action.payload.color
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        lastUpdated: Date.now(),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        lastUpdated: Date.now(),
      };

    case "LOAD_CART":
      return {
        ...action.payload,
        lastUpdated: action.payload.lastUpdated || Date.now(),
      };

    case "APPLY_COUPON":
      return {
        ...state,
        appliedCoupon: action.payload,
        lastUpdated: Date.now(),
      };

    case "REMOVE_COUPON":
      return {
        ...state,
        appliedCoupon: null,
        lastUpdated: Date.now(),
      };

    case "SET_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddress: action.payload,
        lastUpdated: Date.now(),
      };

    case "SET_SHIPPING_METHOD":
      return {
        ...state,
        shippingMethod: action.payload,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  appliedCoupon: null,
  shippingAddress: null,
  shippingMethod: null,
  lastUpdated: Date.now(),
};

// Cart expiration time (7 days)
const CART_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000;

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("flora-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Check if cart has expired
        if (parsedCart.lastUpdated && 
            Date.now() - parsedCart.lastUpdated > CART_EXPIRATION_TIME) {
          localStorage.removeItem("flora-cart");
          console.log("Cart expired, cleared");
          return;
        }
        
        dispatch({ type: "LOAD_CART", payload: parsedCart });
      } catch (error) {
        console.error("Error loading cart:", error);
        localStorage.removeItem("flora-cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0 || state.appliedCoupon || state.shippingAddress) {
      localStorage.setItem("flora-cart", JSON.stringify(state));
    } else {
      localStorage.removeItem("flora-cart");
    }
  }, [state]);

  // Auto-save cart periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.items.length > 0) {
        localStorage.setItem("flora-cart", JSON.stringify(state));
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [state]);

  const addToCart = useCallback((
    product,
    quantity = 1,
    imageOverride = null,
    color = "default"
  ) => {
    // Validate product data
    if (!product || !product.id || !product.name || !product.price) {
      console.error("Invalid product data:", product);
      return false;
    }

    // Validate quantity
    if (quantity <= 0 || quantity > 99) {
      console.error("Invalid quantity:", quantity);
      return false;
    }

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageOverride || product.image,
        color: color,
        quantity,
        originalPrice: product.originalPrice || product.price,
        category: product.category || "Plants",
        sku: product.sku || `${product.id}-${color}`,
      },
    });

    // Track analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "add_to_cart", {
        currency: "INR",
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: quantity,
          category: product.category || "Plants",
        }],
      });
    }

    return true;
  }, []);

  const removeFromCart = useCallback((id, color) => {
    const item = state.items.find(
      (item) => item.id === id && item.color === color
    );
    
    if (item) {
      dispatch({
        type: "REMOVE_FROM_CART",
        payload: { id, color },
      });

      // Track analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "remove_from_cart", {
          currency: "INR",
          value: item.price * item.quantity,
          items: [{
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
          }],
        });
      }
    }
  }, [state.items]);

  const updateQuantity = useCallback((id, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, color);
    } else if (quantity > 99) {
      console.warn("Quantity cannot exceed 99");
      return;
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id, color, quantity },
      });
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    
    // Track analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "clear_cart", {
        currency: "INR",
        value: getCartTotal(),
      });
    }
  }, []);

  const getCartCount = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  const getCartTotal = useCallback(() => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [state.items]);

  const getCartSubtotal = useCallback(() => {
    return getCartTotal();
  }, [getCartTotal]);

  const getCartTax = useCallback(() => {
    const subtotal = getCartSubtotal();
    return Math.round(subtotal * 0.18); // 18% GST
  }, [getCartSubtotal]);

  const getCartShipping = useCallback(() => {
    if (state.shippingMethod) {
      return state.shippingMethod.price;
    }
    return getCartTotal() > 999 ? 0 : 99; // Free shipping above ₹999
  }, [state.shippingMethod, getCartTotal]);

  const getCartGrandTotal = useCallback(() => {
    return getCartSubtotal() + getCartTax() + getCartShipping();
  }, [getCartSubtotal, getCartTax, getCartShipping]);

  const getCartDiscount = useCallback(() => {
    if (!state.appliedCoupon) return 0;
    
    const subtotal = getCartSubtotal();
    if (state.appliedCoupon.type === "percentage") {
      return Math.round(subtotal * (state.appliedCoupon.value / 100));
    } else if (state.appliedCoupon.type === "fixed") {
      return Math.min(state.appliedCoupon.value, subtotal);
    }
    return 0;
  }, [state.appliedCoupon, getCartSubtotal]);

  const applyCoupon = useCallback((couponCode) => {
    // Mock coupon validation - in real app, this would call an API
    const validCoupons = {
      "WELCOME10": { type: "percentage", value: 10, description: "10% off on first order" },
      "SAVE100": { type: "fixed", value: 100, description: "₹100 off on orders above ₹500" },
      "FREESHIP": { type: "shipping", value: 0, description: "Free shipping" }
    };

    const coupon = validCoupons[couponCode];
    if (coupon) {
      dispatch({ type: "APPLY_COUPON", payload: { code: couponCode, ...coupon } });
      return { success: true, message: `Coupon applied: ${coupon.description}` };
    } else {
      return { success: false, message: "Invalid coupon code" };
    }
  }, []);

  const removeCoupon = useCallback(() => {
    dispatch({ type: "REMOVE_COUPON" });
  }, []);

  const setShippingAddress = useCallback((address) => {
    dispatch({ type: "SET_SHIPPING_ADDRESS", payload: address });
  }, []);

  const setShippingMethod = useCallback((method) => {
    dispatch({ type: "SET_SHIPPING_METHOD", payload: method });
  }, []);

  const isCartEmpty = useCallback(() => {
    return state.items.length === 0;
  }, [state.items]);

  const getCartItem = useCallback((id, color) => {
    return state.items.find(
      (item) => item.id === id && item.color === color
    );
  }, [state.items]);

  const getCartSummary = useCallback(() => {
    return {
      itemCount: getCartCount(),
      subtotal: getCartSubtotal(),
      tax: getCartTax(),
      shipping: getCartShipping(),
      discount: getCartDiscount(),
      grandTotal: getCartGrandTotal(),
      appliedCoupon: state.appliedCoupon,
      shippingAddress: state.shippingAddress,
      shippingMethod: state.shippingMethod,
    };
  }, [
    getCartCount,
    getCartSubtotal,
    getCartTax,
    getCartShipping,
    getCartDiscount,
    getCartGrandTotal,
    state.appliedCoupon,
    state.shippingAddress,
    state.shippingMethod,
  ]);

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        getCartSubtotal,
        getCartTax,
        getCartShipping,
        getCartGrandTotal,
        getCartDiscount,
        applyCoupon,
        removeCoupon,
        setShippingAddress,
        setShippingMethod,
        isCartEmpty,
        getCartItem,
        getCartSummary,
        lastUpdated: state.lastUpdated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
