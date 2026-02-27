import { useNavigate } from "react-router-dom";
import "../App.css";

const ResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay">
      <div className="reset-card">

        <div className="check-icon">✓</div>

        <h2>Selamat !</h2>

        <p>
          Password berhasil direset mari coba cek kesehatan mental kamu
        </p>

        <button
          className="primary-btn modal-btn"
          onClick={() => navigate("/login")}
        >
          Masuk
        </button>

      </div>
    </div>
  );
};

export default ResetSuccess;