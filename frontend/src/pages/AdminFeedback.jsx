import { useState, useEffect } from "react";
import { adminGetTestimonials, adminUpdateTestimonialDisplay, adminGetAccountFeedbacks } from "../services/api";
import "../css/AdminFeedback.css";

const AdminFeedback = ({ adminEmail }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [accountFeedbacks, setAccountFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("testimonials");

  useEffect(() => {
    if (adminEmail) {
      Promise.all([
        adminGetTestimonials(adminEmail).then((res) => setTestimonials(res.data || [])).catch(() => {}),
        adminGetAccountFeedbacks(adminEmail).then((res) => setAccountFeedbacks(res.data || [])).catch(() => {})
      ]).finally(() => setLoading(false));
    }
  }, [adminEmail]);

  const toggleDisplay = async (id, currentStatus) => {
    if (!adminEmail) return;
    try {
      await adminUpdateTestimonialDisplay(adminEmail, id, !currentStatus);
      setTestimonials((prev) => 
        prev.map(t => t.id === id ? { ...t, is_displayed: !currentStatus } : t)
      );
    } catch (err) {
      alert("Gagal mengupdate status testimoni");
    }
  };

  if (loading) return <p style={{ color: "#aaa", padding: 20 }}>Memuat data feedback...</p>;

  return (
    <>
      <h1>User Feedbacks</h1>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={() => setActiveTab("testimonials")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "8px", 
            border: "1px solid #8a5cff",
            background: activeTab === "testimonials" ? "#8a5cff" : "transparent",
            color: activeTab === "testimonials" ? "white" : "#8a5cff",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Testimoni (Kuis)
        </button>
        <button 
          onClick={() => setActiveTab("account")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "8px", 
            border: "1px solid #ef4444",
            background: activeTab === "account" ? "#ef4444" : "transparent",
            color: activeTab === "account" ? "white" : "#ef4444",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Alasan Hapus Akun
        </button>
      </div>

      {activeTab === "testimonials" && (
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Rating</th>
                <th>Nama / Email</th>
                <th>Komentar</th>
                <th>Tampilkan di Web</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td style={{ color: "#fbbf24", fontSize: "18px" }}>{"★".repeat(t.rating)}</td>
                  <td>
                    <strong>{t.name}</strong><br/>
                    <span style={{ fontSize: "12px", color: "#888" }}>{t.email}</span>
                  </td>
                  <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>{t.comment}</td>
                  <td>
                    <button 
                      onClick={() => toggleDisplay(t.id, t.is_displayed)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        border: "none",
                        background: t.is_displayed ? "#10b981" : "#ef4444",
                        color: "white",
                        cursor: "pointer"
                      }}
                    >
                      {t.is_displayed ? "Ditampilkan" : "Disembunyikan"}
                    </button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: "center" }}>Belum ada testimoni.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "account" && (
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Email Pengguna</th>
                <th>Alasan Dihapus</th>
              </tr>
            </thead>
            <tbody>
              {accountFeedbacks.map((f) => (
                <tr key={f.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{f.created_at}</td>
                  <td>{f.email}</td>
                  <td style={{ maxWidth: "400px", wordWrap: "break-word", color: "#ef4444" }}>"{f.reason}"</td>
                </tr>
              ))}
              {accountFeedbacks.length === 0 && (
                <tr><td colSpan="3" style={{ textAlign: "center" }}>Belum ada data history hapus akun.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminFeedback;
