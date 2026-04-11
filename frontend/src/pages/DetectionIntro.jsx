import { useNavigate, useLocation } from "react-router-dom";

export default function DetectionIntro() {
  const navigate = useNavigate();
  const location = useLocation(); // ← ambil state asal halaman

  return (
    <div className="question-page">

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "20%" }}></div>
      </div>

      <div className="question-container">
        <h1>EVALUASI KESEHATAN MENTAL</h1>
        <p style={{ marginTop: "10px" }}>A. Mood dan Emosi</p>

        <button
          className="next-btn"
          style={{ marginTop: "40px" }}
          onClick={() =>
            navigate("/deteksi/soal", {
              state: location.state, // ← TERUSKAN STATE
            })
          }
        >
          Mulai
        </button>
      </div>

    </div>
  );
}