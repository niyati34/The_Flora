import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky">
      <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <form className="form-inline search-bar d-none d-md-flex">
            <input className="form-control mr-sm-2" type="text" placeholder="Search..." />
            <button className="btn btn-success" type="submit"><i className="fas fa-search" /></button>
          </form>

          <div className="logo-container text-center">
            <Link className="navbar-brand" to="/">
              <img src="/nm.png" alt="The Flora Logo" style={{ width: 300, height: 100, marginRight: 10 }} />
            </Link>
            <ul className="navbar-nav ml-auto justify-content-center">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="plantsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">Plants</a>
                <div className="dropdown-menu" aria-labelledby="plantsDropdown">
                  <a className="dropdown-item" href="#">Air Purifying Plants</a>
                  <a className="dropdown-item" href="#">Indoor Plants</a>
                  <a className="dropdown-item" href="#">Low Maintenance Plants</a>
                </div>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/planters">Planters</NavLink>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Plant-Scanner</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Customer Support</a>
              </li>
            </ul>
          </div>

          <div className="nav-icons" style={{ fontSize: 24 }}>
            <NavLink to="/login" className="me-3"><i className="fas fa-user" /></NavLink>
            <NavLink to="/cart" className="me-3"><i className="fas fa-shopping-cart" /></NavLink>
            <a href="#"><i className="fas fa-wallet" /></a>
          </div>
        </div>
      </nav>
    </header>
  )
}
