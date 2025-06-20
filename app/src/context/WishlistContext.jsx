import { createContext, useContext, useReducer, useEffect } from "react";

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_WISHLIST":
      const existingItem = state.items.find(
        (item) => item.id === action.product.id
      );
      if (existingItem) {
        return state; // Already in wishlist
      }
      return {
        ...state,
        items: [...state.items, action.product],
      };
    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.productId),
      };
    case "CLEAR_WISHLIST":
      return { items: [] };
    default:
      return state;
  }
};

export function WishlistProvider({ children }) {
  const [wishlistState, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      const items = JSON.parse(savedWishlist);
      items.forEach((item) => {
        dispatch({ type: "ADD_TO_WISHLIST", product: item });
      });
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistState.items));
  }, [wishlistState.items]);

  const addToWishlist = (product) => {
    dispatch({ type: "ADD_TO_WISHLIST", product });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", productId });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const isInWishlist = (productId) => {
    return wishlistState.items.some((item) => item.id === productId);
  };

  const getWishlistCount = () => {
    return wishlistState.items.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: wishlistState.items,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
