import "../css/ProfileSidebar.css";
import logo from "../assets/logovimind2.png";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { updateProfile, deleteAccount } from "../services/api";

const ProfileSidebar = ({
  isOpen,
  onClose,
  onOpenNicknameModal,
  onOpenLogoutModal,
  nickname,
  avatarUrl,
  userEmail,
  onAvatarUpdate
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // === STATE BARU UNTUK MODAL HAPUS AKUN ===
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  // =========================================

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !userEmail) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      await updateProfile(userEmail, nickname, publicUrl);
      onAvatarUpdate(publicUrl);
      console.log("Foto Berhasil Diubah!");
    } catch (err) {
      console.error("Gagal ganti foto:", err.message);
      alert("Gagal ganti foto: " + err.message + "\n(Pastikan bucket 'avatars' sudah ada di Supabase)");
    } finally {
      setIsUploading(false);
    }
  };

  // === FUNGSI EKSEKUSI HAPUS AKUN ===
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Catatan: Jika API kamu mendukung pengiriman feedback, kamu bisa menyisipkan variabel `deleteFeedback` di sini.
      console.log("Feedback user:", deleteFeedback);

      await deleteAccount(userEmail);
      await supabase.auth.signOut();
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
                navigate("/forgot-password");
              }}
            >
              Forgot Password
            </button>

            {/* === TOMBOL HAPUS AKUN (MEMBUKA MODAL) === */}
            <button
              className="profile-menu-btn"
              style={{ color: '#ef4444', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', marginTop: '10px' }}
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