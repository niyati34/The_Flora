import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const {
    balance,
    transactions,
    budgetLimits,
    recurringPayments,
    savingsGoals,
    addFunds,
    charge,
    transfer,
    setBudgetLimit,
    addRecurringPayment,
    removeRecurringPayment,
    addSavingsGoal,
    updateSavingsGoal,
    contributeToGoal,
    getSpendingAnalytics,
    getBudgetStatus
  } = useWallet();

  const navigate = useNavigate();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  
  const [fundsAmount, setFundsAmount] = useState("");
  const [fundsNote, setFundsNote] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [recurringNote, setRecurringNote] = useState("");
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [recurringNextDue, setRecurringNextDue] = useState("");
  const [savingsName, setSavingsName] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [savingsDeadline, setSavingsDeadline] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);

  const analytics = getSpendingAnalytics;
  const budgetStatus = getBudgetStatus;

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (addFunds(Number(fundsAmount), fundsNote)) {
      setFundsAmount("");
      setFundsNote("");
      setShowAddFunds(false);
    }
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (transfer(Number(transferAmount), transferTo, transferNote)) {
      setTransferAmount("");
      setTransferTo("");
      setTransferNote("");
      setShowTransfer(false);
    }
  };

  const handleAddRecurring = (e) => {
    e.preventDefault();
    addRecurringPayment({
      amount: Number(recurringAmount),
      note: recurringNote,
      frequency: recurringFrequency,
      nextDue: recurringNextDue
    });
    setRecurringAmount("");
    setRecurringNote("");
    setRecurringFrequency("monthly");
    setRecurringNextDue("");
    setShowRecurring(false);
  };

  const handleAddSavings = (e) => {
    e.preventDefault();
    addSavingsGoal({
      name: savingsName,
      targetAmount: Number(savingsTarget),
      deadline: savingsDeadline
    });
    setSavingsName("");
    setSavingsTarget("");
    setSavingsDeadline("");
    setShowSavings(false);
  };

  const handleContribute = (e) => {
    e.preventDefault();
    if (contributeToGoal(selectedGoal.id, Number(contributionAmount))) {
      setContributionAmount("");
      setSelectedGoal(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit': return '💰';
      case 'debit': return '💸';
      case 'transfer': return '🔄';
      default: return '📊';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      shopping: '#ff6b6b',
      food: '#4ecdc4',
      transport: '#45b7d1',
      entertainment: '#96ceb4',
      health: '#feca57',
      income: '#48dbfb',
      refund: '#ff9ff3',
      transfer: '#54a0ff',
      savings: '#5f27cd'
    };
    return colors[category] || '#95a5a6';
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Balance Card */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="card-title text-primary">Wallet Balance</h3>
              <h2 className="display-4 text-success mb-3">{formatCurrency(balance)}</h2>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowAddFunds(true)}
                >
                  Add Funds
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowTransfer(true)}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Status */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary">Budget Status</h5>
              <div className="mb-3">
                <small className="text-muted">Daily Spending</small>
                <div className="progress mb-2" style={{height: '8px'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: `${Math.min((budgetStatus.daily.spent / budgetStatus.daily.limit) * 100, 100)}%`,
                      backgroundColor: budgetStatus.daily.spent > budgetStatus.daily.limit ? '#dc3545' : '#28a745'
                    }}
                  ></div>
                </div>
                <small>
                  {formatCurrency(budgetStatus.daily.spent)} / {formatCurrency(budgetStatus.daily.limit)}
                </small>
              </div>
              <div className="mb-3">
                <small className="text-muted">Weekly Spending</small>
                <div className="progress mb-2" style={{height: '8px'}}>
                  <div 
                    className="progress-bar" 
                    style={{
                      width: `${Math.min((budgetStatus.weekly.spent / budgetStatus.weekly.limit) * 100, 100)}%`,
                      backgroundColor: budgetStatus.weekly.spent > budgetStatus.weekly.limit ? '#dc3545' : '#28a745'
                    }}
                  ></div>
                </div>
                <small>
                  {formatCurrency(budgetStatus.weekly.spent)} / {formatCurrency(budgetStatus.weekly.limit)}
                </small>
              </div>
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={() => setShowBudget(true)}
              >
                Manage Budget
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary">This Month</h5>
              <div className="row text-center">
                <div className="col-6">
                  <h6 className="text-success">Earned</h6>
                  <p className="h5 text-success">{formatCurrency(analytics.totalEarned)}</p>
                </div>
                <div className="col-6">
                  <h6 className="text-danger">Spent</h6>
                  <p className="h5 text-danger">{formatCurrency(analytics.totalSpent)}</p>
                </div>
              </div>
              <hr />
              <div className="text-center">
                <small className="text-muted">Transactions: {analytics.transactionCount}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Transactions */}
        <div className="col-md-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Recent Transactions</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {transactions.slice(0, 10).map(transaction => (
                  <div key={transaction.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="me-3 fs-4">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <h6 className="mb-0">{transaction.note}</h6>
                        <small className="text-muted">
                          {formatDate(transaction.ts)} • {transaction.category}
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${transaction.type === 'credit' ? 'bg-success' : 'bg-danger'} fs-6`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => setShowRecurring(true)}
                >
                  Add Recurring Payment
                </button>
                <button 
                  className="btn btn-outline-success" 
                  onClick={() => setShowSavings(true)}
                >
                  Create Savings Goal
                </button>
                <button 
                  className="btn btn-outline-info" 
                  onClick={() => navigate('/cart')}
                >
                  Go to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Funds</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddFunds(false)}></button>
              </div>
              <form onSubmit={handleAddFunds}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={fundsAmount}
                      onChange={(e) => setFundsAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={fundsNote}
                      onChange={(e) => setFundsNote(e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddFunds(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Funds</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transfer Funds</h5>
                <button type="button" className="btn-close" onClick={() => setShowTransfer(false)}></button>
              </div>
              <form onSubmit={handleTransfer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">To Wallet</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      placeholder="Recipient wallet ID"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={transferNote}
                      onChange={(e) => setTransferNote(e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTransfer(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Transfer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Payment Modal */}
      {showRecurring && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Recurring Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowRecurring(false)}></button>
              </div>
              <form onSubmit={handleAddRecurring}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={recurringAmount}
                      onChange={(e) => setRecurringAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={recurringNote}
                      onChange={(e) => setRecurringNote(e.target.value)}
                      placeholder="Payment description"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Frequency</label>
                    <select 
                      className="form-select" 
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Next Due Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={recurringNextDue}
                      onChange={(e) => setRecurringNextDue(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRecurring(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Savings Goal Modal */}
      {showSavings && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Savings Goal</h5>
                <button type="button" className="btn-close" onClick={() => setShowSavings(false)}></button>
              </div>
              <form onSubmit={handleAddSavings}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Goal Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={savingsName}
                      onChange={(e) => setSavingsName(e.target.value)}
                      placeholder="e.g., New Plant Collection"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={savingsTarget}
                      onChange={(e) => setSavingsTarget(e.target.value)}
                      placeholder="Enter target amount"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Deadline</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={savingsDeadline}
                      onChange={(e) => setSavingsDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSavings(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Goal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Budget Management Modal */}
      {showBudget && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Budget Limits</h5>
                <button type="button" className="btn-close" onClick={() => setShowBudget(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Daily Limit</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={budgetLimits.daily}
                    onChange={(e) => setBudgetLimit('daily', e.target.value)}
                    placeholder="Daily spending limit"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Weekly Limit</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={budgetLimits.weekly}
                    onChange={(e) => setBudgetLimit('weekly', e.target.value)}
                    placeholder="Weekly spending limit"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Monthly Limit</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={budgetLimits.monthly}
                    onChange={(e) => setBudgetLimit('monthly', e.target.value)}
                    placeholder="Monthly spending limit"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBudget(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {selectedGoal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contribute to {selectedGoal.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedGoal(null)}></button>
              </div>
              <form onSubmit={handleContribute}>
                <div className="modal-body">
                  <div className="mb-3">
                    <p>Current: {formatCurrency(selectedGoal.currentAmount)} / {formatCurrency(selectedGoal.targetAmount)}</p>
                    <div className="progress mb-3">
                      <div 
                        className="progress-bar" 
                        style={{width: `${(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contribution Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedGoal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Contribute</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal {
          z-index: 1050;
        }
        .card {
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .progress-bar {
          transition: width 0.3s ease;
        }
        .list-group-item {
          transition: background-color 0.2s;
        }
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
