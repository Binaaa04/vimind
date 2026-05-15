import { useState, useEffect } from "react";
import { adminGetFAQ, adminUpsertFAQ, adminDeleteFAQ } from "@/features/admin/api";
import "@/css/adminFAQ.css";

const AdminFAQ = ({ adminEmail }) => {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

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
      setFaq(faq.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    try {
      await adminDeleteFAQ(item.id, adminEmail);
      setFaq(faq.filter((_, i) => i !== index));
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const handleSubmit = async (index) => {
    const item = faq[index];
    if (!item.question || !item.answer) {
      alert("Isi pertanyaan dan jawaban!");
      return;
    }
    setSavingIndex(index);
    try {
      await adminUpsertFAQ({ ...item, admin_email: adminEmail });
      alert("Berhasil disimpan!");
      fetchFAQ();
    } catch (err) {
      alert("Gagal menyimpan");
    } finally {
      setSavingIndex(null);
    }
  };

  // === DRAG AND DROP LOGIC ===
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === index) return;

    const items = [...faq];
    const draggedItem = items[draggedItemIndex];
    
    // Tukar posisi array secara real-time
    items.splice(draggedItemIndex, 1);
    items.splice(index, 0, draggedItem);

    setDraggedItemIndex(index);
    setFaq(items);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
  };

  if (loading) return <div className="faq-loading">Memuat data...</div>;

  return (
    <div className="faq-container"style={{ height: "600px", overflowY: "auto", border: "transparent" }}>
      
      {/* HEADER (Hanya Judul) */}
      <div className="faq-header">
        <div className="faq-header-text">
          <h2>Custom FAQ</h2>
          <p>Kelola pertanyaan dan urutkan posisinya dengan menarik kartu di bawah.</p>
        </div>
      </div>

      {/* LAYOUT UTAMA: Kiri (Grid 3 Kartu) & Kanan (Tombol Sticky) */}
      <div className="faq-main-layout">
        
        {/* LIST KARTU FAQ (GRID 3 KOLOM) */}
        <div className="faq-list">
          {faq.length === 0 ? (
            <p className="faq-empty">Belum ada data FAQ. Klik tambah untuk membuat.</p>
          ) : (
            faq.map((item, index) => (
              <div 
                key={item.id || index} 
                className={`faq-card ${draggedItemIndex === index ? "is-dragging" : ""}`}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
              >
                {/* AREA UNTUK DRAG (Atas Kartu) */}
                <div className="faq-card-side-handle">
                  <div className="drag-icon">⋮⋮</div>
                </div>
                
                <div className="faq-card-content">
                  <div className="faq-card-header">
                    <span className="faq-number">Pertanyaan {index + 1}</span>
                    <button className="faq-delete-btn" onClick={() => handleDelete(index)}>
                      Hapus
                    </button>
                  </div>

                  <div className="faq-input-group">
                    <input
                      type="text"
                      className="faq-input"
                      placeholder="Apa pertanyaannya?"
                      value={item.question}
                      onChange={(e) => handleChange(index, "question", e.target.value)}
                    />

                    <textarea
                      className="faq-textarea"
                      placeholder="Tuliskan jawabannya di sini..."
                      value={item.answer}
                      onChange={(e) => handleChange(index, "answer", e.target.value)}
                    />

                    <div className="faq-card-footer">
                      <button
                        className="faq-submit-btn"
                        onClick={() => handleSubmit(index)}
                        disabled={savingIndex === index}
                      >
                        {savingIndex === index ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TOMBOL TAMBAH (DIBUNGKUS WRAPPER STICKY AGAR BULLETPROOF) */}
        <div className="faq-sticky-wrapper">
          <button className="faq-sticky-btn" onClick={handleAddNew}>
            + Tambah FAQ
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminFAQ;
