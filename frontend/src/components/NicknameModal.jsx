import { useEffect, useState } from "react";
import "./NicknameModal.css";

const NicknameModal = ({ isOpen, onClose, onSave }) => {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNickname(localStorage.getItem("nickname") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nickname);
    onClose();
  };

  return (
    <div className="nickname-overlay" onClick={onClose}>
      <div
        className="nickname-modal"
        onClick={(e) => e.stopPropagation()}
      >
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
  );
};

export default NicknameModal;