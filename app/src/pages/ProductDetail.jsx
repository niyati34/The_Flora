import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useNotes } from "../context/NotesContext";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addNote, getNotesForProduct, removeNote } = useNotes();

  if (!product)
    return (
      <div className="container mt-5">
        <h2>Product not found</h2>
      </div>
    );

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const colors = ["black", "red", "white", "#757471", "#EEFC09"];
  const colorNames = ["Black", "Red", "White", "Grey", "Yellow"];

  const handleColorChange = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setSelectedColorIndex(index);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedImage, colorNames[selectedColorIndex]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    alert('Redirecting to checkout...');
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
    }
  };

  const productNotes = getNotesForProduct(product.id);

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
              <img
                id="product-image"
                src={selectedImage}
                alt={product.name}
                className="product-image"
              />
            </div>
            <div className="col-md-6">
              <h2>{product.name}</h2>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <p>Price: ₹{product.price.toFixed(2)}</p>
              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
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
                <button className="btn add-to-cart-btn" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="btn buy-now-btn" onClick={handleBuyNow}>
                  Buy It Now
                </button>
                <button 
                  className={`btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={toggleWishlist}
                  title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <i className={`fas fa-heart ${isInWishlist(product.id) ? '' : 'far'}`}></i>
                  {isInWishlist(product.id) ? ' Remove' : ' Wishlist'}
                </button>
                <button 
                  className={`btn ${isInCompare(product.id) ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={toggleCompare}
                  title={isInCompare(product.id) ? 'Remove from Compare' : 'Add to Compare'}
                >
                  <i className="fas fa-balance-scale"></i>
                  {isInCompare(product.id) ? ' Remove' : ' Compare'}
                </button>
              </div>
              {addedToCart && (
                <div className="alert alert-success mt-2">
                  Added {quantity} {colorNames[selectedColorIndex]} {product.name} to cart!
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
                <div className="alert alert-success mt-3">Thank you for your review!</div>
              ) : (
                <form
                  id="review-form"
                  onSubmit={e => {
                    e.preventDefault();
                    setReviewSubmitted(true);
                    setReview("");
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="review">Write a Review:</label>
                    <textarea
                      className="form-control"
                      id="review"
                      rows={4}
                      required
                      value={review}
                      onChange={e => setReview(e.target.value)}
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
                  {showNotes ? 'Hide Notes' : 'Show Notes'} ({productNotes.length})
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
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                  
                  {productNotes.length > 0 && (
                    <div className="notes-list">
                      {productNotes.map(note => (
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
      </section>
    </main>
  );
}
