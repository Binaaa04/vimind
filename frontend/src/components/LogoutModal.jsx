import React, { useState, useEffect } from "react";
import "../css/LogoutCSS.css";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Reset status closing setiap kali pop-up dibuka kembali
  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  // Fungsi untuk menjalankan animasi dulu, baru menutup modal
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); 
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`logout-overlay ${isClosing ? "fade-out" : "fade-in"}`} 
      onClick={handleClose}
    >
      <div
        className={`logout-modal ${isClosing ? "animate-pop-out" : "animate-pop"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logout-warning-icon">!</div>

        <h2>Peringatan!</h2>

        <p>Apakah anda yakin ingin keluar?</p>

        <div className="logout-actions">
          <button className="logout-yes-btn" onClick={onConfirm}>
            Iya
          </button>

          <button className="logout-no-btn" onClick={handleClose}>
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;