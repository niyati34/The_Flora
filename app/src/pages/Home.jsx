import LazyImage from "../components/LazyImage";
import analytics from "../utils/analytics";

export default function Home() {
  return (
    <div className="container-fluid py-4">
      <section
        className="info text-center"
        style={{ backgroundColor: "#F5F5F5" }}
      >
        <div className="row align-items-center py-5">
          <div className="col-md-6">
            <h2 style={{ fontFamily: "Cinzel, serif" }}>
              Welcome to The Flora
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#6A9304",
                fontFamily: "Macondo, cursive",
                fontWeight: "bold",
              }}
            >
              Your one-stop destination for all your gardening needs.
            </p>
            <p
              style={{
                fontSize: 18,
                color: "#6A9304",
                fontFamily: "Macondo, cursive",
                fontWeight: "bold",
              }}
            >
              The Flora is your premier online destination for all things
              related to gardening and plants. We offer a wide range of products
              and resources to help you cultivate the garden of your dreams.
            </p>
            <p
              style={{
                fontSize: 18,
                color: "#6A9304",
                fontFamily: "Macondo, cursive",
                fontWeight: "bold",
              }}
            >
              Our mission is to provide garden enthusiasts, both beginners and
              experts, with the tools, knowledge, and inspiration needed to
              create and maintain beautiful gardens.
            </p>
            <div className="info-buttons mt-3">
              <a href="#" className="btn btn-success me-2">
                Get Rewards
              </a>
              <a href="#" className="btn btn-success">
                Scan a Plant
              </a>
            </div>
          </div>
          <div className="col-md-6 text-center">
            <img
              src="/plant1.gif"
              alt="Garden Animation"
              className="gif-animation"
              style={{ maxWidth: "50%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      <div
        id="carouselExampleIndicators"
        className="carousel slide my-4"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
        </div>
        <div className="carousel-inner" style={{ height: 500 }}>
          <div className="carousel-item active">
            <LazyImage
              src="/i1.jpg"
              className="d-block w-100"
              style={{ height: "100%", objectFit: "cover" }}
              alt="Slide 1"
            />
          </div>
          <div className="carousel-item">
            <LazyImage
              src="/i4.webp"
              className="d-block w-100"
              style={{ height: "100%", objectFit: "cover" }}
              alt="Slide 2"
            />
          </div>
          <div className="carousel-item">
            <LazyImage
              src="/i3.webp"
              className="d-block w-100"
              style={{ height: "100%", objectFit: "cover" }}
              alt="Slide 3"
            />
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <section className="new-launches py-4">
        <div className="container">
          <h2 className="section-title text-center">New Launches</h2>
          <div className="row">
            {[
              {
                src: "/v1.mp4",
                desc: "Square Box Tabletop Terrarium",
                price: "₹399",
              },
              {
                src: "/v2.mp4",
                desc: "Floral Printed Pot with Iron Stand",
                price: "₹299",
              },
              {
                src: "/v3.mp4",
                desc: "Designer Metallic Round Shape Planter",
                price: "₹401",
              },
              {
                src: "/v4.mp4",
                desc: "Sansevieria Golden Hahnii Snake Plant",
                price: "₹399",
              },
            ].map((v, i) => (
              <div className="col-md-3" key={i}>
                <div className="product border p-2 mb-3">
                  <video
                    autoPlay
                    muted
                    loop
                    style={{ width: "100%", height: "auto" }}
                  >
                    <source src={v.src} type="video/mp4" />
                  </video>
                  <div className="product-details text-center">
                    <p className="product-description">
                      {v.desc}
                      <br /> {v.price}
                    </p>
                    <a href="#" className="btn btn-primary">
                      View Product
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-2">
            <a href="#" className="btn btn-success">
              View All
            </a>
          </div>
        </div>
      </section>

      <section
        className="what-makes-flora"
        style={{ backgroundColor: "#2B5943", color: "#fff", padding: "40px 0" }}
      >
        <div className="container">
          <h2 className="section-title">What Makes The Flora Different?</h2>
          <div className="row justify-content-between">
            {[
              { img: "/n3.png", text: "Just like you, we're plant lovers too" },
              {
                img: "/n2.png",
                text: "Our homegrown plants get the utmost care and attention",
              },
              {
                img: "/n1.png",
                text: "We bring you plant care guides by gardening experts",
              },
              {
                img: "/n.png",
                text: "We ensure quick delivery and hassle-free replacements",
              },
            ].map((c, i) => (
              <div className="col-md-3 text-center" key={i}>
                <div className="column-content">
                  <LazyImage
                    src={c.img}
                    alt=""
                    className="img-fluid mx-auto"
                    style={{ maxWidth: "50%" }}
                  />
                  <p style={{ fontFamily: "Josefin Slab, sans-serif" }}>
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq my-5">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            {[
              {
                q: "1. How do I choose the right plants for my garden?",
                a: "Consider your local climate, sunlight exposure, soil type, and preferences. Research each plant.",
              },
              {
                q: "2. How often should I water my plants?",
                a: "Water when the top inch of soil is dry; avoid overwatering to prevent root rot.",
              },
              {
                q: "3. What should I do if my plant has pests?",
                a: "Isolate, identify the pest, and treat with insecticidal soap, neem oil, or manual removal.",
              },
              {
                q: "4. When is the best time to fertilize plants?",
                a: "During growing season (spring/summer) with a balanced, slow-release fertilizer.",
              },
              {
                q: "5. How can I protect my plants from extreme weather conditions?",
                a: "Use mulch, shade cloth, or row covers; water well during heat and protect from frost.",
              },
              {
                q: "6. What should I do if my plant's leaves turn yellow?",
                a: "Could be water issues, nutrient deficiency, or pests—diagnose and adjust care.",
              },
            ].map((item, idx) => (
              <div className="card" key={idx}>
                <div className="card-header" id={`faqHeading${idx}`}>
                  <h3 className="mb-0">
                    <button
                      className="btn btn-link"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faqCollapse${idx}`}
                      aria-expanded={idx === 0}
                      aria-controls={`faqCollapse${idx}`}
                    >
                      {item.q}
                    </button>
                  </h3>
                </div>
                <div
                  id={`faqCollapse${idx}`}
                  className={`collapse ${idx === 0 ? "show" : ""}`}
                  aria-labelledby={`faqHeading${idx}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="card-body">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
