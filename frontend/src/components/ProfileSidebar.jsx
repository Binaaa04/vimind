import "../css/ProfileSidebar.css";
import logo from "../assets/logovimind2.png";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { updateProfile } from "../services/api";

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

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !userEmail) return;

    setIsUploading(true);
    try {
      // 1. Upload ke Supabase Storage (Bucket: avatars)
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // 3. Update Profile via Backend API
      await updateProfile(userEmail, nickname, publicUrl);

      // 4. Notify Parent
      onAvatarUpdate(publicUrl);
      console.log("Foto Berhasil Diubah!");
    } catch (err) {
      console.error("Gagal ganti foto:", err.message);
      alert("Gagal ganti foto: " + err.message + "\n(Pastikan bucket 'avatars' sudah ada di Supabase)");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        className={`profile-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`profile-sidebar ${isOpen ? "open" : ""}`}>
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

          {/* hidden input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* tombol */}
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
    </>
  );
};

export default ProfileSidebar;