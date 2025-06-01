import { useParams, Link } from "react-router-dom";
import { products } from "../data/products";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  if (!product)
    return (
      <div className="container mt-5">
        <h2>Product not found</h2>
      </div>
    );

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
                src={product.image}
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
                  defaultValue={1}
                  min={1}
                  className="form-control"
                />
              </div>
              <div className="color-options">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="color-circle"
                    style={{
                      backgroundColor: [
                        "black",
                        "red",
                        "white",
                        "#757471",
                        "#EEFC09",
                      ][i],
                    }}
                  ></div>
                ))}
              </div>
              <div className="buttons">
                <button className="btn add-to-cart-btn">Add to Cart</button>
                <button className="btn buy-now-btn">Buy It Now</button>
              </div>
              <ul className="list-styled">
                <li>Free Shipping</li>
                <li>Cash on delivery available</li>
                <li>10 Days Refund Policy Terms & Conditions Apply</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <div className="about-peace-lily" style={{ marginTop: -140 }}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3>About The Peace Lily Plant</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
      <section className="product-info">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p>{product.info}</p>
            </div>
            <div className="col-md-6">
              <img
                src={product.image}
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
    </main>
  );
}
