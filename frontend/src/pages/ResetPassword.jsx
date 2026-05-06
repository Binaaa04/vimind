import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import "../css/ResetPasswordCSS.css"

import { supabase } from "../services/supabaseClient";

const ResetPassword = () => {
  useEffect(() => {
    document.title = "Reset Password | Vimind";
  }, []);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirm: ""
  });

  // Check if user has active session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkSession();
  }, []);

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

      alert("Password berhasil diubah!");
      if (isLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/reset-success");
      }
    } catch (error) {
      console.error("Update password error:", error.message);
      alert("Gagal mengubah password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="page-wrapper reset-password-page">
      <div className="reset-card">

        {/* LEFT IMAGE */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT FORM */}
        <div className="card-right">

          <img src={logo} alt="logo" className="reset-logo" />

          <h3 className="reset-title">Reset Password</h3>

          <form onSubmit={handleSubmit} className="reset-form">

            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Password baru"
                className="input-field"
                value={form.password}
                onChange={handleChange}
              />
              <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="password-wrapper">
              <input
                type={showConf ? "text" : "password"}
                name="confirm"
                placeholder="Konfirmasi password baru"
                className="input-field"
                value={form.confirm}
                onChange={handleChange}
              />
              <span className="eye-icon" onClick={() => setShowConf(!showConf)}>
                {showConf ? "🙈" : "👁️"}
              </span>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>

            <button type="button" className="primary-btn" onClick={handleBack} style={{ backgroundColor: '#e2e8f0', color: '#475569', marginTop: '8px' }}>
              Kembali
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;