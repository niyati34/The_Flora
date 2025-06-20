import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useNotes } from "../context/NotesContext";
import { useStock } from "../context/StockContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { usePriceAlert } from "../context/PriceAlertContext";
import { useCareReminder } from "../context/CareReminderContext";
import ProductRecommendations from "../components/ProductRecommendations";
import { useAutoSave } from "../hooks/useAutoSave";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addNote, getNotesForProduct, removeNote } = useNotes();
  const { getAvailableStock, isInStock, getStockStatus, reserveStock } =
    useStock();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addPriceAlert, getAlertsForProduct } = usePriceAlert();
  const { addReminder, getRemindersForProduct } = useCareReminder();

  if (!product)
    return (
      <div className="container mt-5">
        <h2>Product not found</h2>
      </div>
    );

  // Add to recently viewed when component mounts
  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product.id, addToRecentlyViewed]);

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showCareReminder, setShowCareReminder] = useState(false);
  const [careType, setCareType] = useState("water");
  const [careFrequency, setCareFrequency] = useState(7);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Auto-save functionality for review and notes
  const {
    value: review,
    setValue: setReview,
    isSaving: isReviewSaving,
    clearSaved: clearReviewDraft,
    hasSavedData: hasReviewDraft,
  } = useAutoSave(`review_${product.id}`, "");

  const {
    value: noteText,
    setValue: setNoteText,
    isSaving: isNoteSaving,
    clearSaved: clearNoteDraft,
  } = useAutoSave(`note_${product.id}`, "");

  const colors = ["black", "red", "white", "#757471", "#EEFC09"];
  const colorNames = ["Black", "Red", "White", "Grey", "Yellow"];

  const handleColorChange = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setSelectedColorIndex(index);
  };

  const handleAddToCart = () => {
    if (isInStock(product.id, quantity)) {
      addToCart(
        product,
        quantity,
        selectedImage,
        colorNames[selectedColorIndex]
      );
      reserveStock(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      alert("Sorry, not enough stock available!");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    alert("Redirecting to checkout...");
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const toggleCompare = () => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote(noteText, product.id);
      setNoteText("");
      clearNoteDraft();
    }
  };

  const handlePriceAlert = () => {
    const price = parseFloat(targetPrice);
    if (price && price < product.price) {
      addPriceAlert(product.id, price);
      setTargetPrice("");
      setShowPriceAlert(false);
      alert(
        `Price alert set for ₹${price}! You'll be notified when the price drops.`
      );
    } else {
      alert("Please enter a valid price lower than the current price.");
    }
  };

  const handleCareReminder = () => {
    if (careType && careFrequency > 0) {
      const plantName = getPlantName(product.name);
      addReminder(
        product.id,
        plantName,
        careType,
        careFrequency,
        new Date().toISOString()
      );
      setShowCareReminder(false);
      alert(
        `Care reminder set! You'll be reminded to ${careType} your ${plantName} every ${careFrequency} days.`
      );
    }
  };

  const handleImageMouseMove = (e) => {
    if (!isImageZoomed) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleImageZoom = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  const productNotes = getNotesForProduct(product.id);
  const priceAlerts = getAlertsForProduct(product.id);
  const careReminders = getRemindersForProduct(product.id);

  // Extract plant name from product name (e.g., "Peace Lily Plant With..." -> "Peace Lily")
  const getPlantName = (productName) => {
    const words = productName.split(" ");
    // Find index of "Plant" and take words before it
    const plantIndex = words.findIndex(
      (word) => word.toLowerCase() === "plant"
    );
    if (plantIndex > 0) {
      return words.slice(0, plantIndex).join(" ");
    }
    // Fallback: take first two words
    return words.slice(0, 2).join(" ");
  };

  return (
    <main style={{ marginTop: 180 }}>
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>
      <section className="product-details">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="image-container position-relative">
                <img
                  id="product-image"
                  src={selectedImage}
                  alt={product.name}
                  className={`product-image ${isImageZoomed ? "zoomed" : ""}`}
                  onClick={toggleImageZoom}
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={() => setIsImageZoomed(false)}
                  style={{
                    transform: isImageZoomed ? `scale(2)` : "scale(1)",
                    transformOrigin: isImageZoomed
                      ? `${zoomPosition.x}% ${zoomPosition.y}%`
                      : "center",
                    transition: isImageZoomed ? "none" : "transform 0.3s ease",
                    cursor: isImageZoomed ? "zoom-out" : "zoom-in",
                  }}
                />
                <div className="zoom-hint position-absolute top-0 end-0 m-2">
                  <small className="badge bg-dark">
                    <i className="fas fa-search-plus"></i> Click to zoom
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <h2>{product.name}</h2>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <p>Price: ₹{product.price.toFixed(2)}</p>

              {/* Price Alert */}
              <div className="price-alert mb-3">
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => setShowPriceAlert(!showPriceAlert)}
                >
                  <i className="fas fa-bell"></i> Set Price Alert
                </button>
                {priceAlerts.filter((alert) => alert.isActive).length > 0 && (
                  <small className="text-success ms-2">
                    ✓ Price alert active
                  </small>
                )}
              </div>

              {showPriceAlert && (
                <div className="price-alert-form card p-3 mb-3">
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Target price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      max={product.price - 1}
                      step="0.01"
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handlePriceAlert}
                      disabled={
                        !targetPrice || parseFloat(targetPrice) >= product.price
                      }
                    >
                      Set Alert
                    </button>
                  </div>
                  <small className="text-muted mt-1">
                    Enter a price below ₹{product.price} to get notified when it
                    drops
                  </small>
                </div>
              )}

              {/* Care Reminders */}
              <div className="care-reminder mb-3">
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => setShowCareReminder(!showCareReminder)}
                >
                  <i className="fas fa-calendar-alt"></i> Set Care Reminder
                </button>
                {careReminders.filter((reminder) => reminder.isActive).length >
                  0 && (
                  <small className="text-success ms-2">
                    ✓{" "}
                    {
                      careReminders.filter((reminder) => reminder.isActive)
                        .length
                    }{" "}
                    reminder(s) active
                  </small>
                )}
              </div>

              {showCareReminder && (
                <div className="care-reminder-form card p-3 mb-3">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Care Type:</label>
                      <select
                        className="form-select"
                        value={careType}
                        onChange={(e) => setCareType(e.target.value)}
                      >
                        <option value="water">Watering</option>
                        <option value="fertilize">Fertilizing</option>
                        <option value="prune">Pruning</option>
                        <option value="repot">Repotting</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Frequency (days):</label>
                      <input
                        type="number"
                        className="form-control"
                        value={careFrequency}
                        onChange={(e) =>
                          setCareFrequency(parseInt(e.target.value))
                        }
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={handleCareReminder}
                  >
                    Set Reminder
                  </button>
                </div>
              )}

              {/* Stock Status */}
              <div className="stock-info mb-3">
                <span
                  className={`badge ${
                    getStockStatus(product.id) === "In Stock"
                      ? "bg-success"
                      : getStockStatus(product.id) === "Low Stock"
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                >
                  {getStockStatus(product.id)}
                </span>
                {getAvailableStock(product.id) > 0 && (
                  <small className="text-muted ms-2">
                    {getAvailableStock(product.id)} available
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                  max={getAvailableStock(product.id)}
                  className="form-control"
                  style={{
                    width: "100px",
                    display: "inline-block",
                    marginLeft: "10px",
                  }}
                />
              </div>
              <div className="color-options">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`color-circle ${
                      selectedColorIndex === i ? "selected" : ""
                    }`}
                    style={{ backgroundColor: colors[i] }}
                    onClick={() => handleColorChange(img, i)}
                    title={`${colorNames[i]} variant`}
                  ></div>
                ))}
              </div>
              <div className="buttons">
                <button
                  className="btn add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!isInStock(product.id, quantity)}
                >
                  {getStockStatus(product.id) === "Out of Stock"
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
                <button
                  className="btn buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={!isInStock(product.id, quantity)}
                >
                  Buy It Now
                </button>
                <button
                  className={`btn ${
                    isInWishlist(product.id)
                      ? "btn-danger"
                      : "btn-outline-danger"
                  }`}
                  onClick={toggleWishlist}
                  title={
                    isInWishlist(product.id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                >
                  <i
                    className={`fas fa-heart ${
                      isInWishlist(product.id) ? "" : "far"
                    }`}
                  ></i>
                  {isInWishlist(product.id) ? " Remove" : " Wishlist"}
                </button>
                <button
                  className={`btn ${
                    isInCompare(product.id)
                      ? "btn-warning"
                      : "btn-outline-warning"
                  }`}
                  onClick={toggleCompare}
                  title={
                    isInCompare(product.id)
                      ? "Remove from Compare"
                      : "Add to Compare"
                  }
                >
                  <i className="fas fa-balance-scale"></i>
                  {isInCompare(product.id) ? " Remove" : " Compare"}
                </button>
              </div>
              {addedToCart && (
                <div className="alert alert-success mt-2">
                  Added {quantity} {colorNames[selectedColorIndex]}{" "}
                  {product.name} to cart!
                </div>
              )}
              <ul className="list-styled">
                <li>Free Shipping</li>
                <li>Cash on delivery available</li>
                <li>10 Days Refund Policy Terms & Conditions Apply</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <div className="product-about-section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3>About The {getPlantName(product.name)} Plant</h3>
              <div className="about-text">
                <p>{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="product-info">
        <div className="container">
          <div className="row product-info-row">
            <div className="col-md-6">
              <p>{product.info}</p>
            </div>
            <div className="col-md-6">
              <img
                src={selectedImage}
                alt="Product Info"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        {product.faqs.map((faq, i) => (
          <div className="faq-item" key={i}>
            <div className="card">
              <div className="card-header" id={`faqHeading${i}`}>
                <h3 className="mb-0">
                  <button
                    className="btn btn-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#faqCollapse${i}`}
                    aria-expanded={i === 0}
                    aria-controls={`faqCollapse${i}`}
                  >
                    {i + 1}. {faq.q}
                  </button>
                </h3>
              </div>
              <div
                id={`faqCollapse${i}`}
                className={`collapse${i === 0 ? " show" : ""}`}
                aria-labelledby={`faqHeading${i}`}
                data-bs-parent=".faq"
              >
                <div className="card-body">{faq.a}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <section className="product-rating">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3>Product Rating</h3>
              <div className="form-group">
                <div className="rating">
                  <input
                    type="radio"
                    id="star5"
                    name="rating"
                    value="5"
                    checked={rating === 5}
                    onChange={() => setRating(5)}
                  />
                  <label htmlFor="star5"></label>
                  <input
                    type="radio"
                    id="star4"
                    name="rating"
                    value="4"
                    checked={rating === 4}
                    onChange={() => setRating(4)}
                  />
                  <label htmlFor="star4"></label>
                  <input
                    type="radio"
                    id="star3"
                    name="rating"
                    value="3"
                    checked={rating === 3}
                    onChange={() => setRating(3)}
                  />
                  <label htmlFor="star3"></label>
                  <input
                    type="radio"
                    id="star2"
                    name="rating"
                    value="2"
                    checked={rating === 2}
                    onChange={() => setRating(2)}
                  />
                  <label htmlFor="star2"></label>
                  <input
                    type="radio"
                    id="star1"
                    name="rating"
                    value="1"
                    checked={rating === 1}
                    onChange={() => setRating(1)}
                  />
                  <label htmlFor="star1"></label>
                </div>
              </div>
              {reviewSubmitted ? (
                <div className="alert alert-success mt-3">
                  Thank you for your review!
                </div>
              ) : (
                <form
                  id="review-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReviewSubmitted(true);
                    clearReviewDraft();
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="review">
                      Write a Review:
                      {hasReviewDraft && (
                        <small className="text-info ms-2">
                          <i className="fas fa-save"></i> Draft saved
                        </small>
                      )}
                      {isReviewSaving && (
                        <small className="text-muted ms-2">
                          <i className="fas fa-spinner fa-spin"></i> Saving...
                        </small>
                      )}
                    </label>
                    <textarea
                      className="form-control"
                      id="review"
                      rows={4}
                      required
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </form>
              )}
            </div>

            {/* Notes Section */}
            <div className="product-notes mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>My Notes</h5>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? "Hide Notes" : "Show Notes"} (
                  {productNotes.length})
                </button>
              </div>

              {showNotes && (
                <div>
                  <div className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add a note about this plant..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                      >
                        Add Note
                      </button>
                    </div>
                    {isNoteSaving && (
                      <small className="text-muted">
                        <i className="fas fa-spinner fa-spin"></i> Auto-saving
                        draft...
                      </small>
                    )}
                  </div>

                  {productNotes.length > 0 && (
                    <div className="notes-list">
                      {productNotes.map((note) => (
                        <div key={note.id} className="note-item card mb-2">
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between">
                              <small className="text-muted">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </small>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeNote(note.id)}
                              >
                                ×
                              </button>
                            </div>
                            <p className="mb-0">{note.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Recommendations */}
        <ProductRecommendations currentProduct={product} />
      </section>
    </main>
  );
}
