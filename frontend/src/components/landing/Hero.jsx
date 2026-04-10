import { useNavigate } from "react-router-dom";
import logo from "../../assets/react.svg";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="circle top"></div>
      <div className="circle bottom"></div>

      <div className="hero-content">
        <div className="logo">
          <img src={logo}/>
          <h2>Vimind</h2>
        </div>

        <h1>SELAMAT DATANG!</h1>

        <p>
          Bersama <span>Vimind</span> mari ketahui gejala kesehatan mental kamu
        </p>

        <button onClick={() => navigate("/login")}>
          Mulai Tes
        </button>
      </div>
    </section>
  );
}