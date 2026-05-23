import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "@/App.css";
import "./Login.css"; // Kita re-use styling dari Login Page
import { supabase } from "@/services/supabaseClient";
import { updateProfile, getProfile } from "@/features/auth/api";
import { diagnose } from "@/features/detection/api";

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

  const syncPendingAnswers = async (userEmail) => {
    const pendingAnswersRaw = sessionStorage.getItem("pending_answers");
    if (pendingAnswersRaw) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const parsedAnswers = JSON.parse(pendingAnswersRaw);
        const config = session?.access_token ? {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        } : {};
        const diagRes = await diagnose(parsedAnswers, userEmail, 0, config);
        sessionStorage.setItem("latest_diagnosis", JSON.stringify(diagRes.data));
        sessionStorage.removeItem("pending_answers");
        console.log("Biodata: Successfully synced pending diagnosis to DB.");
      } catch (err) {
        console.error("Biodata: Failed to sync pending diagnosis:", err);
      }
    }
  };

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
            await syncPendingAnswers(session.user.email);
            const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
            if (redirectAfterLogin) {
              localStorage.removeItem("redirectAfterLogin");
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
      
      // Sinkronkan kuis pending ke database setelah profil terdaftar
      await syncPendingAnswers(email);
      
      // Lanjut ke hasil atau dashboard
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      
      if (redirectAfterLogin) {
        localStorage.removeItem("redirectAfterLogin");
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
          
          <h2 style={{ textAlign: "center", marginTop: "10px", marginBottom: "5px", color: "#2b1b54" }}>Lengkapi Biodata</h2>
          <p className="subtitle center-text" style={{ marginBottom: "30px" }}>
            Halo! Sebelum lanjut masuk, lengkapi datamu dulu ya.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div style={{ textAlign: "left", width: "100%", marginBottom: "5px", color: "#5b4a78", fontSize: "14px", fontWeight: "600" }}>
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

            <div style={{ textAlign: "left", width: "100%", marginTop: "15px", marginBottom: "5px", color: "#5b4a78", fontSize: "14px", fontWeight: "600" }}>
              Tanggal Lahir
            </div>
            <input
              name="birth_date"
              type="date"
              className="input-field"
              value={form.birth_date}
              onChange={handleChange}
              style={{ colorScheme: "light" }}
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
