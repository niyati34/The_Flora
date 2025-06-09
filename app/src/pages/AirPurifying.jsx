import { Link } from "react-router-dom";

export default function AirPurifying() {
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
              Air Purifying Plants
            </li>
          </ol>
        </nav>
      </div>

      <img
        src="/air.webp"
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
                  src="/fi/p3.png"
                  alt="Product 1"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <h3>Peace Lily Plant With Self Watering Pot</h3>
                <p>₹325.00</p>
                <Link
                  to="/product/peace-lily"
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
            <div className="col-md-3">
              <div className="product-card bg-white p-3 text-center shadow-sm mb-3 border">
                <img
                  src="/c3.webp"
                  alt="Product 2"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <h3>Spider Plant With Self Watering Pot</h3>
                <p>₹359.00</p>
                <Link
                  to="/product/spider-plant"
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
            <div className="col-md-3">
              <div className="product-card bg-white p-3 text-center shadow-sm mb-3 border">
                <img
                  src="/c5.webp"
                  alt="Product 3"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <h3>Syngonium Red Plant With Self Watering Pot</h3>
                <p>₹347.00</p>
                <Link
                  to="/product/syngonium-red"
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
            <div className="col-md-3">
              <div className="product-card bg-white p-3 text-center shadow-sm mb-3 border">
                <img
                  src="/c8.webp"
                  alt="Product 4"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <h3>
                  Calathea Stromanthe Triostar Plant With Self Watering Pot
                </h3>
                <p>₹410.00</p>
                <Link
                  to="/product/triostar"
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
