import { createContext, useContext, useState, useEffect } from "react";

const PriceAlertContext = createContext();

export function PriceAlertProvider({ children }) {
  const [priceAlerts, setPriceAlerts] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("priceAlerts");
    if (saved) {
      setPriceAlerts(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const addPriceAlert = (productId, targetPrice, userEmail = "") => {
    const newAlert = {
      id: Date.now(),
      productId,
      targetPrice,
      userEmail,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    setPriceAlerts(prev => [...prev, newAlert]);
    return newAlert.id;
  };

  const removePriceAlert = (alertId) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const checkPriceAlerts = (productId, currentPrice) => {
    const activeAlerts = priceAlerts.filter(
      alert => alert.productId === productId && 
               alert.isActive && 
               currentPrice <= alert.targetPrice
    );

    if (activeAlerts.length > 0) {
      // Simulate notification
      activeAlerts.forEach(alert => {
        console.log(`Price Alert: Product ${productId} is now ₹${currentPrice}, target was ₹${alert.targetPrice}`);
        // In real app, would send email or push notification
      });
      
      // Mark alerts as triggered
      setPriceAlerts(prev => 
        prev.map(alert => 
          activeAlerts.includes(alert) 
            ? { ...alert, isActive: false, triggeredAt: new Date().toISOString() }
            : alert
        )
      );
    }

    return activeAlerts.length > 0;
  };

  const getAlertsForProduct = (productId) => {
    return priceAlerts.filter(alert => alert.productId === productId);
  };

  const getAllActiveAlerts = () => {
    return priceAlerts.filter(alert => alert.isActive);
  };

  return (
    <PriceAlertContext.Provider value={{
      priceAlerts,
      addPriceAlert,
      removePriceAlert,
      checkPriceAlerts,
      getAlertsForProduct,
      getAllActiveAlerts
    }}>
      {children}
    </PriceAlertContext.Provider>
  );
}

export const usePriceAlert = () => {
  const context = useContext(PriceAlertContext);
  if (!context) {
    throw new Error("usePriceAlert must be used within a PriceAlertProvider");
  }
  return context;
};
