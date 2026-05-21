import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import "@/css/DetectionIntroCSS.css";

export default function DetectionIntro() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    document.title = "Tes Gejala | Vimind";

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    checkSession();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="question-page">

      {/* Tombol Back ke Dashboard */}
      <button
        className="back-btn"
        onClick={() => navigate(hasSession ? "/dashboard" : "/")}
      >
        Keluar
      </button>

      {/* Progress Bar di bagian atas */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "20%" }}></div>
      </div>

      <div className="question-container">
        <h1>EVALUASI KESEHATAN MENTAL</h1> 
        <p>A. Mood dan Emosi</p>

        <button
          className="next-btn"
          onClick={() =>
            navigate("/deteksi/soal", {
              state: location.state,
            })
          }
        >
          Mulai
        </button>
      </div>

    </div>
  );
}
