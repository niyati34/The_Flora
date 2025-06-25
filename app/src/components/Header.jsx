import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useCustomerSupport } from "../context/CustomerSupportContext";
import AdvancedSearch from "./AdvancedSearch";
import GlobalKeyboardShortcuts from "./GlobalKeyboardShortcuts";

export default function Header() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    let prevScrollPos = window.pageYOffset;
    const header = document.querySelector("header.sticky");
    const onScroll = () => {
      const current = window.pageYOffset;
      if (!header) return;
      if (prevScrollPos > current) {
        header.style.transform = "translateY(0)";
      } else {
        header.style.transform = "translateY(-100%)";
      }
      prevScrollPos = current;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="sticky">
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div className="container">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="d-none d-md-flex align-items-center gap-2 flex-grow-1"
            style={{ maxWidth: 420 }}
          >
            {showSearch ? (
              <div className="w-100" ref={searchRef}>
                <AdvancedSearch
                  onProductSelect={(p) => {
                    setShowSearch(false);
                    navigate(`/product/${p.id}`);
                  }}
                />
              </div>
            ) : (
              <button
                className="btn btn-outline-success"
                onClick={() => setShowSearch(true)}
              >
                <i className="fas fa-search me-1" /> Search
              </button>
            )}
          </div>

          <div className="logo-container text-center">
            <Link className="navbar-brand" to="/">
              <img
                src="/nm.png"
                alt="The Flora Logo"
                style={{ width: 300, height: 100, marginRight: 10 }}
              />
            </Link>
            <div
              className="collapse navbar-collapse justify-content-center"
              id="mainNavbar"
            >
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    Home
                  </NavLink>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="plantsDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Plants
                  </a>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="plantsDropdown"
                  >
                    <Link className="dropdown-item" to="/plants/air-purifying">
                      Air Purifying Plants
                    </Link>
                    <Link className="dropdown-item" to="/plants/indoor">
                      Indoor Plants
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="/plants/low-maintenance"
                    >
                      Low Maintenance Plants
                    </Link>
                  </div>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/planters">
                    Planters
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/plant-scanner">
                    <i className="fas fa-camera me-1"></i>
                    Plant Scanner
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      // Open customer support chat
                      if (typeof window !== "undefined" && window.openCustomerSupport) {
                        window.openCustomerSupport();
                      }
                    }}
                  >
                    <i className="fas fa-comments me-1"></i>
                    Customer Support
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="nav-icons" style={{ fontSize: 24 }}>
            <NavLink to="/login" className="me-3">
              <i className="fas fa-user" />
            </NavLink>
            <NavLink to="/cart" className="me-3 position-relative">
              <i className="fas fa-shopping-cart" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/wallet">
              <i className="fas fa-wallet" />
            </NavLink>
          </div>
        </div>
      </nav>
      <GlobalKeyboardShortcuts
        onOpenSearch={() => setShowSearch(true)}
        onToggleCart={() => navigate("/cart")}
        onGoHome={() => navigate("/")}
      />
    </header>
  );
}
