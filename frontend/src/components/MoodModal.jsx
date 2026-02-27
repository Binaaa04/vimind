import React from "react";

const MoodModal = ({ onClose }) => {
  const moods = ["😭", "☹️", "😐", "🙂", "😁"];

  const handleSelect = (mood) => {
    console.log("Mood:", mood);
    if (onClose) onClose();
  };

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const stopClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div className="mood-card" onClick={stopClick}>

        <h2>Bagaimana Perasaanmu Hari ini ?</h2>

        <div className="emoji-row">
          {moods.map((mood, i) => (
            <span
              key={i}
              className="emoji"
              onClick={() => handleSelect(mood)}
            >
              {mood}
            </span>
          ))}
        </div>

        <p className="skip" onClick={handleOverlayClick}>
          Lewati
        </p>

      </div>
    </div>
  );
};

export default MoodModal;