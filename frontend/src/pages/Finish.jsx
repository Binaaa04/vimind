import { useNavigate, useLocation } from "react-router-dom";

export default function Finish() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromDashboard = location.state?.from === "dashboard";

  const handleNext = () => {
    const from = localStorage.getItem("quizFrom");

    if (from === "dashboard") {
      navigate("/dashboard");
    } else {
      navigate("/hasil");
    }

    localStorage.removeItem("quizFrom");
  };

  console.log("STATE DI FINISH:", location.state);

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
          onClick={handleNext}
        >
          Lanjutkan
        </button>
      </div>

      <div className="logo-bottom">Vimind</div>

    </div>
  );
}