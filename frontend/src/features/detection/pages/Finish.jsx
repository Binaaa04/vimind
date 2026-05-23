import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import "./Finish.css";

export default function Finish() {
  useEffect(() => {
    document.title = "Selesai | Vimind";
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="finish-page">
      <div className="finish-card">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={44} strokeWidth={1.8} />
        </div>

        <h1>Tes Selesai!</h1>

        <p>
          Jawaban Anda telah disimpan secara aman. Mari kita lihat rangkuman analisis kondisi psikologis Anda.
        </p>

        <button
          className="finish-btn"
          onClick={() => navigate("/hasil", { state: location.state })}
        >
          Lanjutkan ke Hasil <ArrowRight size={18} />
        </button>
      </div>

      <div className="finish-logo">Vimind</div>
    </div>
  );
}
