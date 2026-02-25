import { useNavigate } from "react-router-dom";

export default function DetectionBIntro() {
  const navigate = useNavigate();

  return (
    <div className="question-page">

      <div className="progress-bar">
        <div className="progress-fill" style={{width:"60%"}}></div>
      </div>

      <div className="question-container">
        <h1>DETEKSI DEPRESI</h1>
        <p style={{marginTop:"10px"}}>B. Fisik dan Energi</p>

        <button
          className="next-btn"
          style={{marginTop:"40px"}}
          onClick={() => navigate("/deteksi/b/soal")}
        >
          Mulai
        </button>
      </div>

      <div className="logo-bottom">Vimind</div>

    </div>
  );
}