import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const next = { username: "", email: "", password: "" };
    if (!form.username.trim()) next.username = "Username is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return !next.username && !next.email && !next.password;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <h2
              className="mb-4 text-center"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Sign Up
            </h2>
            {submitted ? (
              <div className="alert alert-success" role="alert">
                Account created. You can now{" "}
                <Link to="/login" className="alert-link">
                  log in
                </Link>
                .
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="signup-username" className="form-label">
                    Username
                  </label>
                  <input
                    id="signup-username"
                    name="username"
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    value={form.username}
                    onChange={onChange}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="signup-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    value={form.email}
                    onChange={onChange}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="signup-password" className="form-label">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    value={form.password}
                    onChange={onChange}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <button type="submit" className="btn btn-success w-100">
                  Sign Up
                </button>
              </form>
            )}
            <div className="text-center mt-3">
              Already have an account? <Link to="/login">Log in here</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
