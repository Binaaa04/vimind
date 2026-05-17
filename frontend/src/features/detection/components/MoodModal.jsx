import "@/css/MoodModalCSS.css";

const MoodModal = ({ onSelect, onClose }) => {
  const moods = ["😭", "☹️", "😐", "🙂", "😁"];

  const handleSelect = (mood) => {
    localStorage.setItem("mood", mood);
    // Simpan tanggal hari ini agar modal tidak muncul lagi hari ini
    localStorage.setItem("mood_date", new Date().toDateString());
    onSelect?.(mood);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="mood-card">
        <h2>Bagaimana Perasaanmu Hari ini ?</h2>

        <div className="emoji-row">
          {moods.map((mood,i)=>(
            <span
              key={i}
              className="emoji"
              onClick={()=>handleSelect(mood)}
            >
              {mood}
            </span>
          ))}
        </div>

        {/* FIX UX #1: Lewati juga simpan tanggal agar modal tidak muncul lagi hari ini */}
        <p className="skip" onClick={() => {
          localStorage.setItem("mood_date", new Date().toDateString());
          onClose();
        }}>Lewati</p>
      </div>
    </div>
  );
};

export default MoodModal;
