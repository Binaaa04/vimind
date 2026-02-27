import { useNavigate } from "react-router-dom";
import "../App.css";

const ResetSent = () => {
    const navigate = useNavigate();

    return (
        <div className="modal-overlay">
            <div className="reset-card">

                <div className="check-icon">✓</div>

                <h2>Link Berhasil Dikirim</h2>

                <p>
                    Mari cek emailmu dan mari buat ulang passwordmu
                </p>

                <button
                    className="primary-btn modal-btn"
                    onClick={() => navigate("/reset-password")}
                >
                    Buat Password Baru
                </button>

            </div>
        </div>
    );
};

export default ResetSent;