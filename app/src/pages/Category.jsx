import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductFilters from "../components/ProductFilters";
import LazyImage from "../components/LazyImage";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import analytics from "../utils/analytics";
import { Link } from "react-router-dom";

const PRODUCTS = [
  {
    id: 1,
    name: "Snake Plant",
    category: "Indoor Plants",
    price: 399,
    image: "/c2.webp",
    description: "Low maintenance air purifying plant",
  },
  {
    id: 2,
    name: "Peace Lily",
    category: "Indoor Plants",
    price: 499,
    image: "/c3.webp",
    description: "Beautiful flowering indoor plant",
  },
  {
    id: 3,
    name: "Fiddle Leaf Fig",
    category: "Indoor Plants",
    price: 899,
    image: "/c5.webp",
    description: "Popular statement houseplant",
  },
  {
    id: 4,
    name: "Ceramic Planter",
    category: "Planters",
    price: 299,
    image: "/c6.webp",
    description: "Modern white ceramic planter",
  },
  {
    id: 5,
    name: "Bamboo Palm",
    category: "Air Purifying Plants",
    price: 599,
    image: "/c8.webp",
    description: "Natural air purifier palm",
  },
  {
    id: 6,
    name: "Rubber Plant",
    category: "Low Maintenance Plants",
    price: 449,
    image: "/c9.webp",
    description: "Easy care glossy leaf plant",
  },
];

export default function Category() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "All";
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();

  useEffect(() => {
    if (category && category !== "All") {
      setFilteredProducts(PRODUCTS.filter((p) => p.category === category));
    } else {
      setFilteredProducts(PRODUCTS);
    }
  }, [category]);

  const handleAddToCart = (product) => {
    addToCart(product);
    analytics.track("product_added_to_cart", {
      productId: product.id,
      productName: product.name,
      price: product.price,
      source: "category_page",
    });
  };

  const handleWishlistToggle = (product) => {
    addToWishlist(product);
    analytics.track("product_added_to_wishlist", {
      productId: product.id,
      productName: product.name,
      source: "category_page",
    });
  };

  const handleCompareToggle = (product) => {
    addToCompare(product);
    analytics.track("product_added_to_compare", {
      productId: product.id,
      productName: product.name,
      source: "category_page",
    });
  };

  return (
    <main className="container-fluid" style={{ marginTop: 210 }}>
      <div className="row">
        <div className="col-md-3">
          <ProductFilters
            products={PRODUCTS}
            onFilteredProducts={setFilteredProducts}
          />
        </div>

        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{category === "All" ? "All Products" : category}</h2>
            <span className="badge bg-secondary">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="row">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3 mb-4">
                <div className="card h-100">
                  <div className="position-relative">
                    <LazyImage
                      src={product.image}
                      alt={product.name}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <button
                      className={`btn btn-sm position-absolute top-0 end-0 m-2 ${
                        isInWishlist(product.id)
                          ? "btn-danger"
                          : "btn-outline-light"
                      }`}
                      onClick={() => handleWishlistToggle(product)}
                      title="Add to Wishlist"
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title">{product.name}</h6>
                    <p className="card-text small text-muted flex-grow-1">
                      {product.description}
                    </p>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="h6 text-success mb-0">
                          ₹{product.price}
                        </span>
                        <small className="text-muted">{product.category}</small>
                      </div>

                      <div className="btn-group w-100" role="group">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="fas fa-cart-plus"></i>
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="btn btn-outline-primary btn-sm flex-grow-1"
                        >
                          View Details
                        </Link>
                        <button
                          className={`btn btn-sm ${
                            isInCompare(product.id)
                              ? "btn-warning"
                              : "btn-outline-warning"
                          }`}
                          onClick={() => handleCompareToggle(product)}
                          title="Compare"
                        >
                          <i className="fas fa-balance-scale"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <h4>No products found</h4>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
