import { useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function Wallet() {
  const { balance, transactions, addFunds } = useWallet();
  const [amount, setAmount] = useState(500);
  const [note, setNote] = useState("");

  const onTopUp = (e) => {
    e.preventDefault();
    addFunds(amount, note || "Top-up");
    setNote("");
  };

  return (
    <main className="container" style={{ marginTop: 210 }}>
      <div className="card">
        <div className="card-body">
          <h3 className="mb-3">Wallet</h3>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="fs-5">Current Balance</div>
            <div className="fs-4 fw-bold text-success">₹{balance.toFixed(2)}</div>
          </div>

          <form className="row g-2 align-items-end" onSubmit={onTopUp}>
            <div className="col-12 col-md-3">
              <label className="form-label">Amount</label>
              <input type="number" min={1} value={amount} onChange={(e)=> setAmount(Number(e.target.value))} className="form-control" />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Note (optional)</label>
              <input type="text" value={note} onChange={(e)=> setNote(e.target.value)} className="form-control" placeholder="e.g., Add funds" />
            </div>
            <div className="col-12 col-md-3">
              <button className="btn btn-success w-100" type="submit">Add Funds</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h5 className="mb-3">Recent Transactions</h5>
          {transactions.length === 0 ? (
            <div className="text-muted">No transactions yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Type</th>
                    <th>Note</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.ts).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${t.type === 'credit' ? 'bg-success' : 'bg-danger'}`}>{t.type}</span>
                      </td>
                      <td>{t.note}</td>
                      <td className="text-end">{t.type === 'credit' ? '+' : '-'}₹{t.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
