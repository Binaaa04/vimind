import React from "react";
import "../css/DashboardCSS.css"; // We can reuse basic styles if any or fallback to standard CSS

const TestOptionsModal = ({ onResume, onNewTest, onClose }) => {
  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="mood-card" style={cardStyle}>
        <h2 style={{ fontSize: "1.3rem", color: "#5B4A78", marginBottom: "15px" }}>Pilih Jenis Evaluasi</h2>
        <p style={{ color: "#8C8C8C", fontSize: "0.9rem", marginBottom: "25px", lineHeight: "1.4" }}>
          Apakah Anda ingin memantau keluhan sebelumnya atau memulai evaluasi baru secara keseluruhan?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button style={primaryBtnStyle} onClick={onResume}>
            Lanjutkan Kondisi Sebelumnya
          </button>
          <button style={secondaryBtnStyle} onClick={onNewTest}>
            Mulai Deteksi Penyakit Baru
          </button>
        </div>

        <p className="skip" style={skipStyle} onClick={onClose}>
          Batal
        </p>
      </div>
    </div>
  );
};

// Inline styles fallback to ensure it looks good if classes are missing
const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 9999,
};

const cardStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "400px",
  textAlign: "center",
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
};

const primaryBtnStyle = {
  backgroundColor: "#8B5CF6",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s",
};

const secondaryBtnStyle = {
  backgroundColor: "#F1F5F9",
  color: "#5B4A78",
  border: "1px solid #E2E8F0",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s",
};

const skipStyle = {
  marginTop: "20px",
  color: "#94A3B8",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600",
};

export default TestOptionsModal;
