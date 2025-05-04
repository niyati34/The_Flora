import { useState } from 'react'

export default function Signup() {
  const [errors, setErrors] = useState({})

  const validate = (e) => {
    e.preventDefault()
    const form = e.target
    const username = form.username.value.trim()
    const email = form.email.value.trim()
    const password = form.password.value

    const next = {}
    if (!username) next.username = 'Please Enter Your Name'
    if (!email) next.email = 'Please Enter Your Email'
    else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,6}\.[a-zA-Z]{2,4}(\.[a-zA-Z]{2,2})?$/.test(email)) next.email = 'Please Enter a correct email format'
    if (password.length < 8 || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\]/.test(password)) next.password = 'Password should be at least 8 characters long and contain at least one special character'

    setErrors(next)
    if (Object.keys(next).length === 0) {
      // submit
    }
  }

  return (
    <main className="container" style={{ marginTop: 210 }}>
      <section className="signup-form" style={{ backgroundColor: '#fff', padding: 20, border: '1px solid #ddd', boxShadow: '0 0 10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        <h2 style={{ color: '#2B5943', fontFamily: 'Prompt, sans-serif' }}>Sign Up</h2>
        <form className="form" onSubmit={validate}>
          <input name="username" type="text" placeholder="Username" className="form-control mb-1" />
          {errors.username && <div className="error text-danger text-start mb-1">{errors.username}</div>}
          <input name="email" type="email" placeholder="Email" className="form-control mb-1" />
          {errors.email && <div className="error text-danger text-start mb-1">{errors.email}</div>}
          <input name="password" type="password" placeholder="Password" className="form-control mb-1" />
          {errors.password && <div className="error text-danger text-start mb-1">{errors.password}</div>}
          <button type="submit" className="btn mt-2" style={{ backgroundColor: '#2B5943', color: '#fff' }}>Sign Up</button>
        </form>
        <div id="login-link" className="mt-3">
          Already have an account? <a href="/login" id="login-toggle">Log in here</a>
        </div>
      </section>
    </main>
  )
}
