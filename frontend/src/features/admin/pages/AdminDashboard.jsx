import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import DashboardAnalytics from "@/features/admin/pages/analyticsDashboard";
import AdminFAQ from "@/features/admin/pages/AdminFAQ";
import AdminTest from "@/features/admin/pages/AdminTest";
import AdminFeedback from "@/features/admin/pages/AdminFeedback";
import { adminGetBanners, adminUpsertBanner, adminDeleteBanner } from "@/features/admin/api";
import { getProfile } from "@/features/auth/api";
import "@/css/AdminDashboard.css";

const BannerCard = ({ bannerData, index, adminEmail, onImageClick }) => {
  const [linkUrl, setLinkUrl] = useState(bannerData?.link_url || "");
  const [imageUrl, setImageUrl] = useState(bannerData?.image_url || "");
  const [title, setTitle] = useState(bannerData?.title || "");
  const [isActive, setIsActive] = useState(bannerData?.is_active || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // FIX: Hanya kirimkan ID jika banner ini sudah pernah disimpan di DB
  const bannerPayload = () => {
    const payload = {
      title,
      image_url: imageUrl,
      link_url: linkUrl,
      is_active: isActive,
      display_order: bannerData?.display_order || index + 1,
    };
    if (bannerData?.id) {
      payload.id = bannerData.id;
    }
    return payload;
  };

  // Fungsi saat tombol hapus di card diklik (membuka modal)
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Fungsi eksekusi hapus yang sebenarnya
  const confirmDelete = async () => {
    setShowDeleteModal(false); // Tutup modal dulu
    
    // FIX: Kalau belum disimpan di database, cukup refresh layar untuk menghapus card
    if (!bannerData?.id) {
      window.location.reload();
      return;
    }

    try {
      await adminDeleteBanner(adminEmail, bannerData.id);
      window.location.reload();
    } catch (err) {
      alert("Gagal menghapus banner.");
    }
  };

  const handleSubmit = async () => {
    if (!adminEmail) return;
    setSaving(true);
    try {
      await adminUpsertBanner(adminEmail, bannerPayload());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.location.reload(); // Reload supaya dapat ID asli dari database
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan banner. Coba periksa koneksi atau data!");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (newState) => {
    if (!adminEmail) return;
    setIsActive(newState);
    try {
      await adminUpsertBanner(adminEmail, { ...bannerPayload(), is_active: newState });
    } catch (_) { }
  };

  return (
    <div className="banner-card">
      <div className="banner-card-header">
        <h3>Banner {index + 1} {isActive && <span className="status">✔ Aktif</span>}</h3>
        {/* FIX: Tombol hapus selalu tampil memanggil handleDeleteClick */}
        <button onClick={handleDeleteClick} className="delete-btn">
          🗑 Hapus
        </button>
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Judul Banner"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-title"
        />
        <input
          type="text"
          placeholder="Link URL (https://...)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="input-url"
        />
        <input
          type="text"
          placeholder="Paste Link Gambar (https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="input-url"
        />
        <button className="submit-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? "Menyimpan..." : saved ? "✔ Tersimpan" : "Submit"}
        </button>
      </div>

      <div className="preview-box">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Preview Banner"
              className="preview-image"
              onClick={() => onImageClick(imageUrl)}
              title="Klik untuk melihat ukuran penuh"
              style={{ cursor: "zoom-in" }}
            />
            <div className="preview-overlay">
              <h2 className="preview-title">
                {title || "IKI TEST"}
              </h2>
            </div>
          </>
        ) : (
          <div className="preview-empty">
            <span>🖼️ Preview Banner (Masukkan Link Gambar)</span>
          </div>
        )}

        <div className="action-btns">
          <button
            className={`status-btn ${isActive ? 'active' : 'inactive'}`}
            onClick={() => handleToggle(!isActive)}
          >
            {isActive ? '🔴 Nonaktifkan' : '🟢 Aktifkan'}
          </button>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS CUSTOM */}
      {showDeleteModal && (
        <div className="custom-modal-overlay" onClick={() => setShowDeleteModal(false)}>
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
            <h2 className="custom-modal-title">Hapus Banner?</h2>
            <p className="custom-modal-text">
              Yakin mau menghapus banner ini? Data yang sudah dihapus tidak bisa dikembalikan lagi.
            </p>
            
            <button className="custom-modal-btn-primary" onClick={confirmDelete}>
              Ya, Hapus
            </button>
            <button className="custom-modal-btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [adminAvatar, setAdminAvatar] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setAdminEmail(session.user.email);

        try {
          const profileRes = await getProfile(session.user.email);
          const name = profileRes.data?.name || session.user.user_metadata?.full_name || session.user.email.split("@")[0];
          const avatar = profileRes.data?.avatar_url || "";
          setAdminName(name);
          setAdminAvatar(avatar);
        } catch (err) {
          console.warn("Could not fetch admin profile, using defaults.");
        }

        adminGetBanners(session.user.email)
          .then((res) => setBanners(res.data || []))
          .catch(() => { })
          .finally(() => setLoadingBanners(false));
      } else {
        setLoadingBanners(false);
      }
    };

    fetchSession();
  }, []);

  return (
    <div className="admin-container">
      <AdminSidebar nickname={adminName} avatarUrl={adminAvatar} />

      <div className="admin-content">

        <Routes>
          {/* ANALYTICS DASHBOARD */}
          <Route path="analytics" element={<DashboardAnalytics />} />
          {/* PROMOSI */}
          <Route
            path="dashboard"
            element={
              <>
                <div className="admin-header">
                  <h1>Promosi Dashboard</h1>
                  <button
                    onClick={() => setBanners([{}, ...banners])}
                    className="add-banner-btn"
                  >
                    + Tambah Banner Baru
                  </button>
                </div>
                {loadingBanners ? (
                  <p style={{ color: "#aaa" }}>Memuat data banner...</p>
                ) : (
                  <div className="banners-grid">
                    {banners.map((b, i) => (
                      <BannerCard
                        key={b.id || i}
                        bannerData={b}
                        index={i}
                        adminEmail={adminEmail}
                        onImageClick={setPreviewImage}
                      />
                    ))}
                  </div>
                )}
                {banners.length === 0 && !loadingBanners && (
                  <p style={{ textAlign: "center", padding: 40, color: "#888" }}>Belum ada banner. Klik tombol di atas buat nambah!</p>
                )}
              </>
            }
          />

          {/* FAQ */}
          <Route path="faq" element={<AdminFAQ adminEmail={adminEmail} />} />
          <Route path="test" element={<AdminTest adminEmail={adminEmail} />} />
          <Route path="feedback" element={<AdminFeedback adminEmail={adminEmail} />} />
        </Routes>
      </div>

      {/* MODAL GAMBAR FULL */}
      {previewImage && (
        <div className="image-modal" onClick={() => setPreviewImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setPreviewImage(null)}>✕</button>
            <img src={previewImage} alt="Full Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;