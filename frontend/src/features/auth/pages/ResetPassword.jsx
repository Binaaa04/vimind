import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "@/assets/logovimind.png";
import logo from "@/assets/logovimind2.png";
import "./ResetPassword.css";
import { Eye, EyeOff } from "lucide-react";

import { supabase } from "@/services/supabaseClient";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirm: ""
  });
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    document.title = "Reset Password | Vimind";
  }, []);

  // Check if user has active session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkSession();
  }, []);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: "", type: "" });

    if (!form.password || !form.confirm) {
      showNotification("Semua field wajib diisi", "error");
      return;
    }

    if (form.password !== form.confirm) {
      showNotification("Password tidak sama", "error");
      return;
    }

    // Password strength check
    if (form.password.length < 8) {
      showNotification("Password baru minimal harus 8 karakter!", "error");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(form.password);
    const hasNumber = /\d/.test(form.password);
    if (!hasLetter || !hasNumber) {
      showNotification("Password baru harus mengandung kombinasi huruf dan angka.", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (error) throw error;

      showNotification("Password berhasil diubah!", "success");
      setTimeout(() => {
        if (isLoggedIn) {
          navigate("/dashboard");
        } else {
          navigate("/reset-success");
        }
      }, 2000);
    } catch (error) {
      console.error("Update password error:", error.message);
      showNotification("Gagal mengubah password: " + error.message, "error");
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

          <form onSubmit={handleSubmit} className="reset-form">
            {notification.message && (
              <div className={`auth-notification ${notification.type}`} style={{ marginBottom: "20px" }}>
                <span>{notification.type === "error" ? "⚠️" : "✓"}</span>
                <span>{notification.message}</span>
              </div>
            )}
            
            {/* WRAPPER TEXT FIELD */}
            <div className="input-group">
              <div className="password-wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Password baru"
                  className="input-field"
                  value={form.password}
                  onChange={handleChange}
                />
                <span className="eye-icon" onClick={() => setShowPass(!showPass)} style={{ display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              <div className="password-wrapper" style={{ marginTop: "12px" }}>
                <input
                  type={showConf ? "text" : "password"}
                  name="confirm"
                  placeholder="Konfirmasi password baru"
                  className="input-field"
                  value={form.confirm}
                  onChange={handleChange}
                />
                <span className="eye-icon" onClick={() => setShowConf(!showConf)} style={{ display: "flex", alignItems: "center" }}>
                  {showConf ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* WRAPPER BUTTON */}
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>

              <button 
                type="button" 
                className="secondary-btn" 
                onClick={handleBack} 
              >
                Kembali
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;