import "./NicknameSuccessModal.css";

const NicknameSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="success-overlay" onClick={onClose}>
      <div
        className="success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-icon">✓</div>

        <h2>Selamat !</h2>

        <p>Nama Pengguna baru berhasil disimpan</p>

        <button onClick={onClose}>Lanjutkan</button>
      </div>
    </div>
  );
};

export default NicknameSuccessModal;