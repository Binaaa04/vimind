import { useEffect, useState } from "react";
import "../css/NicknameCSS.css";
import confetti from "canvas-confetti";

const NicknameModal = ({ isOpen, onClose }) => {
  const [nickname, setNickname] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNickname(localStorage.getItem("nickname") || "");
      setShowSuccess(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setShowSuccess(true);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handleContinue = () => {
    setIsClosing(true);

    setTimeout(() => {
      setShowSuccess(false);
      setIsClosing(false);
      onClose();
    }, 300);
  };

  return (
    <>
      {!showSuccess && !isClosing && (
        <div className="nickname-overlay">
          <div className="nickname-modal">
            <h2>
              Ubah Nama Pengguna
              <br />
              kamu
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Masukan Nickname Kamu</label>

              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />

              <div className="nickname-button-group">
                <button type="submit" className="nickname-save-btn">
                  Simpan
                </button>

                <button
                  type="button"
                  className="nickname-back-btn"
                  onClick={onClose}
                >
                  Kembali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className={`success-overlay ${isClosing ? "fade-out" : "fade-in"}`}>
          <div className={`success-modal ${isClosing ? "animate-pop-out" : "animate-pop"}`}>
            <div className="success-icon">✓</div>
            <h2>Selamat !</h2>
            <p>Nama Pengguna baru berhasil disimpan</p>

            <button className="continue-btn" onClick={handleContinue}>
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NicknameModal;