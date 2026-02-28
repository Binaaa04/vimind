import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Detection() {
  const navigate = useNavigate();
  const location = useLocation(); // ← TAMBAH INI

  const questions = [
    "Apakah anda sering merasa sedih,kosong dan putus asa",
    "Apakah anda kehilangan minat pada sesuatu yang biasanya menyenangkan",
    "Apakah anda merasa tidaka berharga atau meras bersalah berlebihan"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  const nextQuestion = () => {
    if (selected === null) return;

    setSelected(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // ← TERUSKAN STATE KE POINT B
      navigate("/deteksi/b", {
        state: location.state
      });
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="question-page">

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

      <div className="logo-bottom">Vimind</div>

    </div>
  );
}