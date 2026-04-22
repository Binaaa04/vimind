import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import AdminSidebar from "../components/AdminSidebar";
import AdminFAQ from "./AdminFAQ";
import AdminTest from "./AdminTest";
import AdminFeedback from "./AdminFeedback";
import AdminNews from "./AdminNews";
import { adminGetBanners, adminUpsertBanner } from "../services/api";
import "../css/AdminDashboard.css";

const BannerCard = ({ bannerData, index, adminEmail }) => {
  const [linkUrl, setLinkUrl] = useState(bannerData?.link_url || "");
  const [imageUrl, setImageUrl] = useState(bannerData?.image_url || "");
  const [title, setTitle] = useState(bannerData?.title || "");
  const [isActive, setIsActive] = useState(bannerData?.is_active || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const bannerPayload = () => ({
    id: bannerData?.id || "",
    title,
    image_url: imageUrl,
    link_url: linkUrl,
    is_active: isActive,
    display_order: bannerData?.display_order || index + 1,
  });

  const handleSubmit = async () => {
    if (!adminEmail) return;
    setSaving(true);
    try {
      await adminUpsertBanner(adminEmail, bannerPayload());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Gagal menyimpan banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (newState) => {
    if (!adminEmail) return;
    setIsActive(newState);
    try {
      await adminUpsertBanner(adminEmail, { ...bannerPayload(), is_active: newState });
    } catch (_) {}
  };

  return (
    <div className="banner-card">
      <h3>Banner {index + 1} {isActive && <span className="status">✔ Aktif</span>}</h3>

      <div className="input-row" style={{ flexWrap: "wrap", gap: 8 }}>
        <input
          type="text"
          placeholder="Judul Banner"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: "1 1 150px" }}
        />
        <input
          type="text"
          placeholder="Link URL (https://...)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          style={{ flex: "2 1 250px" }}
        />
        <input
          type="text"
          placeholder="Image URL (opsional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ flex: "2 1 250px" }}
        />
        <button className="submit-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? "Menyimpan..." : saved ? "✔ Tersimpan" : "Submit"}
        </button>
      </div>

      <div className="preview-box">
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noreferrer" style={{ color: "#333", fontSize: 13 }}>
            🔗 {linkUrl}
          </a>
        ) : (
          <span>Preview (masukkan link dulu)</span>
        )}

        <div className="action-btns">
          <button className="deactive" onClick={() => handleToggle(false)}>
            Deactivate
          </button>
          <button className="active-btn" onClick={() => handleToggle(true)}>
            Activate
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
        
        // Fetch banners only after email is available
        adminGetBanners(session.user.email)
          .then((res) => setBanners(res.data || []))
          .catch(() => {})
          .finally(() => setLoadingBanners(false));
      } else {
        setLoadingBanners(false);
      }
    };
    
    fetchSession();
  }, []);

  // Tampilkan minimal 3 slot banner (isi dari DB kalau ada, kosong kalau belum)
  const bannerSlots = Array.from({ length: Math.max(3, banners.length) }, (_, i) => banners[i] || null);

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <Routes>
          {/* PROMOSI */}
          <Route
            path="/"
            element={
              <>
                <h1>Promosi Dashboard</h1>
                {loadingBanners ? (
                  <p style={{ color: "#aaa" }}>Memuat data banner...</p>
                ) : (
                  bannerSlots.map((b, i) => (
                    <BannerCard key={i} bannerData={b} index={i} adminEmail={adminEmail} />
                  ))
                )}
              </>
            }
          />

          {/* FAQ */}
          <Route path="faq" element={<AdminFAQ adminEmail={adminEmail} />} />
          <Route path="news" element={<AdminNews adminEmail={adminEmail} />} />
          <Route path="test" element={<AdminTest adminEmail={adminEmail} />} />
          <Route path="feedback" element={<AdminFeedback adminEmail={adminEmail} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;