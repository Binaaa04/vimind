import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/App.css";
import "./Register.css";
import { Eye, EyeOff } from "lucide-react";

import illustration from "@/assets/logovimind.png";
import logo from "@/assets/logovimind2.png";
import { supabase } from "@/services/supabaseClient";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    document.title = "Buat akun baru | Vimind";
  }, []);

  const handleBack = () => {
    navigate("/login");
  };

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
  };

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
      showNotification("Gagal login dengan Google: " + error.message, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: "", type: "" });

    if (!form.name || !form.email || !form.password) {
      showNotification("Semua field wajib diisi", "error");
      return;
    }

    // Password strength check (min 8 characters, combination of letter & number)
    if (form.password.length < 8) {
      showNotification("Password minimal harus 8 karakter!", "error");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(form.password);
    const hasNumber = /\d/.test(form.password);
    if (!hasLetter || !hasNumber) {
      showNotification("Password harus mengandung kombinasi huruf dan angka.", "error");
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
      showNotification("Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.", "success");
      setTimeout(() => {
        navigate("/success");
      }, 3000);
    } catch (error) {
      console.error("Register error:", error.message);
      showNotification("Gagal mendaftar: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper register-page">
      <div className="card">

        {/* LEFT */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT */}
        <div className="card-right">
          <div className="back-button-container">
            <button onClick={handleBack} className="back-btn">
              <span className="back-icon">←</span> Kembali
            </button>
          </div>

          <div className="logo-container">
            <img src={logo} alt="Vimind Logo" className="logo-img" />
          </div>

          <p className="subtitle">
            Butuh akun baru? mari kita buat
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="login-form">
            {notification.message && (
              <div className={`auth-notification ${notification.type}`}>
                <span>{notification.type === "error" ? "⚠️" : "✓"}</span>
                <span>{notification.message}</span>
              </div>
            )}

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

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (Min. 8 karakter + kombinasi huruf/angka)"
                className="input-field"
                value={form.password}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Loading..." : "Daftar"}
            </button>

            <div className="small-text">
              Sudah punya akun? <Link to="/login">yuk cek kesehatanmu!</Link>
            </div>
          </form>

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
