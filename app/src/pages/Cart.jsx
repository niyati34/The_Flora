import { useCart } from "../context/CartContext";
import { useWallet } from "../context/WalletContext";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } =
    useCart();
  const items = cart.items;
  const total = getCartTotal();
  const { balance, charge } = useWallet();
  const canPayWithWallet = balance >= total && total > 0;
  const onWalletCheckout = () => {
    if (!canPayWithWallet) return;
    const ok = charge(total, { note: "Order payment" });
    if (ok) {
      clearCart();
      alert("Payment successful with Wallet! Order placed.");
    }
  };

  return (
    <div className="container" style={{ marginTop: 210 }}>
      <div className="cart-container">
        <h1 className="mb-4">Your Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="alert alert-info">Your cart is empty.</div>
        ) : (
          <>
            {items.map((item) => (
              <div
                key={`${item.id}-${item.color}`}
                className="cart-item d-flex align-items-center mb-3 p-2 border rounded"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ maxWidth: 80, marginRight: 16 }}
                />
                <div className="item-details flex-grow-1">
                  <h5 className="mb-1">{item.name}</h5>
                  <div className="text-muted small">Color: {item.color}</div>
                  <div className="text-success fw-bold">
                    ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.id,
                        item.color,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="form-control"
                    style={{ width: 90 }}
                  />
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => removeFromCart(item.id, item.color)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-total text-end mt-3">
              <h3>Total: ₹{total.toFixed(2)}</h3>
            </div>

            <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
              <button className="btn btn-outline-secondary" onClick={clearCart}>
                Clear Cart
              </button>
              <div className="ms-auto d-flex gap-2">
                <button className="btn btn-outline-primary" disabled={!canPayWithWallet} onClick={onWalletCheckout}>
                  Pay with Wallet (₹{balance.toFixed(0)})
                </button>
                <a className="btn btn-success" href="/wallet">Add Funds</a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
