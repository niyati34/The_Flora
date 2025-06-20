import { createContext, useContext, useState, useEffect } from "react";

const StockContext = createContext();

export function StockProvider({ children }) {
  const [stockData, setStockData] = useState({});

  // Initialize default stock levels
  useEffect(() => {
    const defaultStock = {
      "peace-lily": { available: 15, reserved: 0 },
      "snake-plant": { available: 12, reserved: 0 },
      pothos: { available: 20, reserved: 0 },
      "fiddle-leaf": { available: 8, reserved: 0 },
      monstera: { available: 10, reserved: 0 },
      "spider-plant": { available: 18, reserved: 0 },
    };

    const savedStock = localStorage.getItem("plantStock");
    if (savedStock) {
      setStockData(JSON.parse(savedStock));
    } else {
      setStockData(defaultStock);
    }
  }, []);

  // Save stock data to localStorage
  useEffect(() => {
    if (Object.keys(stockData).length > 0) {
      localStorage.setItem("plantStock", JSON.stringify(stockData));
    }
  }, [stockData]);

  const getAvailableStock = (productId) => {
    const stock = stockData[productId];
    return stock ? stock.available : 0;
  };

  const reserveStock = (productId, quantity) => {
    setStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        available: prev[productId]?.available - quantity || 0,
        reserved: (prev[productId]?.reserved || 0) + quantity,
      },
    }));
  };

  const releaseReservedStock = (productId, quantity) => {
    setStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        available: (prev[productId]?.available || 0) + quantity,
        reserved: prev[productId]?.reserved - quantity || 0,
      },
    }));
  };

  const isInStock = (productId, requestedQuantity = 1) => {
    const available = getAvailableStock(productId);
    return available >= requestedQuantity;
  };

  const getStockStatus = (productId) => {
    const available = getAvailableStock(productId);
    if (available === 0) return "Out of Stock";
    if (available <= 3) return "Low Stock";
    return "In Stock";
  };

  const restockItem = (productId, quantity) => {
    setStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        available: (prev[productId]?.available || 0) + quantity,
      },
    }));
  };

  return (
    <StockContext.Provider
      value={{
        stockData,
        getAvailableStock,
        reserveStock,
        releaseReservedStock,
        isInStock,
        getStockStatus,
        restockItem,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};
