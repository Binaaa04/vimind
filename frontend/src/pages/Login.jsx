import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";

import logoLeft from "../assets/logovimind.png";
import logoTop from "../assets/logovimind2.png";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Email dan password wajib diisi");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* LEFT IMAGE */}
        <div className="card-left">
          <img src={logoLeft} alt="Vimind Illustration" />
        </div>

        {/* RIGHT FORM */}
        <div className="card-right">

          <img src={logoTop} alt="logo" className="logo-img"/>

          <p className="subtitle center-text">
            Bagaimanakah kesehatan mentalmu hari ini?
          </p>

          <form onSubmit={handleLogin} className="login-form">

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className="input-field"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input-field"
              onChange={handleChange}
            />

            <div className="forgot-row">
              <Link to="/forgot-password">Lupa Password?</Link>
            </div>

            <button type="submit" className="primary-btn full">
              Login
            </button>

          </form>

          <div className="small-text">
            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;