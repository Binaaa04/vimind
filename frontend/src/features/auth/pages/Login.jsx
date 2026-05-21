import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "@/App.css";
import "@/css/LoginCSS.css";

import logoLeft from "@/assets/logovimind.png";
import logoTop from "@/assets/logovimind2.png";
import { supabase } from "@/services/supabaseClient";
import { getProfile, updateProfile } from "@/features/auth/api";
import { useAuth } from "@/shared/context/AuthContext";

const Login = () => {

  const navigate = useNavigate();
  const { setRole } = useAuth();
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

      // Fetch profile to check role and birth_date
      let userRole = "user";
      let profileData = null;
      try {
        const profileRes = await getProfile();
        profileData = profileRes.data;
        userRole = profileRes.data?.role || "user";
        localStorage.setItem("userRole", userRole);
        setRole(userRole);
      } catch (err) {
        console.warn("Profile fetch failed:", err?.response?.status || err.message);
        // Check if we have a stored role from a previous session
        const storedRole = localStorage.getItem("userRole");
        if (storedRole === "admin") {
          userRole = "admin";
          setRole("admin");
        }
        // If profile fetch fails but user is not admin, try to auto-create
        if (userRole !== "admin") {
          try {
            const fallbackName = data.user?.user_metadata?.full_name || form.email.split("@")[0];
            await updateProfile(form.email, fallbackName, "", "");
            console.log("User auto-created in backend.");
            // Try fetching profile again after creation
            try {
              const retryRes = await getProfile();
              profileData = retryRes.data;
              userRole = retryRes.data?.role || "user";
              localStorage.setItem("userRole", userRole);
              setRole(userRole);
            } catch (_) {}
          } catch (createErr) {
            console.error("Failed to auto-create user:", createErr);
          }
        }
      }

      // Check if there's a pending redirect (e.g., from guest result page)
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      const pendingAnswersRaw = sessionStorage.getItem("pending_answers");

      if (userRole === "admin") {
        if (redirectAfterLogin) localStorage.removeItem("redirectAfterLogin");
        navigate("/admin");
      } else if (!profileData || !profileData.birth_date) {
        // If profile doesn't exist or birth_date is missing, redirect to complete biodata
        navigate("/lengkapi-biodata");
      } else {
        if (redirectAfterLogin || pendingAnswersRaw) {
          if (redirectAfterLogin) localStorage.removeItem("redirectAfterLogin");
          navigate("/hasil");
        } else {
          navigate("/dashboard");
        }
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

          {/* 👇 TOMBOL KEMBALI SEKARANG DI DALAM CARD-RIGHT 👇 */}
          <div className="back-button-container">
            <button onClick={handleBack} className="back-btn">
              <span className="back-icon">←</span> Kembali
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
