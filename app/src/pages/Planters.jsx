export default function Planters() {
  return (
    <div>
      <div className="breadcrumb-container" style={{ padding: 20, backgroundColor: '#FFFFFF', marginTop: 180 }}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item active" aria-current="page">Planters</li>
          </ol>
        </nav>
      </div>
      <img src="/Planters.webp" alt="plant" id="full-screen-image" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
      <section className="product-section" style={{ backgroundColor: '#FDDEA7', padding: '20px 0' }}>
        <div className="container">
          <div className="row">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div className="col-md-3" key={idx}>
                <div className="product-card bg-white p-3 text-center shadow-sm mb-3 border">
                  <img src={`/fi/p${(idx % 5) + 1}.png`} alt={`Product ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
                  <h3>Product {idx + 1}</h3>
                  <p>Description of Product {idx + 1}.</p>
                  <a href="#" className="view-product-btn btn" style={{ backgroundColor: '#2B5943', color: '#fff' }}>View Product</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
