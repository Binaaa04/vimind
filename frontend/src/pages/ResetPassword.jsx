import { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import "../App.css";

import { supabase } from "../services/supabaseClient";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirm: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || !form.confirm) {
      alert("Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirm) {
      alert("Password tidak sama");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (error) throw error;

      alert("Password berhasil diubah! Silakan login kembali.");
      navigate("/reset-success");
    } catch (error) {
      console.error("Update password error:", error.message);
      alert("Gagal mengubah password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* LEFT IMAGE */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT FORM */}
        <div className="card-right">

          <img src={logo} alt="logo" className="reset-logo" />

          <h3 className="reset-title">Reset password</h3>

          <form onSubmit={handleSubmit}>

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
              placeholder="Password baru"
              className="input-field"
              value={form.password}
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirm"
              placeholder="Konfirmasi password baru"
              className="input-field"
              value={form.confirm}
              onChange={handleChange}
            />

            <button type="submit" className="primary-btn">
              Kembali ke Halaman Login
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;