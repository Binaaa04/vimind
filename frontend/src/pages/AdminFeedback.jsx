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

  if (loading) return <p className="feedback-loading">Memuat data feedback...</p>;

  return (
    <>
      <h1>User Feedbacks</h1>
      
      <div className="feedback-tabs">
        <button 
          onClick={() => setActiveTab("testimonials")}
          className={`feedback-tab-btn tab-primary ${activeTab === "testimonials" ? "active" : ""}`}
        >
          Testimoni (Kuis)
        </button>
        <button 
          onClick={() => setActiveTab("account")}
          className={`feedback-tab-btn tab-danger ${activeTab === "account" ? "active" : ""}`}
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
                  <td className="star-container">{"★".repeat(t.rating)}</td>
                  <td>
                    <strong>{t.name}</strong><br/>
                    <span className="feedback-text-muted">{t.email}</span>
                  </td>
                  <td className="td-review">{t.comment}</td>
                  <td>
                    <div 
                      className={`toggle-switch ${t.is_displayed ? "active" : ""}`}
                      onClick={() => toggleDisplay(t.id, t.is_displayed)}
                      title={t.is_displayed ? "Ditampilkan" : "Disembunyikan"}
                    >
                      <div className="toggle-circle" />
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr><td colSpan="4" className="td-center">Belum ada testimoni.</td></tr>
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
                  <td className="td-nowrap">{f.created_at}</td>
                  <td>{f.email}</td>
                  <td className="td-reason">"{f.reason}"</td>
                </tr>
              ))}
              {accountFeedbacks.length === 0 && (
                <tr><td colSpan="3" className="td-center">Belum ada data history hapus akun.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminFeedback;