import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import AdminSidebar from "../components/AdminSidebar";
import AdminFAQ from "./AdminFAQ";
import AdminTest from "./AdminTest";
import AdminFeedback from "./AdminFeedback";
import { adminGetBanners, adminUpsertBanner, adminDeleteBanner, getProfile } from "../services/api";
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

  const handleDelete = async () => {
    if (!bannerData?.id) return;
    if (!window.confirm("Beneran mau hapus banner ini?")) return;
    try {
      await adminDeleteBanner(adminEmail, bannerData.id);
      window.location.reload(); // Simple refresh for now
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Banner {index + 1} {isActive && <span className="status">✔ Aktif</span>}</h3>
        {bannerData?.id && (
          <button onClick={handleDelete} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
            🗑 Hapus
          </button>
        )}
      </div>

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
          placeholder="Paste Link Gambar (https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ flex: "2 1 250px" }}
        />
        <button className="submit-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? "Menyimpan..." : saved ? "✔ Tersimpan" : "Submit"}
        </button>
      </div>

      <div className="preview-box" style={{ 
        overflow: "hidden", 
        height: "300px", 
        width: "100%",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "flex-start", 
        justifyContent: "center", 
        border: "1px solid #ddd", 
        marginTop: 15, 
        position: "relative",
        borderRadius: "20px",
        background: "#f0f0f0"
      }}>
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Preview Banner" 
              style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "cover", position: "absolute", top: 0, left: 0 }} 
            />
            {/* Overlay identik Dashboard User */}
            <div style={{ 
              position: "absolute", 
              zIndex: 2, 
              paddingLeft: "40px", 
              background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              textAlign: "left",
              color: "white"
            }}>
              <h2 style={{ 
                margin: 0, 
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)", 
                fontSize: "2rem", 
                fontWeight: "800",
                textTransform: "uppercase",
                fontFamily: "inherit"
              }}>
                {title || "IKI TEST"}{" "}
                <span style={{ color: "#ffeb3b", marginLeft: "5px" }}>Promo</span>
              </h2>
            </div>
          </>
        ) : (
          <div style={{ width: "100%", textAlign: "center", color: "#999" }}>
            <span style={{ fontSize: 14 }}>🖼️ Preview Banner (Masukkan Link Gambar)</span>
          </div>
        )}
        
        <div className="action-btns" style={{ position: "absolute", bottom: 20, right: 20, zIndex: 10, display: "flex", gap: 10 }}>
          <button className="deactive" onClick={() => handleToggle(false)} style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.3)", padding: "8px 15px" }}>
            Deactivate
          </button>
          <button className="active-btn" onClick={() => handleToggle(true)} style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.3)", padding: "8px 15px" }}>
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
  const [adminName, setAdminName] = useState("Admin");
  const [adminAvatar, setAdminAvatar] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
        
        // Fetch Admin profile info
        try {
          const profileRes = await getProfile(session.user.email);
          const name = profileRes.data?.name || session.user.user_metadata?.full_name || session.user.email.split("@")[0];
          const avatar = profileRes.data?.avatar_url || "";
          setAdminName(name);
          setAdminAvatar(avatar);
        } catch (err) {
          console.warn("Could not fetch admin profile, using defaults.");
        }

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
      <AdminSidebar nickname={adminName} avatarUrl={adminAvatar} />

      <div className="admin-content">
        <Routes>
          {/* PROMOSI */}
          <Route
            path="/"
            element={
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h1>Promosi Dashboard</h1>
                  <button 
                    onClick={() => setBanners([...banners, {}])}
                    style={{ background: "#8B5CF6", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
                  >
                    + Tambah Banner Baru
                  </button>
                </div>
                {loadingBanners ? (
                  <p style={{ color: "#aaa" }}>Memuat data banner...</p>
                ) : (
                  banners.map((b, i) => (
                    <BannerCard key={b.id || i} bannerData={b} index={i} adminEmail={adminEmail} />
                  ))
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
    </div>
  );
};

export default AdminDashboard;