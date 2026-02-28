const moodData = {
  "😭": { percent: 20, text:"Sedih", msg:"Kamu lagi kurang baik. Jangan dipendam ya." },
  "☹️": { percent: 40, text:"Murung", msg:"Coba lakukan hal yang kamu suka." },
  "😐": { percent: 55, text:"Biasa", msg:"Mood kamu stabil hari ini." },
  "🙂": { percent: 75, text:"Baik", msg:"Pertahankan energi positifmu!" },
  "😁": { percent: 95, text:"Bahagia", msg:"Kamu lagi happy banget hari ini!" }
};

export default function MoodResultModal({ mood, onClose }) {
  const data = moodData[mood] || moodData["😐"];

  return (
    <div className="modal-overlay">

      <div className="result-wrapper">

        <div className="result-card">

          <h2>Rangkuman Mood Kamu</h2>

          {/* GAUGE */}
          <div className="gauge">
            <div 
              className="gauge-fill"
              style={{width:`${data.percent}%`}}
            />
          </div>

          <h1>{data.percent}% {mood}</h1>
          <p>Anda Terdeteksi <b>{data.text}</b></p>

          <span>{data.msg}</span>

        </div>

        <button className="close-btn" onClick={onClose}>
          Tutup
        </button>

      </div>
    </div>
  );
}