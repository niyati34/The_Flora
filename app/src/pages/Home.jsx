import LazyImage from "../components/LazyImage";
import analytics from "../utils/analytics";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    analytics.trackPageView('Home');
  }, []);

  const carouselItems = [
    {
      src: "/i1.jpg",
      alt: "Beautiful Garden Collection",
      title: "Discover Our Garden Collection",
      subtitle: "Transform your space with nature's beauty"
    },
    {
      src: "/i4.webp",
      alt: "Indoor Plant Selection",
      title: "Indoor Plant Paradise",
      subtitle: "Bring the outdoors inside with our curated selection"
    },
    {
      src: "/i3.webp",
      alt: "Plant Care Essentials",
      title: "Expert Plant Care",
      subtitle: "Everything you need for thriving plants"
    }
  ];

  const newLaunches = [
    {
      src: "/v1.mp4",
      desc: "Square Box Tabletop Terrarium",
      price: "₹399",
      originalPrice: "₹499",
      discount: "20% OFF",
      rating: 4.8,
      reviews: 127
    },
    {
      src: "/v2.mp4",
      desc: "Floral Printed Pot with Iron Stand",
      price: "₹299",
      originalPrice: "₹399",
      discount: "25% OFF",
      rating: 4.6,
      reviews: 89
    },
    {
      src: "/v3.mp4",
      desc: "Designer Metallic Round Shape Planter",
      price: "₹401",
      originalPrice: "₹501",
      discount: "20% OFF",
      rating: 4.7,
      reviews: 156
    },
    {
      src: "/v4.mp4",
      desc: "Sansevieria Golden Hahnii Snake Plant",
      price: "₹399",
      originalPrice: "₹499",
      discount: "20% OFF",
      rating: 4.9,
      reviews: 203
    }
  ];

  const features = [
    { 
      img: "/n3.png", 
      text: "Just like you, we're plant lovers too",
      icon: "fas fa-heart",
      color: "#e74c3c"
    },
    {
      img: "/n2.png",
      text: "Our homegrown plants get the utmost care and attention",
      icon: "fas fa-seedling",
      color: "#27ae60"
    },
    {
      img: "/n1.png",
      text: "We bring you plant care guides by gardening experts",
      icon: "fas fa-book-open",
      color: "#f39c12"
    },
    {
      img: "/n.png",
      text: "We ensure quick delivery and hassle-free replacements",
      icon: "fas fa-shipping-fast",
      color: "#3498db"
    }
  ];

  const faqs = [
    {
      q: "1. How do I choose the right plants for my garden?",
      a: "Consider your local climate, sunlight exposure, soil type, and preferences. Research each plant's specific needs and growth patterns. Our plant finder tool can help you discover the perfect plants for your space.",
      category: "Plant Selection"
    },
    {
      q: "2. How often should I water my plants?",
      a: "Water when the top inch of soil is dry; avoid overwatering to prevent root rot. Different plants have different water needs - succulents need less water while tropical plants prefer consistently moist soil.",
      category: "Care & Maintenance"
    },
    {
      q: "3. What should I do if my plant has pests?",
      a: "Isolate the affected plant, identify the pest type, and treat with appropriate methods like insecticidal soap, neem oil, or manual removal. Early detection is key to preventing spread.",
      category: "Pest Control"
    },
    {
      q: "4. When is the best time to fertilize plants?",
      a: "During the active growing season (spring/summer) with a balanced, slow-release fertilizer. Avoid fertilizing during dormancy periods and always follow package instructions.",
      category: "Care & Maintenance"
    },
    {
      q: "5. How can I protect my plants from extreme weather conditions?",
      a: "Use mulch for temperature regulation, shade cloth for sun protection, row covers for frost protection, and ensure proper watering during heat waves. Consider moving potted plants indoors during extreme conditions.",
      category: "Weather Protection"
    },
    {
      q: "6. What should I do if my plant's leaves turn yellow?",
      a: "Yellow leaves can indicate water issues, nutrient deficiency, pests, or natural aging. Check soil moisture, examine for pests, and consider if it's just older leaves naturally dying off.",
      category: "Troubleshooting"
    }
  ];

  return (
    <div className={`container-fluid py-4 ${isVisible ? 'fade-in' : ''}`}>
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.8s ease-in-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .product-card {
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          
          .discount-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10;
          }
          
          .rating-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10;
          }
          
          .feature-card {
            transition: all 0.3s ease;
            padding: 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
          }
          
          .feature-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.2);
          }
          
          .carousel-caption {
            background: rgba(0, 0, 0, 0.6);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
          }
        `}
      </style>

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
                <i className="fas fa-gift me-2"></i>
                Get Rewards
              </a>
              <a href="#" className="btn btn-success">
                <i className="fas fa-camera me-2"></i>
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
        data-bs-interval="4000"
      >
        <div className="carousel-indicators">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : "false"}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
        <div className="carousel-inner" style={{ height: 500 }}>
          {carouselItems.map((item, index) => (
            <div 
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <LazyImage
                src={item.src}
                className="d-block w-100"
                style={{ height: "100%", objectFit: "cover" }}
                alt={item.alt}
              />
              <div className="carousel-caption d-none d-md-block">
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </div>
          ))}
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
          <h2 className="section-title text-center mb-4">
            <i className="fas fa-star me-2" style={{ color: "#ffd700" }}></i>
            New Launches
          </h2>
          <div className="row">
            {newLaunches.map((product, i) => (
              <div className="col-md-3 mb-4" key={i}>
                <div className="product-card product border-0 p-0">
                  <div style={{ position: "relative" }}>
                    <video
                      autoPlay
                      muted
                      loop
                      style={{ width: "100%", height: "auto" }}
                    >
                      <source src={product.src} type="video/mp4" />
                    </video>
                    <div className="discount-badge">
                      {product.discount}
                    </div>
                    <div className="rating-badge">
                      <i className="fas fa-star me-1" style={{ color: "#ffd700" }}></i>
                      {product.rating} ({product.reviews})
                    </div>
                  </div>
                  <div className="product-details text-center p-3">
                    <h6 className="product-description mb-2">
                      {product.desc}
                    </h6>
                    <div className="price-section mb-3">
                      <span className="current-price me-2" style={{ fontSize: "18px", fontWeight: "bold", color: "#6A9304" }}>
                        {product.price}
                      </span>
                      <span className="original-price" style={{ textDecoration: "line-through", color: "#999", fontSize: "14px" }}>
                        {product.originalPrice}
                      </span>
                    </div>
                    <a href="#" className="btn btn-primary w-100">
                      <i className="fas fa-eye me-2"></i>
                      View Product
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <a href="#" className="btn btn-success btn-lg">
              <i className="fas fa-arrow-right me-2"></i>
              View All Products
            </a>
          </div>
        </div>
      </section>

      <section
        className="what-makes-flora"
        style={{ backgroundColor: "#2B5943", color: "#fff", padding: "40px 0" }}
      >
        <div className="container">
          <h2 className="section-title text-center mb-5">
            <i className="fas fa-leaf me-2"></i>
            What Makes The Flora Different?
          </h2>
          <div className="row justify-content-between">
            {features.map((feature, i) => (
              <div className="col-md-3 text-center mb-4" key={i}>
                <div className="feature-card">
                  <LazyImage
                    src={feature.img}
                    alt=""
                    className="img-fluid mx-auto mb-3"
                    style={{ maxWidth: "50%" }}
                  />
                  <div className="feature-icon mb-3">
                    <i className={feature.icon} style={{ fontSize: "32px", color: feature.color }}></i>
                  </div>
                  <p style={{ fontFamily: "Josefin Slab, sans-serif", margin: 0 }}>
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq my-5">
        <div className="container">
          <h2 className="section-title text-center mb-4">
            <i className="fas fa-question-circle me-2" style={{ color: "#6A9304" }}></i>
            Frequently Asked Questions
          </h2>
          <div className="accordion" id="faqAccordion">
            {faqs.map((item, idx) => (
              <div className="card mb-2" key={idx}>
                <div className="card-header" id={`faqHeading${idx}`}>
                  <h3 className="mb-0">
                    <button
                      className="btn btn-link text-decoration-none w-100 text-start"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faqCollapse${idx}`}
                      aria-expanded={idx === 0}
                      aria-controls={`faqCollapse${idx}`}
                      style={{ color: "#6A9304", fontWeight: "500" }}
                    >
                      <i className="fas fa-chevron-right me-2"></i>
                      {item.q}
                      <span className="badge bg-secondary ms-2" style={{ fontSize: "10px" }}>
                        {item.category}
                      </span>
                    </button>
                  </h3>
                </div>
                <div
                  id={`faqCollapse${idx}`}
                  className={`collapse ${idx === 0 ? "show" : ""}`}
                  aria-labelledby={`faqHeading${idx}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="card-body" style={{ backgroundColor: "#f8f9fa" }}>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
