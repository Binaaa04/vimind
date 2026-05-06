import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getHistory } from "../services/api";
import logo from '../assets/logovimind2.png';
import "../css/SummaryModalCSS.css";

export default function SummaryModal({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
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

  // Chart: history is DESC, reverse for chronological order
  const chartData = [...history].reverse();

  // SVG dimensions
  const W = 340;
  const H = 160;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const points = chartData.map((item, index) => {
    const x = padL + (chartData.length <= 1 ? chartW / 2 : (index / (chartData.length - 1)) * chartW);
    const y = padT + chartH - (item.percentage / 100) * chartH;
    return { x, y, item };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  // Y-axis grid lines
  const yLines = [0, 25, 50, 75, 100];

  // Format date: "08 Apr, 14:30"
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { 
      day: "2-digit", 
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Level badge color
  const levelColor = (level) => {
    if (!level) return "#8B5CF6";
    const l = level.toLowerCase();
    if (l.includes("tinggi") || l.includes("high")) return "#EF4444";
    if (l.includes("sedang") || l.includes("moderate")) return "#F59E0B";
    return "#10B981";
  };

  const handleGoToDetail = () => {
    onClose();
    navigate("/hasil");
  };

  // ============ EXPORT TO PRINT (rapi) ============
  const handleExport = () => {
    const printWindow = window.open("", "_blank", "width=800,height=700");
    if (!printWindow) {
      alert("Please allow popups to export the report.");
      return;
    }

    const tableRows = history.length > 0 ? history.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9f5ff' : '#ffffff'}">
        <td style="padding:10px 14px;">${i + 1}</td>
        <td style="padding:10px 14px; font-weight:600;">${item.disease}</td>
        <td style="padding:10px 14px;">
          <span style="
            display:inline-block;
            padding:3px 10px;
            border-radius:20px;
            font-size:12px;
            font-weight:600;
            background:${levelColor(item.level)}22;
            color:${levelColor(item.level)};
            border:1px solid ${levelColor(item.level)}55;
          ">${item.level}</span>
        </td>
        <td style="padding:10px 14px; font-weight:700; color:#7C3AED;">${Math.round(item.percentage)}%</td>
        <td style="padding:10px 14px; color:#64748B;">${formatDateLong(item.date)}</td>
      </tr>
    `).join("") : '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94A3B8;">Belum ada data tes.</td></tr>';

    const nowStr = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Laporan Progress ViMind — ${userName}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1e1b4b; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 900; color: #7C3AED; letter-spacing: -1px; }
          .logo span { color: #C4B5FD; }
          .meta { text-align: right; font-size: 12px; color: #94A3B8; }
          .meta p { margin: 2px 0; }
          h2 { font-size: 18px; font-weight: 700; color: #1E1B4B; margin-bottom: 6px; }
          .summary-box { display: flex; gap: 16px; margin-bottom: 30px; }
          .stat-card { flex: 1; background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px; padding: 16px; text-align: center; }
          .stat-card .val { font-size: 26px; font-weight: 800; color: #7C3AED; }
          .stat-card .lbl { font-size: 11px; color: #94A3B8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
          table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; }
          thead { background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; }
          thead th { padding: 12px 14px; text-align: left; font-size: 13px; font-weight: 600; }
          tbody tr { border-bottom: 1px solid #EDE9FE; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #EDE9FE; font-size: 11px; color: #94A3B8; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        return (
  <div className="header">
    <img src={logo} alt="Logo Vimind" />
    <div className="meta">
      <p><strong>Laporan Progress Kesehatan Mental</strong></p>
      <p>Nama: <strong>{userName}</strong></p>
      <p>Dicetak: {nowStr}</p>
    </div>
  </div>
);
        <div class="summary-box">
          <div class="stat-card">
            <div class="val">${history.length}</div>
            <div class="lbl">Total Tes</div>
          </div>
          <div class="stat-card">
            <div class="val" style="color:${levelColor(latest?.level)}">${latest?.disease || "—"}</div>
            <div class="lbl">Kondisi Terakhir</div>
          </div>
          <div class="stat-card">
            <div class="val">${latest ? Math.round(latest.percentage) + "%" : "—"}</div>
            <div class="lbl">Tingkat Terakhir</div>
          </div>
          <div class="stat-card">
            <div class="val">${latest ? formatDate(latest.date) : "—"}</div>
            <div class="lbl">Tanggal Tes Terakhir</div>
          </div>
        </div>
        <h2>Riwayat Tes</h2>
        <p style="font-size:12px;color:#94A3B8;margin-bottom:16px;">Hasil tes terakhir yang tercatat dalam sistem.</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Penyakit Terdeteksi</th>
              <th>Tingkat</th>
              <th>Persentase</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <p>Dokumen ini digenerate otomatis oleh ViMind — Platform Kesehatan Mental.</p>
          <p>Hasil ini bukan merupakan diagnosis medis resmi. Konsultasikan dengan profesional kesehatan mental untuk penanganan lebih lanjut.</p>
        </div>
      </body>
      </html>
    `); 
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay">
      <div className="sm-card">
        {/* HEADER */}
        <div className="sm-header">
          <div className="sm-title">
            📊 Rangkuman Progress
            <p>Pantau perkembangan kesehatan mental kamu</p>
          </div>
          <button className="sm-export-btn" onClick={handleExport}>Ekspor Laporan</button>
        </div>

        {/* BODY */}
        <div className="sm-body">
          <div className="summary-gauge-container" style={{ touchAction: "pan-y" }}>
            <div className="sm-chart-label">Kondisi Terakhir Anda</div>
            {/* 1. GAUGE GRAFIK */}
            <div
              className="gauge-graphic"
              style={{
                background: `conic-gradient(from 270deg at 50% 100%, 
                  #9061f9 0deg, 
                  #9061f9 ${(latest?.percentage || 0) * 1.8}deg, 
                  #cbd5e0 ${(latest?.percentage || 0) * 1.8}deg, 
                  #cbd5e0 180deg
                )`
              }}
            ></div>

            {/* 2. CHART GRAFIK */}
            <div className="gauge-text">
              <div className="sm-chart-label" style={{ marginTop: '10px', borderTop: '1px solid #edf2f7', paddingTop: '15px', width: '100%' }}>
                Tren Perkembangan
              </div>
              {loading ? (
                <p className="sm-empty-msg">Memuat data...</p>
              ) : chartData.length < 2 ? (
                <p className="sm-empty-msg">
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📈</span>
                  Butuh minimal 2 data tes untuk melihat grafik perkembangan.
                </p>
              ) : (
                <svg viewBox={`0 0 ${W} ${H}`} className="sm-svg" preserveAspectRatio="xMidYMid meet">
                  {/* Y grid lines */}
                  {yLines.map(val => {
                    const y = padT + chartH - (val / 100) * chartH;
                    return (
                      <g key={val}>
                        <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4,3" />
                        <text x={padL - 6} y={y + 4} fontSize="9" fill="#94A3B8" textAnchor="end">{val}%</text>
                      </g>
                    );
                  })}

                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${points[0].x},${padT + chartH} ${polylinePoints} ${points[points.length - 1].x},${padT + chartH}`}
                    fill="url(#chartGrad)"
                  />

                  {/* Line */}
                  <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={polylinePoints} />

                  {/* Data points */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="white" stroke="#8B5CF6" strokeWidth="2.5" />
                  ))}

                  {/* X-axis date labels */}
                  {points.map((p, i) => {
                    const step = Math.ceil(points.length / 5);
                    if (i % step !== 0 && i !== points.length - 1) return null;
                    return (
                      <text key={i} x={p.x} y={H - 6} fontSize="9" fill="#64748B" textAnchor="middle">
                        {formatDate(p.item.date)}
                      </text>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          {/* HISTORY LIST */}
          <div className="sm-history-list">
            <h4>Riwayat Lengkap</h4>
            {loading ? ( 
              <p className="sm-empty-msg">Sedang mengambil riwayat...</p>
            ) : history.length === 0 ? (
              <div className="sm-empty-container">
                <p className="sm-empty-msg">Belum ada riwayat tes.</p>
                <button className="sm-mulai-btn" onClick={handleGoToDetail}>Mulai Tes Sekarang</button>
              </div>
            ) : (
              history.map((item, idx) => (
                <div key={idx} className="sm-history-item">
                  <div className="item-info">
                    <div className="item-disease">{item.disease}</div>
                    <div className="item-date">{formatDate(item.date)}</div>
                  </div>
                  <div className="item-results">
                    <div className="item-level" style={{ 
                      backgroundColor: `${levelColor(item.level)}15`, 
                      color: levelColor(item.level),
                      border: `1px solid ${levelColor(item.level)}40`
                    }}>
                      {item.level}
                    </div>
                    <div className="item-percentage">{Math.round(item.percentage)}%</div>
                    <button 
                      className="item-detail-btn" 
                      onClick={() => navigate("/hasil", { state: { ...item } })}
                      title="Lihat Detail & Rekomendasi"
                    >
                      👁️ Lihat Detail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="sm-footer">
          <button className="sm-tutup-btn" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
