import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "@/App.css";
import "@/css/LoginCSS.css"; // Kita re-use styling dari Login Page
import { supabase } from "@/services/supabaseClient";
import { updateProfile, getProfile } from "@/features/auth/api";

import logoLeft from "@/assets/logovimind.png";
import logoTop from "@/assets/logovimind2.png";

const LengkapiBiodata = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    birth_date: ""
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Lengkapi Biodata | Vimind";
    
    // Cek apakah ada session user yang aktif
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Kalau gaada session, tendang balik ke login
        navigate("/login");
        return;
      }
      
      setEmail(session.user.email);
      
      // Coba pre-fill nama kalau ada
      try {
        const res = await getProfile(session.user.email);
        // Jika birth_date sudah terisi, artinya gak usah kesini, lempar ke dashboard
        if (res.data?.birth_date) {
            const pendingAnswersRaw = sessionStorage.getItem("pending_answers");
            const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
            if (pendingAnswersRaw || redirectAfterLogin) {
              if (redirectAfterLogin) localStorage.removeItem("redirectAfterLogin");
              navigate("/hasil");
            } else {
              navigate("/dashboard");
            }
            return;
        }

        if (res.data?.name && res.data.name !== "") {
          setForm(prev => ({ ...prev, name: res.data.name }));
        } else if (session.user.user_metadata?.full_name) {
          setForm(prev => ({ ...prev, name: session.user.user_metadata.full_name }));
        }
      } catch (e) {
        console.error("Gagal menarik profile", e);
      }
    };

    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.birth_date) {
      alert("Nama dan tanggal lahir wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      // Panggil API Backend (Golang) untuk menyimpan nama dan birth_date
      await updateProfile(
        email, 
        form.name, 
        localStorage.getItem("avatar_url") || "", 
        form.birth_date
      );
      
      // Simpan nickname di localstorage
      localStorage.setItem("nickname", form.name);
      
      // Lanjut ke hasil atau dashboard
      const pendingAnswersRaw = localStorage.getItem("pending_answers");
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      
      if (pendingAnswersRaw || redirectAfterLogin) {
        if (redirectAfterLogin) localStorage.removeItem("redirectAfterLogin");
        navigate("/hasil");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan biodata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">
        {/* KIRI: ILUSTRASI (Persis kayak Login) */}
        <div className="card-left">
          <img src={logoLeft} alt="Vimind Illustration" />
        </div>

        {/* KANAN: FORM BIODATA */}
        <div className="card-right">
          <img src={logoTop} alt="logo" className="login-top-logo" style={{ marginTop: "20px" }} />
          
          <h2 style={{ textAlign: "center", marginTop: "10px", marginBottom: "5px", color: "#fff" }}>Lengkapi Biodata</h2>
          <p className="subtitle center-text" style={{ marginBottom: "30px" }}>
            Halo! Sebelum lanjut masuk, lengkapi datamu dulu ya.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div style={{ textAlign: "left", width: "100%", marginBottom: "5px", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Nama Lengkap / Panggilan
            </div>
            <input
              name="name"
              type="text"
              placeholder="Masukkan nama"
              className="input-field"
              value={form.name}
              onChange={handleChange}
            />

            <div style={{ textAlign: "left", width: "100%", marginTop: "15px", marginBottom: "5px", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Tanggal Lahir
            </div>
            <input
              name="birth_date"
              type="date"
              className="input-field"
              value={form.birth_date}
              onChange={handleChange}
              style={{ colorScheme: "dark" }} // Supaya date picker cocok sama tema gelap Vimind
            />

            <button type="submit" className="primary-btn full" disabled={loading} style={{ marginTop: "30px" }}>
              {loading ? "Menyimpan..." : "Simpan & Lanjutkan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LengkapiBiodata;
