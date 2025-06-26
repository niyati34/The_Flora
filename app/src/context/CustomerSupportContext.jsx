import { createContext, useContext, useState, useCallback } from "react";

const CustomerSupportContext = createContext();

export function CustomerSupportProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openSupport = useCallback(() => setOpen(true), []);
  const closeSupport = useCallback(() => setOpen(false), []);

  return (
    <CustomerSupportContext.Provider
      value={{ open, openSupport, closeSupport }}
    >
      {children}
    </CustomerSupportContext.Provider>
  );
}

export function useCustomerSupport() {
  return useContext(CustomerSupportContext);
}
