export default function SummaryModal({ onClose }) {
  return (
    <div className="modal-overlay">

      <div className="summary-container">

        {/* LEFT CARD */}
        <div className="summary-card large">

          <div className="card-header">
            <h3>Kondisi Mental Kamu Bulan ini</h3>
            <button className="export-btn">Export</button>
          </div>

          <div className="chart-box">
            <svg viewBox="0 0 300 150" className="chart-svg">
              <polyline
                fill="none"
                stroke="#4dd0c8"
                strokeWidth="3"
                points="0,130 30,120 60,100 90,70 120,80 150,75 180,60 210,40 240,50 270,35 300,30"
              />
            </svg>
          </div>

        </div>


        {/* RIGHT CARD */}
        <div className="summary-card small">

          <h3>Kondisi Mental Kamu</h3>

          <div className="gauge">
            <div className="gauge-fill"></div>

            <div className="gauge-center">
              <h2>66% 😕</h2>
              <p>Anda Terdeteksi</p>
              <h4>Depresi Ringan</h4>
              <small>
                Silahkan segera hubungi psikolog untuk konsultasi
              </small>
            </div>
          </div>

        </div>

        {/* TOMBOL TUTUP PINDAH KE DALAM */}
        <div className="summary-footer">
          <button onClick={onClose}>Tutup</button>
        </div>

      </div>

    </div>
  );
}