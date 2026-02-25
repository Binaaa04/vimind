import { useNavigate } from "react-router-dom";

export default function DetectionIntro() {
  const navigate = useNavigate();

  return (
    <div className="question-page">

      <div className="progress-bar">
        <div className="progress-fill" style={{width:"20%"}}></div>
      </div>

      <div className="question-container">
        <h1>DETEKSI DEPRESI</h1>
        <p style={{marginTop:"10px"}}>A. Mood dan Emosi</p>

        <button 
          className="next-btn"
          style={{marginTop:"40px"}}
          onClick={() => navigate("/deteksi/soal")}
        >
          Mulai
        </button>
      </div>

    </div>
  );
}