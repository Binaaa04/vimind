import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { getHistory } from "../services/api";

export default function SummaryModal({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const response = await getHistory(session.user.email);
          setHistory(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const latest = history.length > 0 ? history[0] : null;

  // Generate chart points (simple linear scaling)
  // History is DESC, so reverse for chronological chart
  const chartData = [...history].reverse();
  const points = chartData.map((item, index) => {
    const x = (index / (Math.max(1, chartData.length - 1))) * 300;
    const y = 130 - (item.percentage / 100) * 100; // Scale y
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="modal-overlay">
      <div className="summary-container">

        {/* LEFT CARD: TREND */}
        <div className="summary-card large">
          <div className="card-header">
            <h3>Perkembangan Kondisi Mental</h3>
            <button className="export-btn" onClick={() => window.print()}>Export</button>
          </div>

          <div className="chart-box">
            {history.length > 1 ? (
              <svg viewBox="0 0 300 150" className="chart-svg">
                <polyline
                  fill="none"
                  stroke="#4dd0c8"
                  strokeWidth="3"
                  points={points}
                />
              </svg>
            ) : (
              <p style={{ textAlign: "center", color: "#999", marginTop: "40px" }}>
                Butuh lebih dari 1 data untuk melihat chart perkembangan.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT CARD: LATEST */}
        <div className="summary-card small">
          <h3 className="center">Kondisi Terakhir</h3>

          <div className="summary-gauge">
            <div className="summary-gauge-fill" style={{ height: `${latest?.percentage || 0}%` }}></div>

            <div className="gauge-center">
              {loading ? (
                <p>Memuat...</p>
              ) : latest ? (
                <>
                  <h2>{Math.round(latest.percentage)}%</h2>
                  <p>Anda Terdeteksi</p>
                  <h4>{latest.disease}</h4>
                  <small>({latest.level})</small>
                </>
              ) : (
                <>
                  <h2>--%</h2>
                  <p>Belum ada data</p>
                  <small>Silahkan lakukan deteksi terlebih dahulu</small>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="summary-footer">
          <button onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
/*SUMMARY*/