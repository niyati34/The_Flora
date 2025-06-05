import { Link, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  
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
          <form className="search-bar d-none d-md-flex align-items-center gap-2">
            <input
              className="form-control mr-sm-2"
              type="text"
              placeholder="Search..."
            />
            <button className="btn btn-success" type="submit">
              <i className="fas fa-search" />
            </button>
          </form>

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
                  <a className="nav-link" href="#">
                    Plant-Scanner
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Customer Support
                  </a>
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
            <a href="#">
              <i className="fas fa-wallet" />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
