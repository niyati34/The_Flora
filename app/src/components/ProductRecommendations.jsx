import { Link } from "react-router-dom";
import { products } from "../data/products";

export default function ProductRecommendations({ currentProduct, onQuickView }) {
  // Get products from same category, excluding current product
  const recommendations = products
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 3);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-section mt-5">
      <h4>You might also like</h4>
      <div className="row">
        {recommendations.map(product => (
          <div key={product.id} className="col-md-4 mb-3">
            <div className="card h-100">
              <img 
                src={product.image} 
                className="card-img-top" 
                alt={product.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{product.name}</h6>
                <p className="card-text text-muted small">{product.category}</p>
                <p className="card-text fw-bold text-success">₹{product.price}</p>
                <div className="mt-auto">
                  <div className="d-flex gap-2">
                    <Link 
                      to={`/product/${product.id}`} 
                      className="btn btn-sm btn-primary flex-fill"
                    >
                      View Details
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onQuickView && onQuickView(product)}
                      title="Quick View"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
