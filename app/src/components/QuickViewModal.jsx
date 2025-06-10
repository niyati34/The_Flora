import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!isOpen || !product) return null;

  const colors = ["black", "red", "white", "#757471", "#EEFC09"];
  const colorNames = ["Black", "Red", "White", "Grey", "Yellow"];

  const handleAddToCart = () => {
    addToCart(product, quantity, product.image, colorNames[selectedColorIndex]);
    onClose();
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Quick View</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="img-fluid"
                />
              </div>
              <div className="col-md-6">
                <h4>{product.name}</h4>
                <p className="text-muted">{product.category}</p>
                <p className="fs-5 fw-bold text-success">₹{product.price}</p>
                
                <div className="mb-3">
                  <label className="form-label">Color:</label>
                  <div className="d-flex gap-2">
                    {colors.map((color, i) => (
                      <div
                        key={i}
                        className={`color-option ${selectedColorIndex === i ? 'selected' : ''}`}
                        style={{ 
                          backgroundColor: color,
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: selectedColorIndex === i ? '3px solid #007bff' : '2px solid #ddd'
                        }}
                        onClick={() => setSelectedColorIndex(i)}
                        title={colorNames[i]}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Quantity:</label>
                  <select 
                    className="form-select" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={{ width: 'auto' }}
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                  <button 
                    className={`btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={toggleWishlist}
                  >
                    <i className={`fas fa-heart ${isInWishlist(product.id) ? '' : 'far'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
