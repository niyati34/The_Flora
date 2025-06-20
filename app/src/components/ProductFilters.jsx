import { useState, useMemo } from "react";

export default function ProductFilters({ products, onFilteredProducts }) {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesPrice && matchesCategory && matchesSearch;
    });

    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [products, priceRange, selectedCategory, searchTerm, sortBy]);

  // Call the callback whenever filtered products change
  useMemo(() => {
    onFilteredProducts(filteredProducts);
  }, [filteredProducts, onFilteredProducts]);

  return (
    <div className="product-filters p-3 border rounded">
      <h5>Filters</h5>

      {/* Search */}
      <div className="mb-3">
        <label className="form-label">Search</label>
        <input
          type="text"
          className="form-control"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="mb-3">
        <label className="form-label">Category</label>
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-3">
        <label className="form-label">
          Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
        </label>
        <div className="d-flex gap-2">
          <input
            type="range"
            className="form-range"
            min="0"
            max="5000"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), priceRange[1]])
            }
          />
          <input
            type="range"
            className="form-range"
            min="0"
            max="5000"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-3">
        <label className="form-label">Sort By</label>
        <select
          className="form-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={() => {
          setPriceRange([0, 5000]);
          setSelectedCategory("");
          setSearchTerm("");
          setSortBy("");
        }}
      >
        Clear All Filters
      </button>

      <div className="mt-2 text-muted small">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
