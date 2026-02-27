import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import "../App.css";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000); // 3 detik

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* LEFT */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT */}
        <div className="card-right success-content">

          <img src={logo} alt="logo" className="success-logo" />

          <h1 className="success-heading">
            Selamat,<br/>
            email berhasil<br/>
            dibuat
          </h1>

          <button
            className="primary-btn success-btn"
            onClick={() => navigate("/login")}
          >
            Kembali ke Login
          </button>

        </div>
      </div>
    </div>
  );
};

export default Success;