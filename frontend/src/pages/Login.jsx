import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";

import logoLeft from "../assets/logovimind.png";
import logoTop from "../assets/logovimind2.png";

import api from "../services/api";
import { supabase } from "../services/supabaseClient";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error.message);
      alert("Gagal login dengan Google: " + error.message);
    }
  };


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Email dan password wajib diisi");
      return;
    }

    try {
      const response = await api.post("/login", {
        email: form.email,
        password: form.password,
      });

      if (response.status === 200) {
        alert("Login Berhasil!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat login");
    }
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

          <img src={logoTop} alt="logo" className="logo-img" />

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

          <div className="divider-text">Atau lewat</div>

          <button onClick={handleGoogleLogin} className="google-btn full">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" />
            Login dengan Google
          </button>


          <div className="small-text">
            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;