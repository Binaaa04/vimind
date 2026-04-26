import { useState, useEffect } from "react";
import { adminGetNews, adminUpsertNews, adminDeleteNews } from "../services/api";
import "../css/AdminDashboard.css";

const ArticleCard = ({ article, adminEmail, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: article?.id || "",
    title: article?.title || "",
    content: article?.content || "",
    image_url: article?.image_url || "",
    link_url: article?.link_url || "",
    source: article?.source || "Vimind Admin",
    is_active: article?.is_active ?? true,
  });

  const handleSave = async () => {
    if (!formData.title) return alert("Judul wajib diisi!");
    setLoading(true);
    try {
      await adminUpsertNews(adminEmail, formData);
      alert("Artikel berhasil disimpan!");
      onRefresh();
    } catch (err) {
      alert("Gagal menyimpan artikel.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;
    try {
      await adminDeleteNews(adminEmail, article.id);
      onRefresh();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <div className="banner-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3>{article?.id ? "Edit Artikel" : "Tambah Artikel Baru"}</h3>
        {article?.id && <button onClick={handleDelete} style={{ background: "#ff4d4d", color: "white", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Hapus</button>}
      </div>

      <div className="input-row" style={{ flexDirection: "column", gap: 10 }}>
        <input 
          type="text" 
          placeholder="Judul Artikel" 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        <textarea 
          placeholder="Konten/Deskripsi Singkat" 
          value={formData.content} 
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          style={{ width: "100%", padding: 10, borderRadius: 8, background: "#fff", color: "#333", border: "1px solid #ccc", minHeight: 80, fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <input 
            type="text" 
            placeholder="Image URL" 
            value={formData.image_url} 
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            style={{ flex: 1 }}
          />
          <input 
            type="text" 
            placeholder="Link URL" 
            value={formData.link_url} 
            onChange={(e) => setFormData({...formData, link_url: e.target.value})}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ color: "#aaa", fontSize: 14 }}>
            <input 
              type="checkbox" 
              checked={formData.is_active} 
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
            /> Aktif (Tampil di Dashboard)
          </label>
          <button className="submit-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Artikel"}
          </button>
        </div>
      </div>
      
      {formData.image_url && (
        <div className="preview-box" style={{ marginTop: 15 }}>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>Preview Gambar:</p>
          <img src={formData.image_url} alt="preview" style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
};

const AdminNews = ({ adminEmail }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchNews = async () => {
    if (!adminEmail) return;
    try {
      const res = await adminGetNews(adminEmail);
      setArticles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [adminEmail]);

  return (
    <div className="admin-news-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Pengaturan Artikel & Berita</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          style={{ background: "#4caf50", color: "white", padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}
        >
          {isAdding ? "Batal" : "+ Artikel Baru"}
        </button>
      </div>

      <p style={{ color: "#aaa", marginBottom: 20 }}>
        ⚠️ Artikel yang dibuat di sini akan tampil di bagian "Update & News" di Dashboard user. 
        Jika kosong, sistem akan mengambil berita otomatis dari Google News.
      </p>

      {isAdding && (
        <div style={{ marginBottom: 30, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 20 }}>
          <ArticleCard adminEmail={adminEmail} onRefresh={() => { fetchNews(); setIsAdding(false); }} />
        </div>
      )}

      {loading ? (
        <p>Memuat artikel...</p>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "rgba(255,255,255,0.02)", borderRadius: 15 }}>
          <p style={{ color: "#666" }}>Belum ada artikel manual. Masih menggunakan Google News (Automatic).</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} adminEmail={adminEmail} onRefresh={fetchNews} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNews;
