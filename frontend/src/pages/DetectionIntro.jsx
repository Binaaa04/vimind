import { useNavigate, useLocation } from "react-router-dom";
import "../css/DetectionIntroCSS.css"; 

export default function DetectionIntro() {
  const navigate = useNavigate();
  const location = useLocation(); 

  return (
    <div className="question-page">
        
      {/* Tombol Back ke Dashboard */}
      <button 
        className="back-btn" 
        onClick={() => navigate("/dashboard")}
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