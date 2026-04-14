import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import "../App.css";
import "../css/ForgotPasswordCSS.css";
import { supabase } from "../services/supabaseClient";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Email harus diisi");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      alert("Link reset password telah dikirim ke email kamu! Silakan cek inbox.");
      navigate("/reset-sent");
    } catch (error) {
      console.error("Reset error:", error.message);
      alert("Gagal mengirim link reset: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="card">
        {/* LEFT SIDE */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT SIDE */}
        <div className="card-right forgot-content">
          <img src={logo} alt="Vimind Logo" className="forgot-logo" />
          <p className="forgot-label">Tuliskan emailmu:</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="primary-btn forgot-btn"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirimkan"}
            </button>
          </form>

          {/* TOMBOL KEMBALI DITEMPATKAN DI BAWAH, MIRIP TOMBOL KIRIMKAN */}
          <button
            className="primary-btn forgot-btn secondary-style"
            onClick={() => navigate("/dashboard")}
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;