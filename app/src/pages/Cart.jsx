export default function Cart() {
  return (
    <div className="container" style={{ marginTop: 210 }}>
      <div className="cart-container">
        <h1>Your Shopping Cart</h1>
        <div className="cart-item d-flex align-items-center mb-3">
          <img src="/fi/p3.png" alt="Product" style={{ maxWidth: 100, marginRight: 20 }} />
          <div className="item-details flex-grow-1">
            <h3>Peace Lily Plant With Self Watering Pot</h3>
            <p>Price: ₹325.00</p>
          </div>
          <div className="item-actions">
            <button className="remove-button btn" style={{ backgroundColor: '#2B5943', color: '#fff' }}>Remove</button>
          </div>
        </div>
        <div className="cart-total text-end mt-3">
          <h2>Total: ₹325.00</h2>
        </div>

        <div className="address-form mt-4">
          <h2>Shipping Address</h2>
          <form onSubmit={(e)=> e.preventDefault()}>
            <input type="text" placeholder="Name" className="form-control mb-2" />
            <input type="text" placeholder="Address" className="form-control mb-2" />
            <button className="submit-address-button btn" style={{ backgroundColor: '#2196F3', color: '#fff' }}>Submit Address</button>
          </form>
        </div>

        <div className="payment-options mt-4">
          <h2>Payment Options</h2>
          <div className="payment-method form-check">
            <input className="form-check-input" type="radio" name="payment-method" id="credit-card" />
            <label className="form-check-label" htmlFor="credit-card">Credit Card</label>
          </div>
          <div className="payment-method form-check">
            <input className="form-check-input" type="radio" name="payment-method" id="paypal" />
            <label className="form-check-label" htmlFor="paypal">PayPal</label>
          </div>
          <div className="order-summary mt-2">
            <button className="place-order-button btn" style={{ backgroundColor: '#4CAF50', color: '#fff' }}>Place Order</button>
          </div>
        </div>
      </div>
    </div>
  )
}
