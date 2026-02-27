import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import "../App.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email harus diisi");
      return;
    }

    console.log("Reset password untuk:", email);

    // simulasi berhasil kirim email reset
    alert("Link reset password telah dikirim ke email kamu");

    navigate("/reset-sent");
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

          <img 
            src={logo} 
            alt="Vimind Logo" 
            className="forgot-logo"
          />

          <p className="forgot-label">Tuliskan emailmu:</p>

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" className="primary-btn forgot-btn">
              Kirimkan
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;