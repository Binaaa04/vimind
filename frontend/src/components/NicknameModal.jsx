import { useEffect, useState } from "react";
import "../css/NicknameCSS.css";
import confetti from "canvas-confetti";

const NicknameModal = ({ isOpen, onClose, onSave }) => {
  const [nickname, setNickname] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNickname(localStorage.getItem("nickname") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nickname.trim()) return;

    onSave(nickname);

    setShowSuccess(true);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handleContinue = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      {!showSuccess && (
        <div className="nickname-overlay">
          <div className="nickname-modal">
            <h2>
              Ubah Nama Pengguna
              <br />
              kamu
            </h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="nickname">Masukan Nickname</label>

              <input
                id="nickname"
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />

              <button type="submit">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal animate-pop">
            <div className="success-icon">✓</div>

            <h2>Berhasil!</h2>

            <p>Nickname berhasil diperbarui</p>

            <button onClick={handleContinue}>Lanjutkan</button>
          </div>
        </div>
      )}
    </>
  );
};

export default NicknameModal;