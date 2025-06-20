import { useState, useEffect, useRef } from "react";
import { products } from "../data/products";

export default function AdvancedSearch({ onProductSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectProduct(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectProduct = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    onProductSelect && onProductSelect(product);
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning">{part}</mark>
      ) : part
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="advanced-search position-relative" ref={searchRef}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Search plants by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
        />
        <button className="btn btn-outline-secondary" type="button">
          <i className="fas fa-search"></i>
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="suggestions-dropdown position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{ zIndex: 1050, maxHeight: '300px', overflowY: 'auto' }}
          ref={suggestionsRef}
        >
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              className={`suggestion-item p-2 border-bottom cursor-pointer ${
                index === selectedIndex ? 'bg-light' : ''
              }`}
              onClick={() => handleSelectProduct(product)}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="me-2"
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div className="flex-grow-1">
                  <div className="fw-medium">
                    {highlightMatch(product.name, searchTerm)}
                  </div>
                  <small className="text-muted">
                    {highlightMatch(product.category, searchTerm)} • ₹{product.price}
                  </small>
                </div>
              </div>
            </div>
          ))}
          
          {searchTerm.length >= 2 && suggestions.length === 0 && (
            <div className="p-3 text-center text-muted">
              No plants found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
