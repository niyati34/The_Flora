import { createContext, useContext, useReducer, useEffect, useCallback } from "react";

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_WISHLIST":
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Item already in wishlist
      }
      
      return {
        ...state,
        items: [...state.items, { 
          ...action.payload, 
          addedAt: Date.now(),
          wishlistId: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }],
        lastUpdated: Date.now(),
      };

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastUpdated: Date.now(),
      };

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
        lastUpdated: Date.now(),
      };

    case "MOVE_TO_CART":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastUpdated: Date.now(),
      };

    case "UPDATE_WISHLIST_ITEM":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
        lastUpdated: Date.now(),
      };

    case "LOAD_WISHLIST":
      return {
        ...action.payload,
        lastUpdated: action.payload.lastUpdated || Date.now(),
      };

    case "SET_WISHLIST_NAME":
      return {
        ...state,
        name: action.payload,
        lastUpdated: Date.now(),
      };

    case "SET_WISHLIST_DESCRIPTION":
      return {
        ...state,
        description: action.payload,
        lastUpdated: Date.now(),
      };

    case "SET_WISHLIST_PRIVATE":
      return {
        ...state,
        isPrivate: action.payload,
        lastUpdated: Date.now(),
      };

    case "ADD_WISHLIST_NOTE":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.productId
            ? { ...item, note: action.payload.note, noteUpdatedAt: Date.now() }
            : item
        ),
        lastUpdated: Date.now(),
      };

    case "REMOVE_WISHLIST_NOTE":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, note: null, noteUpdatedAt: null }
            : item
        ),
        lastUpdated: Date.now(),
      };

    case "SORT_WISHLIST":
      return {
        ...state,
        items: [...state.items].sort((a, b) => {
          switch (action.payload) {
            case "name":
              return a.name.localeCompare(b.name);
            case "price-low":
              return a.price - b.price;
            case "price-high":
              return b.price - a.price;
            case "date-added":
              return b.addedAt - a.addedAt;
            case "rating":
              return (b.rating || 0) - (a.rating || 0);
            default:
              return 0;
          }
        }),
        lastUpdated: Date.now(),
      };

    case "FILTER_WISHLIST":
      return {
        ...state,
        filters: action.payload,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  name: "My Wishlist",
  description: "Plants and gardening items I love",
  isPrivate: false,
  filters: {
    category: "all",
    priceRange: "all",
    rating: "all",
    inStock: false
  },
  lastUpdated: Date.now(),
};

// Wishlist expiration time (1 year)
const WISHLIST_EXPIRATION_TIME = 365 * 24 * 60 * 60 * 1000;

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("flora-wishlist");
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        
        // Check if wishlist has expired
        if (parsedWishlist.lastUpdated && 
            Date.now() - parsedWishlist.lastUpdated > WISHLIST_EXPIRATION_TIME) {
          localStorage.removeItem("flora-wishlist");
          console.log("Wishlist expired, cleared");
          return;
        }
        
        dispatch({ type: "LOAD_WISHLIST", payload: parsedWishlist });
      } catch (error) {
        console.error("Error loading wishlist:", error);
        localStorage.removeItem("flora-wishlist");
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0 || state.name !== "My Wishlist" || state.description !== "Plants and gardening items I love") {
      localStorage.setItem("flora-wishlist", JSON.stringify(state));
    } else {
      localStorage.removeItem("flora-wishlist");
    }
  }, [state]);

  // Auto-save wishlist periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.items.length > 0) {
        localStorage.setItem("flora-wishlist", JSON.stringify(state));
      }
    }, 60000); // Save every minute

    return () => clearInterval(interval);
  }, [state]);

  const addToWishlist = useCallback((product) => {
    // Validate product data
    if (!product || !product.id || !product.name || !product.price) {
      console.error("Invalid product data:", product);
      return false;
    }

    dispatch({
      type: "ADD_TO_WISHLIST",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category || "Plants",
        rating: product.rating,
        originalPrice: product.originalPrice || product.price,
        sku: product.sku || product.id,
        description: product.description,
        features: product.features,
      },
    });

    // Track analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "add_to_wishlist", {
        currency: "INR",
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          category: product.category || "Plants",
        }],
      });
    }

    return true;
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    const item = state.items.find(item => item.id === productId);
    
    if (item) {
      dispatch({
        type: "REMOVE_FROM_WISHLIST",
        payload: productId,
      });

      // Track analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "remove_from_wishlist", {
          currency: "INR",
          value: item.price,
          items: [{
            item_id: item.id,
            item_name: item.name,
            price: item.price,
          }],
        });
      }
    }
  }, [state.items]);

  const clearWishlist = useCallback(() => {
    dispatch({ type: "CLEAR_WISHLIST" });
    
    // Track analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "clear_wishlist", {
        currency: "INR",
        value: getWishlistTotal(),
      });
    }
  }, []);

  const moveToCart = useCallback((productId) => {
    dispatch({ type: "MOVE_TO_CART", payload: productId });
  }, []);

  const updateWishlistItem = useCallback((productId, updates) => {
    dispatch({
      type: "UPDATE_WISHLIST_ITEM",
      payload: { id: productId, updates },
    });
  }, []);

  const isInWishlist = useCallback((productId) => {
    return state.items.some(item => item.id === productId);
  }, [state.items]);

  const getWishlistCount = useCallback(() => {
    return state.items.length;
  }, [state.items]);

  const getWishlistTotal = useCallback(() => {
    return state.items.reduce((total, item) => total + item.price, 0);
  }, [state.items]);

  const getWishlistItems = useCallback(() => {
    return state.items;
  }, [state.items]);

  const getWishlistItem = useCallback((productId) => {
    return state.items.find(item => item.id === productId);
  }, [state.items]);

  const setWishlistName = useCallback((name) => {
    dispatch({ type: "SET_WISHLIST_NAME", payload: name });
  }, []);

  const setWishlistDescription = useCallback((description) => {
    dispatch({ type: "SET_WISHLIST_DESCRIPTION", payload: description });
  }, []);

  const setWishlistPrivate = useCallback((isPrivate) => {
    dispatch({ type: "SET_WISHLIST_PRIVATE", payload: isPrivate });
  }, []);

  const addNote = useCallback((productId, note) => {
    if (note.trim()) {
      dispatch({
        type: "ADD_WISHLIST_NOTE",
        payload: { productId, note: note.trim() },
      });
    }
  }, []);

  const removeNote = useCallback((productId) => {
    dispatch({ type: "REMOVE_WISHLIST_NOTE", payload: productId });
  }, []);

  const sortWishlist = useCallback((sortBy) => {
    dispatch({ type: "SORT_WISHLIST", payload: sortBy });
  }, []);

  const filterWishlist = useCallback((filters) => {
    dispatch({ type: "FILTER_WISHLIST", payload: filters });
  }, []);

  const getFilteredWishlist = useCallback(() => {
    let filteredItems = [...state.items];

    // Apply category filter
    if (state.filters.category !== "all") {
      filteredItems = filteredItems.filter(item => item.category === state.filters.category);
    }

    // Apply price range filter
    if (state.filters.priceRange !== "all") {
      filteredItems = filteredItems.filter(item => {
        const price = item.price;
        switch (state.filters.priceRange) {
          case "0-200":
            return price <= 200;
          case "200-500":
            return price > 200 && price <= 500;
          case "500-1000":
            return price > 500 && price <= 1000;
          case "1000+":
            return price > 1000;
          default:
            return true;
        }
      });
    }

    // Apply rating filter
    if (state.filters.rating !== "all") {
      filteredItems = filteredItems.filter(item => {
        const rating = item.rating || 0;
        switch (state.filters.rating) {
          case "4+":
            return rating >= 4;
          case "3+":
            return rating >= 3;
          default:
            return true;
        }
      });
    }

    // Apply stock filter
    if (state.filters.inStock) {
      filteredItems = filteredItems.filter(item => item.stock > 0);
    }

    return filteredItems;
  }, [state.items, state.filters]);

  const getWishlistStats = useCallback(() => {
    const totalItems = state.items.length;
    const totalValue = getWishlistTotal();
    const categories = [...new Set(state.items.map(item => item.category))];
    const avgRating = state.items.reduce((sum, item) => sum + (item.rating || 0), 0) / totalItems || 0;
    
    const priceRanges = {
      "0-200": state.items.filter(item => item.price <= 200).length,
      "200-500": state.items.filter(item => item.price > 200 && item.price <= 500).length,
      "500-1000": state.items.filter(item => item.price > 500 && item.price <= 1000).length,
      "1000+": state.items.filter(item => item.price > 1000).length,
    };

    return {
      totalItems,
      totalValue,
      categories,
      avgRating: Math.round(avgRating * 10) / 10,
      priceRanges,
      lastUpdated: state.lastUpdated,
    };
  }, [state.items, getWishlistTotal, state.lastUpdated]);

  const exportWishlist = useCallback(() => {
    const wishlistData = {
      name: state.name,
      description: state.description,
      items: state.items,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(wishlistData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wishlist-${state.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.name, state.description, state.items]);

  const shareWishlist = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: state.name,
        text: state.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `${state.name}\n${state.description}\n\nItems:\n${state.items.map(item => `- ${item.name} (₹${item.price})`).join('\n')}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Wishlist copied to clipboard!");
      });
    }
  }, [state.name, state.description, state.items]);

  const getWishlistSummary = useCallback(() => {
    return {
      ...getWishlistStats(),
      items: getFilteredWishlist(),
      filters: state.filters,
      name: state.name,
      description: state.description,
      isPrivate: state.isPrivate,
    };
  }, [getWishlistStats, getFilteredWishlist, state.filters, state.name, state.description, state.isPrivate]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist: state,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        moveToCart,
        updateWishlistItem,
        isInWishlist,
        getWishlistCount,
        getWishlistTotal,
        getWishlistItems,
        getWishlistItem,
        setWishlistName,
        setWishlistDescription,
        setWishlistPrivate,
        addNote,
        removeNote,
        sortWishlist,
        filterWishlist,
        getFilteredWishlist,
        getWishlistStats,
        exportWishlist,
        shareWishlist,
        getWishlistSummary,
        lastUpdated: state.lastUpdated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
