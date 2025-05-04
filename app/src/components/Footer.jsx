export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h4>About The Flora</h4>
            <p>Your one-stop destination for all your gardening needs.</p>
            <ul className="list-unstyled list-inline">
              <li className="list-inline-item"><a href="#"><i className="fab fa-facebook"></i></a></li>
              <li className="list-inline-item"><a href="#"><i className="fab fa-twitter"></i></a></li>
              <li className="list-inline-item"><a href="#"><i className="fab fa-instagram"></i></a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Get in Touch</h4>
            <ul className="list-unstyled">
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Quick Links</h4>
            <ul className="list-unstyled">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Return & Refund</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Return Request</a></li>
              <li><a href="#">Corporate Gifting</a></li>
            </ul>
          </div>
        </div>
        <p>© 2023 The Flora. All rights reserved.</p>
      </div>
    </footer>
  )
}
