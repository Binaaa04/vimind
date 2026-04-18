import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "../App.css";
import "../css/LoginCSS.css";

import logoLeft from "../assets/logovimind.png";
import logoTop from "../assets/logovimind2.png";
import { supabase } from "../services/supabaseClient";

const Login = () => {

  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Login | Vimind";
  }, []);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  // 1. STATE BARU UNTUK SHOW/HIDE PASSWORD
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      // If guest came from result page, redirect directly to /hasil after Google login
      // Supabase will attach the session token as a hash in the URL
      const redirectTo = redirectAfterLogin
        ? window.location.origin + redirectAfterLogin
        : window.location.origin + "/dashboard";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
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

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      console.log("Login success:", data);
      localStorage.setItem("isLogin", "true");

      // Check if there's a pending redirect (e.g., from guest result page)
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectAfterLogin);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Gagal login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk kembali ke Landing Page
  const handleBack = () => {
    navigate("/"); // Arahkan ke rute beranda / landing page
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">

        {/* LEFT IMAGE */}
        <div className="card-left">
          <img src={logoLeft} alt="Vimind Illustration" />
        </div>

        {/* RIGHT FORM */}
        <div className="card-right">

          {/* 👇 TOMBOL KEMBALI DITAMBAHKAN DI SINI 👇 */}
          <div className="back-button-container">
            <button onClick={handleBack} className="back-btn">
              <span className="back-icon"></span> Kembali
            </button>
          </div>

          <img src={logoTop} alt="logo" className="login-top-logo" />
          
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

            {/* 2. WRAPPER UNTUK INPUT PASSWORD & ICON MATA */}
            <div className="password-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"} // Logika ubah tipe input
                placeholder="Password"
                className="input-field"
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="forgot-row">
              <Link to="/forgot-password">Lupa Password?</Link>
            </div>

            <button type="submit" className="primary-btn full" disabled={loading}>
              {loading ? "Loading..." : "Login"}
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