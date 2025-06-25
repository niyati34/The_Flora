import { useCompare } from "../context/CompareContext";
import { Link } from "react-router-dom";
import analytics from "../utils/analytics";

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <main className="container" style={{ marginTop: 210 }}>
        <h2>Product Comparison</h2>
        <div className="alert alert-info">
          No products to compare. Add some products from their detail pages.
        </div>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </main>
    );
  }

  const handleRemove = (productId) => {
    removeFromCompare(productId);
    analytics.track("product_removed_from_compare", { productId });
  };

  const handleClearAll = () => {
    clearCompare();
    analytics.track("compare_cleared", { count: compareList.length });
  };

  return (
    <main className="container" style={{ marginTop: 210 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Compare Products ({compareList.length})</h2>
        <button className="btn btn-outline-danger" onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Product</th>
              {compareList.map(product => (
                <th key={product.id} className="text-center" style={{ minWidth: '200px' }}>
                  <div className="position-relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="img-fluid mb-2"
                      style={{ maxHeight: '120px', objectFit: 'cover' }}
                    />
                    <button 
                      className="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                      onClick={() => handleRemove(product.id)}
                      title="Remove from comparison"
                    >
                      ×
                    </button>
                  </div>
                  <h6 className="mb-0">{product.name}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Price</strong></td>
              {compareList.map(product => (
                <td key={product.id} className="text-center">
                  <span className="fs-5 fw-bold text-success">₹{product.price}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>Features</strong></td>
              {compareList.map(product => (
                <td key={product.id}>
                  <ul className="list-unstyled small">
                    {product.features?.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>Description</strong></td>
              {compareList.map(product => (
                <td key={product.id} className="small">
                  {product.description?.slice(0, 120)}...
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>Actions</strong></td>
              {compareList.map(product => (
                <td key={product.id} className="text-center">
                  <Link 
                    to={`/product/${product.id}`}
                    className="btn btn-sm btn-primary d-block mb-1"
                  >
                    View Details
                  </Link>
                  <button 
                    className="btn btn-sm btn-outline-secondary d-block w-100"
                    onClick={() => handleRemove(product.id)}
                  >
                    Remove
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
