import "./LogoutModal.css";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-overlay" onClick={onClose}>
      <div
        className="logout-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logout-warning-icon">!</div>

        <h2>Peringatan!</h2>

        <p>Apakah anda yakin ingin keluar?</p>

        <div className="logout-actions">
          <button className="logout-yes-btn" onClick={onConfirm}>
            Iya
          </button>

          <button className="logout-no-btn" onClick={onClose}>
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;