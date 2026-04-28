import { useNavigate } from "react-router-dom";
import { useEffect } from "react"; 
import { useState } from "react";
import "./Detection.css"; // Pastikan nama file CSS-mu sesuai

export default function Detection() {
    useEffect(() => {
      document.title = "Tes Gejala | Vimind";
    }, []);
  const navigate = useNavigate();
  const questions = [
    "Apakah anda merasa lelah hampir setiap hari",
    "Apakah pola tidur anda berubah setiap hari (insomnia atau tidur berlebihan)",
    "Apakah nafsu makan anda berubah signifikan"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  const nextQuestion = () => {
    if (selected === null) return;

    setSelected(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/selesai");
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="question-page">

      {/* TOMBOL KELUAR - KIRI ATAS */}
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Keluar
      </button>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="question-container">

        <h1>
          {currentIndex + 1}. {questions[currentIndex]}
        </h1>

        <div className="options-wrapper">

          <div className="label-left">Setuju</div>

          <div className="circles">
            <div
              className={`circle ${selected === 1 ? "active" : ""}`}
              onClick={() => setSelected(1)}
            ></div>
            <div
              className={`circle ${selected === 2 ? "active" : ""}`}
              onClick={() => setSelected(2)}
            ></div>
            <div
              className={`circle ${selected === 3 ? "active" : ""}`}
              onClick={() => setSelected(3)}
            ></div>
            <div
              className={`circle ${selected === 4 ? "active" : ""}`}
              onClick={() => setSelected(4)}
            ></div>
          </div>

          <div className="label-right">
            Tidak<br />Setuju
          </div>

        </div>

        <button 
          className="next-btn"
          onClick={nextQuestion}
          disabled={selected === null}
          style={{
            opacity: selected === null ? 0.5 : 1,
            cursor: selected === null ? "not-allowed" : "pointer"
          }}
        >
          Lanjutkan
        </button>

      </div>

      {/* Bagian ini sengaja saya hide dulu jika kamu tidak menggunakan gambar asli, 
          tapi tetap dipertahankan CSS-nya */}
      <div className="logo-bottom">Vimind</div>

    </div>
  );
} 