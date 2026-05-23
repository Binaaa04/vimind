import { useState, useEffect } from "react";
import { adminGetFAQ, adminUpsertFAQ, adminDeleteFAQ } from "@/features/admin/api";
import "./AdminFAQ.css";

const AdminFAQ = () => {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  // State untuk mengontrol pop-up modal hapus (menyimpan index FAQ yang mau dihapus)
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchFAQ = async () => {
    try {
      const res = await adminGetFAQ();
      setFaq(res.data || []);
    } catch (err) {
      console.error("Gagal ambil FAQ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQ();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...faq];
    updated[index][field] = value;
    setFaq(updated);
  };

  const handleAddNew = () => {
    setFaq([...faq, { id: "", question: "", answer: "" }]);
  };

  // Fungsi saat tombol hapus di kartu diklik (memunculkan modal)
  const handleDeleteClick = (index) => {
    setDeleteTarget(index);
  };

  // Fungsi eksekusi hapus setelah konfirmasi dari modal
  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    
    const index = deleteTarget;
    const item = faq[index];
    
    setDeleteTarget(null); // Tutup modal

    if (!item.id) {
      setFaq(faq.filter((_, i) => i !== index));
      return;
    }
    
    try {
      await adminDeleteFAQ(item.id);
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
      await adminUpsertFAQ(item);
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
    <div className="faq-container" style={{ height: "600px", overflowY: "auto", border: "transparent" }}>
      
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
                    <button className="faq-delete-btn" onClick={() => handleDeleteClick(index)}>
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

      {/* MODAL KONFIRMASI HAPUS CUSTOM */}
      {deleteTarget !== null && (
        <div className="custom-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-icon">
              {/* Ikon Trash SVG */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h2 className="custom-modal-title">Hapus FAQ?</h2>
            <p className="custom-modal-text">
              Yakin mau menghapus pertanyaan ini? Data yang sudah dihapus tidak bisa dikembalikan lagi.
            </p>
            
            <button className="custom-modal-btn-primary" onClick={confirmDelete}>
              Ya, Hapus
            </button>
            <button className="custom-modal-btn-secondary" onClick={() => setDeleteTarget(null)}>
              Batal
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFAQ;