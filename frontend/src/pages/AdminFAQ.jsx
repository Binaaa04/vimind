import { useState, useEffect } from "react";
import { adminGetFAQ, adminUpsertFAQ, adminDeleteFAQ } from "../services/api";
import "../css/AdminDashboard.css";

const AdminFAQ = ({ adminEmail }) => {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);

  // Load existing FAQ dari API
  const fetchFAQ = async () => {
    if (adminEmail) {
      try {
        const res = await adminGetFAQ(adminEmail);
        setFaq(res.data || []);
      } catch (err) {
        console.error("Gagal ambil FAQ", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFAQ();
  }, [adminEmail]);

  const handleChange = (index, field, value) => {
    const updated = [...faq];
    updated[index][field] = value;
    setFaq(updated);
  };

  const handleAddNew = () => {
    setFaq([...faq, { id: "", question: "", answer: "" }]);
  };

  const handleDelete = async (index) => {
    const item = faq[index];
    if (!item.id) {
      // Belum simpan ke DB, cuma hapus dari state
      setFaq(faq.filter((_, i) => i !== index));
      return;
    }

    if (!window.confirm("Yakin ingin menghapus pertanyaan ini?")) return;

    try {
      await adminDeleteFAQ(adminEmail, item.id);
      setFaq(faq.filter((_, i) => i !== index));
      alert("Pertanyaan berhasil dihapus!");
    } catch (err) {
      alert("Gagal menghapus FAQ.");
    }
  };

  const handleSubmit = async (index) => {
    if (!adminEmail) return;
    const item = faq[index];
    if (!item.question.trim() || !item.answer.trim()) {
      alert("Pertanyaan dan jawaban wajib diisi!");
      return;
    }
    setSavingIndex(index);
    try {
      await adminUpsertFAQ(adminEmail, {
        id: item.id,
        question: item.question,
        answer: item.answer,
      });
      // Refresh to get actual UUID if it was new
      await fetchFAQ();
      alert(`✔ Berhasil disimpan!`);
    } catch (err) {
      const serverErr = err.response?.data?.error || err.message;
      alert(`Gagal menyimpan FAQ. Coba lagi.\nAlasan: ${serverErr}`);
    } finally {
      setSavingIndex(null);
    }
  };

  if (loading) return <p style={{ color: "#aaa", padding: 20 }}>Memuat data FAQ...</p>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Custom FAQ</h1>
        <button 
          onClick={handleAddNew}
          style={{ background: "#4caf50", color: "white", padding: "10px 15px", borderRadius: 8, cursor: "pointer" }}
        >
          + Tambah Pertanyaan
        </button>
      </div>

      {faq.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: 40 }}>Belum ada data FAQ. Klik tambah untuk membuat.</p>
      ) : (
        faq.map((item, index) => (
          <div key={index} className="faq-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Pertanyaan {index + 1}</h3>
              <button 
                onClick={() => handleDelete(index)}
                style={{ background: "transparent", border: "1px solid #ff4d4d", color: "#ff4d4d", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
              >
                Hapus
              </button>
            </div>

            <div className="faq-input-group">
              <input
                type="text"
                placeholder="Masukkan Pertanyaan"
                value={item.question}
                onChange={(e) => handleChange(index, "question", e.target.value)}
              />

              <textarea
                placeholder="Masukkan Jawaban"
                value={item.answer}
                onChange={(e) => handleChange(index, "answer", e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, background: "#fff", color: "#333", border: "1px solid #ccc", minHeight: 60, marginTop: 10, fontFamily: "inherit" }}
              />

              <button
                onClick={() => handleSubmit(index)}
                disabled={savingIndex === index}
                style={{ marginTop: 10 }}
              >
                {savingIndex === index ? "Menyimpan..." : "Submit"}
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default AdminFAQ;