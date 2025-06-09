import { Link } from "react-router-dom";

export default function IndoorPlants() {
  return (
    <div>
      <div
        className="breadcrumb-container"
        style={{ padding: 20, backgroundColor: "#FFFFFF", marginTop: 180 }}
      >
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Indoor Plants
            </li>
          </ol>
        </nav>
      </div>
      <img
        src="/indoor.webp"
        alt="plant"
        id="full-screen-image"
        style={{
          maxWidth: "100%",
          maxHeight: "80vh",
          width: "auto",
          height: "auto",
          objectFit: "contain",
        }}
      />

      <section
        className="product-section"
        style={{ backgroundColor: "#FDDEA7", padding: "20px 0" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="product-card bg-white p-3 text-center shadow-sm mb-3 border">
                <img
                  src="/c6.webp"
                  alt="Product 1"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <h3>Jade Plant With Self Watering Pot: Lucky Plant</h3>
                <p>₹299.00</p>
                <Link
                  to="/product/jade-plant"
                  className="view-product-btn btn"
                  style={{
                    backgroundColor: "#2B5943",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "5px 15px",
                    borderRadius: "5px",
                    display: "inline-block",
                    marginTop: "10px",
                  }}
                >
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
