import { useNavigate, useLocation } from "react-router-dom";

export default function Finish() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="question-page">

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "100%" }}></div>
      </div>

      <div className="question-container">
        <h1>Selesaii !!!</h1>

        <p style={{ marginTop: "10px", color: "#7a5cff" }}>
          Mari kita cek hasil tes kamu
        </p>

        <button
          className="next-btn"
          style={{ marginTop: "30px" }}
          onClick={() => navigate("/hasil", { state: location.state })}
        >
          Lanjutkan
        </button>
      </div>

      <div className="logo-bottom">Vimind</div>

    </div>
  );
}
/*FINISH*/