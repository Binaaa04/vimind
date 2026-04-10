import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import "../css/RegisterCSS.css"; // Pastikan ini mengarah ke file CSS yang benar

import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import { supabase } from "../services/supabaseClient";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State untuk form & fitur mata (show/hide password)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("Semua field wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
          },
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });

      if (error) throw error;

      console.log("Register success:", data);
      alert("Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.");
      navigate("/success"); 
    } catch (error) {
      console.error("Register error:", error.message);
      alert("Gagal mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 👇 TAMBAHKAN 'register-page' DI SINI 👇
    <div className="page-wrapper register-page">
      <div className="card">

        {/* LEFT */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT */}
        <div className="card-right">

          <div className="logo-container">
            <img src={logo} alt="Vimind Logo" className="logo-img" />
          </div>

          <p className="subtitle">
            Butuh akun baru? mari kita buat
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="login-form">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input-field"
              value={form.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="input-field"
              value={form.email}
              onChange={handleChange}
            />

            {/* Wrapper Password & Icon Mata */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="input-field"
                value={form.password}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {/* Tombol Utama */}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Loading..." : "Daftar"}
            </button>

            {/* Teks Bawah */}
            <div className="small-text">
              Sudah punya akun? <Link to="/login">yuk cek kesehatanmu!</Link>
            </div>
            
          </form>

          {/* Bagian Google Login */}
          <div className="divider-text">Or</div>

          <button onClick={handleGoogleLogin} className="google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" />
            Continue With Google
          </button>

        </div>
      </div>
    </div>
  );
};

export default Register;