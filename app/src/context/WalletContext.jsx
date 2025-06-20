import { createContext, useContext, useEffect, useMemo, useState } from "react";
import analytics from "../utils/analytics";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("flora_wallet") || "null");
      if (saved && typeof saved.balance === "number") {
        setBalance(saved.balance);
        setTransactions(Array.isArray(saved.transactions) ? saved.transactions : []);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = { balance, transactions };
    localStorage.setItem("flora_wallet", JSON.stringify(data));
  }, [balance, transactions]);

  const addFunds = (amount, note = "Top-up") => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return false;
    setBalance((b) => b + amt);
    const tx = { id: Date.now(), type: "credit", amount: amt, note, ts: new Date().toISOString() };
    setTransactions((t) => [tx, ...t].slice(0, 100));
    analytics.track("wallet_credit", { amount: amt, note });
    return true;
  };

  const charge = (amount, meta = {}) => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return false;
    if (balance < amt) return false;
    setBalance((b) => b - amt);
    const tx = { id: Date.now(), type: "debit", amount: amt, note: meta.note || "Checkout", ts: new Date().toISOString() };
    setTransactions((t) => [tx, ...t].slice(0, 100));
    analytics.track("wallet_debit", { amount: amt, ...meta });
    return true;
  };

  const refund = (amount, note = "Refund") => addFunds(amount, note);

  const value = useMemo(
    () => ({ balance, transactions, addFunds, charge, refund }),
    [balance, transactions]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
};
