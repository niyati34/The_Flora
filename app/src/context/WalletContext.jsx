import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import analytics from "../utils/analytics";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [budgetLimits, setBudgetLimits] = useState({
    daily: 1000,
    weekly: 5000,
    monthly: 20000
  });
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("flora_wallet") || "null");
      if (saved && typeof saved.balance === "number") {
        setBalance(saved.balance);
        setTransactions(
          Array.isArray(saved.transactions) ? saved.transactions : []
        );
        if (saved.budgetLimits) setBudgetLimits(saved.budgetLimits);
        if (saved.recurringPayments) setRecurringPayments(saved.recurringPayments);
        if (saved.savingsGoals) setSavingsGoals(saved.savingsGoals);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = { 
      balance, 
      transactions, 
      budgetLimits, 
      recurringPayments, 
      savingsGoals 
    };
    localStorage.setItem("flora_wallet", JSON.stringify(data));
  }, [balance, transactions, budgetLimits, recurringPayments, savingsGoals]);

  const addFunds = useCallback((amount, note = "Top-up", category = "income") => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return false;
    
    setBalance((b) => b + amt);
    const tx = {
      id: Date.now(),
      type: "credit",
      amount: amt,
      note,
      category,
      ts: new Date().toISOString(),
      status: "completed"
    };
    setTransactions((t) => [tx, ...t].slice(0, 200));
    analytics.track("wallet_credit", { amount: amt, note, category });
    return true;
  }, []);

  const charge = useCallback((amount, meta = {}) => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return false;
    if (balance < amt) return false;
    
    setBalance((b) => b - amt);
    const tx = {
      id: Date.now(),
      type: "debit",
      amount: amt,
      note: meta.note || "Checkout",
      category: meta.category || "shopping",
      ts: new Date().toISOString(),
      status: "completed",
      orderId: meta.orderId,
      merchant: meta.merchant
    };
    setTransactions((t) => [tx, ...t].slice(0, 200));
    analytics.track("wallet_debit", { amount: amt, ...meta });
    return true;
  }, [balance]);

  const refund = useCallback((amount, note = "Refund", category = "refund") => {
    return addFunds(amount, note, category);
  }, [addFunds]);

  const transfer = useCallback((amount, toWallet, note = "Transfer") => {
    const amt = Number(amount) || 0;
    if (amt <= 0 || balance < amt) return false;
    
    setBalance((b) => b - amt);
    const tx = {
      id: Date.now(),
      type: "transfer",
      amount: amt,
      note: `${note} to ${toWallet}`,
      category: "transfer",
      ts: new Date().toISOString(),
      status: "completed",
      recipient: toWallet
    };
    setTransactions((t) => [tx, ...t].slice(0, 200));
    analytics.track("wallet_transfer", { amount: amt, recipient: toWallet, note });
    return true;
  }, [balance]);

  const setBudgetLimit = useCallback((period, amount) => {
    setBudgetLimits(prev => ({
      ...prev,
      [period]: Number(amount) || 0
    }));
    analytics.track("wallet_budget_set", { period, amount });
  }, []);

  const addRecurringPayment = useCallback((payment) => {
    const newPayment = {
      id: Date.now(),
      ...payment,
      isActive: true,
      nextDue: new Date(payment.nextDue).toISOString(),
      createdAt: new Date().toISOString()
    };
    setRecurringPayments(prev => [...prev, newPayment]);
    analytics.track("wallet_recurring_added", payment);
  }, []);

  const removeRecurringPayment = useCallback((id) => {
    setRecurringPayments(prev => prev.filter(p => p.id !== id));
    analytics.track("wallet_recurring_removed", { id });
  }, []);

  const addSavingsGoal = useCallback((goal) => {
    const newGoal = {
      id: Date.now(),
      ...goal,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setSavingsGoals(prev => [...prev, newGoal]);
    analytics.track("wallet_savings_goal_added", goal);
  }, []);

  const updateSavingsGoal = useCallback((id, updates) => {
    setSavingsGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      )
    );
  }, []);

  const contributeToGoal = useCallback((goalId, amount) => {
    const amt = Number(amount) || 0;
    if (amt <= 0 || balance < amt) return false;
    
    setBalance(b => b - amt);
    setSavingsGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, currentAmount: goal.currentAmount + amt }
          : goal
      )
    );
    
    const tx = {
      id: Date.now(),
      type: "debit",
      amount: amt,
      note: "Savings contribution",
      category: "savings",
      ts: new Date().toISOString(),
      status: "completed",
      goalId
    };
    setTransactions(t => [tx, ...t].slice(0, 200));
    analytics.track("wallet_savings_contribution", { goalId, amount });
    return true;
  }, [balance]);

  // Analytics and insights
  const getSpendingAnalytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.ts);
      return txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear;
    });
    
    const spendingByCategory = monthlyTransactions
      .filter(tx => tx.type === "debit")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});
    
    const totalSpent = monthlyTransactions
      .filter(tx => tx.type === "debit")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalEarned = monthlyTransactions
      .filter(tx => tx.type === "credit")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      totalSpent,
      totalEarned,
      spendingByCategory,
      transactionCount: monthlyTransactions.length,
      averageTransaction: monthlyTransactions.length > 0 ? totalSpent / monthlyTransactions.length : 0
    };
  }, [transactions]);

  const getBudgetStatus = useMemo(() => {
    const analytics = getSpendingAnalytics;
    const dailySpent = transactions
      .filter(tx => {
        const txDate = new Date(tx.ts);
        const today = new Date();
        return txDate.toDateString() === today.toDateString() && tx.type === "debit";
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const weeklySpent = transactions
      .filter(tx => {
        const txDate = new Date(tx.ts);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return txDate >= weekAgo && tx.type === "debit";
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      daily: { spent: dailySpent, limit: budgetLimits.daily, remaining: budgetLimits.daily - dailySpent },
      weekly: { spent: weeklySpent, limit: budgetLimits.weekly, remaining: budgetLimits.weekly - weeklySpent }
    };
  }, [transactions, budgetLimits, getSpendingAnalytics]);

  const value = useMemo(
    () => ({ 
      balance, 
      transactions, 
      budgetLimits,
      recurringPayments,
      savingsGoals,
      isLoading,
      addFunds, 
      charge, 
      refund,
      transfer,
      setBudgetLimit,
      addRecurringPayment,
      removeRecurringPayment,
      addSavingsGoal,
      updateSavingsGoal,
      contributeToGoal,
      getSpendingAnalytics,
      getBudgetStatus
    }),
    [balance, transactions, budgetLimits, recurringPayments, savingsGoals, isLoading, addFunds, charge, refund, transfer, setBudgetLimit, addRecurringPayment, removeRecurringPayment, addSavingsGoal, updateSavingsGoal, contributeToGoal, getSpendingAnalytics, getBudgetStatus]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
};
