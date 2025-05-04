export default function Login() {
  return (
    <main className="container" style={{ marginTop: 210 }}>
      <section className="login-form" style={{ backgroundColor: '#fff', padding: 20, border: '1px solid #ddd', boxShadow: '0 0 10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        <h2 style={{ color: '#2B5943', fontFamily: 'Prompt, sans-serif' }}>Log In</h2>
        <form onSubmit={(e)=> e.preventDefault()} className="form">
          <input type="text" placeholder="Username" required className="form-control mb-2" />
          <input type="password" placeholder="Password" required className="form-control mb-2" />
          <button type="submit" className="btn" style={{ backgroundColor: '#2B5943', color: '#fff' }}>Log In</button>
        </form>
        <div id="signup-link" className="mt-3">
          Don't have an account? <a href="/signup" id="signup-toggle">Sign up here</a>
        </div>
      </section>
    </main>
  )
}
