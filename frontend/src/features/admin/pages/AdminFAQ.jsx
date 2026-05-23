import { useState, useEffect } from "react";
import { adminGetFAQ, adminUpsertFAQ, adminDeleteFAQ } from "@/features/admin/api";
import "./AdminFAQ.css";

const AdminFAQ = () => {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [canDrag, setCanDrag] = useState(false);
  const [expandedIndices, setExpandedIndices] = useState({});
  
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

  const toggleExpand = (index) => {
    setExpandedIndices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAddNew = () => {
    const newFaq = [...faq, { id: "", question: "", answer: "" }];
    setFaq(newFaq);
    setExpandedIndices(prev => ({
      ...prev,
      [newFaq.length - 1]: true
    }));
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
    <div className="faq-container">
      
      {/* HEADER (Judul + Tombol Tambah FAQ) */}
      <div className="faq-header">
        <div className="faq-header-text">
          <h2>Custom FAQ</h2>
          <p>Kelola pertanyaan dan urutkan posisinya dengan menarik drag handle di sebelah kiri.</p>
        </div>
        <button className="faq-add-btn" onClick={handleAddNew}>
          + Tambah FAQ
        </button>
      </div>

      {/* LAYOUT UTAMA: List Baris Accordion */}
      <div className="faq-main-layout">
        
        {/* LIST BARIS FAQ (VERTIKAL ACCORDION) */}
        <div className="faq-list">
          {faq.length === 0 ? (
            <p className="faq-empty">Belum ada data FAQ. Klik tambah untuk membuat.</p>
          ) : (
            faq.map((item, index) => {
              const isExpanded = expandedIndices[index] || false;
              return (
                <div 
                  key={item.id || index} 
                  className={`faq-card-row ${draggedItemIndex === index ? "is-dragging" : ""}`}
                  draggable={canDrag}
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={() => {
                    onDragEnd();
                    setCanDrag(false);
                  }}
                >
                  {/* ACCORDION HEADER */}
                  <div className="faq-row-header">
                    {/* DRAG HANDLE */}
                    <div 
                      className="faq-drag-handle"
                      onMouseDown={() => setCanDrag(true)}
                      onMouseUp={() => setCanDrag(false)}
                      onMouseLeave={() => setCanDrag(false)}
                    >
                      <div className="drag-icon">⋮⋮</div>
                    </div>
                    
                    <span className="faq-number">FAQ {index + 1}</span>
                    
                    <input
                      type="text"
                      className="faq-row-input"
                      placeholder="Apa pertanyaannya?"
                      value={item.question}
                      onChange={(e) => handleChange(index, "question", e.target.value)}
                    />
                    
                    <button 
                      className={`faq-toggle-btn ${isExpanded ? "expanded" : ""}`} 
                      onClick={() => toggleExpand(index)}
                      title={isExpanded ? "Sembunyikan Jawaban" : "Tampilkan Jawaban"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                  
                  {/* ACCORDION PANEL */}
                  {isExpanded && (
                    <div className="faq-row-panel">
                      <div className="faq-panel-content">
                        <div className="faq-textarea-group">
                          <label className="faq-label">Jawaban:</label>
                          <textarea
                            className="faq-textarea"
                            placeholder="Tuliskan jawabannya di sini..."
                            value={item.answer}
                            onChange={(e) => handleChange(index, "answer", e.target.value)}
                          />
                        </div>
                        
                        <div className="faq-panel-actions">
                          <button
                            className="faq-submit-btn"
                            onClick={() => handleSubmit(index)}
                            disabled={savingIndex === index}
                          >
                            {savingIndex === index ? "Menyimpan..." : "Simpan Perubahan"}
                          </button>
                          <button className="faq-delete-btn" onClick={() => handleDeleteClick(index)}>
                            Hapus FAQ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
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