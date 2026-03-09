import React, { useState } from "react";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../services/supabaseClient";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
    <div className="page-wrapper">
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

          <div className="subtitle">
            Butuh akun baru? mari kita buat
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

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

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={handleChange}
            />

            <button type="submit" className="primary-btn">
              Daftar
            </button>

          </form>

          <div className="small-text">
            Sudah punya akun? <Link to="/login">Login sekarang</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;