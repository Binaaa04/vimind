const MoodModal = ({ onSelect, onClose }) => {
  const moods = ["😭", "☹️", "😐", "🙂", "😁"];

  const handleSelect = (mood) => {
    localStorage.setItem("mood", mood);
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

        <p className="skip" onClick={onClose}>Lewati</p>
      </div>
    </div>
  );
};

export default MoodModal;