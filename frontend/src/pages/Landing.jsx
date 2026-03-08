import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logovimind2.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="background-circle top"></div>
      <div className="background-circle bottom"></div>

      <div className="landing-content">
        <div className="logo">
          <img src={logo} alt="Vimind Logo" />
        </div>

        <h1>SELAMAT DATANG!</h1>

        <p>
          Bersama <span>Vimind</span> mari ketahui gejala kesehatan mental kamu
        </p>

        <button
          onClick={() => {
            localStorage.setItem("quizFrom", "landing");
            navigate("/deteksi");
          }}
        >
          Mulai Tes
        </button>
      </div>
    </div>
  );
}