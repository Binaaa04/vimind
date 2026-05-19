import "@/css/ProfileSidebar.css";
import logo from "@/assets/logovimind2.png";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { updateProfile, deleteAccount, submitAccountFeedback } from "@/features/auth/api";

const ProfileSidebar = ({
  isOpen,
  onClose,
  onOpenNicknameModal,
  onOpenLogoutModal,
  nickname,
  avatarUrl,
  isAdmin,
  onAvatarUpdate
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // === STATE BARU UNTUK MODAL HAPUS AKUN ===
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { supabase } = await import("@/services/supabaseClient");
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      await updateProfile("", nickname, publicUrl); // Uses JWT
      onAvatarUpdate(publicUrl);
    } catch (err) {
      console.error("Gagal ganti foto:", err.message);
      alert("Gagal ganti foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteFeedback.trim()) {
        try {
          await submitAccountFeedback({ reason: deleteFeedback }); // Email empty, uses JWT
        } catch (err) {
          console.error("Gagal mengirim feedback penghapusan:", err);
        }
      }

      await deleteAccount(); // Uses JWT
      await signOut();
      localStorage.clear();
      alert("Akun berhasil dihapus.");
      navigate("/login");
    } catch (err) {
      console.error("Gagal hapus akun:", err);
      alert("Gagal menghapus akun.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className={`profile-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`profile-sidebar ${isOpen ? "open" : ""}`}>

        <button
          className="profile-close"
          onClick={() => {
            onClose();
            navigate("/dashboard");
          }}
        >
          ←
        </button>

        <div className="profile-top">
          <div className="profile-header">
            <h3>Hai, {nickname}</h3>
          </div>

          <div className="profile-avatar-wrap">
            <img
              src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"}
              alt="Profile"
              className="profile-avatar-img"
              style={{ opacity: isUploading ? 0.5 : 1 }}
            />
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            className="profile-photo-btn"
            onClick={handlePhotoClick}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Ubah Foto"}
          </button>

          <div className="profile-menu">
            {/* === TOMBOL ADMIN DASHBOARD (KHUSUS ADMIN) === */}
            {isAdmin && (
              <button
                className="profile-menu-btn"
                style={{ color: '#047857', border: '1px solid #d1fae5', backgroundColor: '#ecfdf5', marginBottom: '10px' }}
                onClick={() => {
                  onClose();
                  navigate("/admin");
                }}
              >
                Admin Dashboard
              </button>
            )}

            <button
              className="profile-menu-btn"
              onClick={() => {
                onClose();
                onOpenNicknameModal();
              }}
            >
              Change Nickname
            </button>

            <button
              className="profile-menu-btn"
              onClick={() => {
                onClose();
                navigate("/reset-password");
              }}
            >
              Ubah Password
            </button>

            {/* === DIVIDER PEMISAH: Normal vs Destruktif === */}
            <div style={{
              borderTop: '1px solid #fee2e2',
              margin: '16px 0 12px 0',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                padding: '0 8px',
                fontSize: '0.7rem',
                color: '#ef4444',
                fontWeight: '600',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>Zona Berbahaya</span>
            </div>

            {/* === TOMBOL HAPUS AKUN (MEMBUKA MODAL) === */}
            <button
              className="profile-menu-btn"
              style={{ color: '#ef4444', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}
              onClick={() => {
                setShowDeleteModal(true);
              }}
            >
              Hapus Akun
            </button>
          </div>
        </div>

        <div className="profile-bottom">
          <button
            className="profile-logout-btn"
            onClick={() => {
              onClose();
              onOpenLogoutModal();
            }}
          >
            <span className="logout-icon">↪</span>
            <span>Log Out</span>
          </button>

          <div className="profile-brand">
            <img src={logo} alt="Vimind" />
          </div>
        </div>
      </aside>

      {/* === MODAL KUSTOM HAPUS AKUN === */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3 className="delete-modal-title">Hapus Akun Permanen</h3>
            <p className="delete-modal-desc">
              Yakin mau hapus akun? Semua riwayat tesmu bakal hilang permanen lho!
            </p>

            <div className="delete-feedback-container">
              <label>Beri tahu kami alasanmu (opsional):</label>
              <textarea
                className="delete-feedback-input"
                placeholder="Misal: Saya ingin membuat akun baru..."
                value={deleteFeedback}
                onChange={(e) => setDeleteFeedback(e.target.value)}
                rows="3"
              />
            </div>

            <div className="delete-modal-actions">
              <button
                className="delete-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                className="delete-btn-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =============================== */}
    </>
  );
};

export default ProfileSidebar;
