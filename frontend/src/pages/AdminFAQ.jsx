import { useState, useEffect } from "react";
import { adminGetFAQ, adminUpsertFAQ, adminDeleteFAQ } from "../services/api";
import "../css/adminFAQ.css";

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

  if (loading) return <p className="faq-loading">Memuat data FAQ...</p>;

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Custom FAQ</h1>
        <button className="faq-add-btn" onClick={handleAddNew}>
          + Tambah Pertanyaan
        </button>
      </div>

      {faq.length === 0 ? (
        <p className="faq-empty">Belum ada data FAQ. Klik tambah untuk membuat.</p>
      ) : (
        faq.map((item, index) => (
          <div key={index} className="faq-card">
            <div className="faq-card-header">
              <h3>Pertanyaan {index + 1}</h3>
              <button className="faq-delete-btn" onClick={() => handleDelete(index)}>
                Hapus
              </button>
            </div>

            <div className="faq-input-group">
              <input
                type="text"
                className="faq-input"
                placeholder="Masukkan Pertanyaan"
                value={item.question}
                onChange={(e) => handleChange(index, "question", e.target.value)}
              />

              <textarea
                className="faq-textarea"
                placeholder="Masukkan Jawaban"
                value={item.answer}
                onChange={(e) => handleChange(index, "answer", e.target.value)}
              />

              <button
                className="faq-submit-btn"
                onClick={() => handleSubmit(index)}
                disabled={savingIndex === index}
              >
                {savingIndex === index ? "Menyimpan..." : "Submit"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminFAQ;