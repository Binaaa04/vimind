import { useNavigate } from "react-router-dom";
import logo from "../assets/logovimind2.png";
import "../css/LandingCSS.css";
import "../index.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <div className="landing">
        <div className="background-circle top"></div>
        <div className="background-circle bottom"></div>

        <div className="landing-content">
          <div className="logo">
            <img src={logo} alt="Vimind Logo" style={{ width: "300px" }} />
          </div>

          {/* BlurText dihapus, diganti dengan teks heading biasa */}
          <h1 className="welcome-title">SELAMAT DATANG!</h1>

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
    </>
  );
}
