import React from "react";
import "./TestOptionsModal.css";

const TestOptionsModal = ({ onResume, onNewTest, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="mood-card">
        <h2 className="mood-card-title">Pilih Jenis Evaluasi</h2>
        <p className="mood-card-desc">
          Apakah Anda ingin memantau keluhan sebelumnya atau memulai evaluasi baru secara keseluruhan?
        </p>

        <div className="mood-card-actions">
          <button className="btn-primary-box" onClick={onResume}>
            Lanjutkan Kondisi Sebelumnya
          </button>
          
          <button className="btn-secondary-box" onClick={onNewTest}>
            Mulai Deteksi Penyakit Baru
          </button>
        </div>

        <p className="skip-btn" onClick={onClose}>
          Batal
        </p>
      </div>
    </div>
  );
};

export default TestOptionsModal;