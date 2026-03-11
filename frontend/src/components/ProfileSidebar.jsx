import "../css/ProfileSidebar.css";
import logo from "../assets/logovimind2.png";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const ProfileSidebar = ({ 
  isOpen, 
  onClose, 
  onOpenNicknameModal, 
  onOpenLogoutModal, 
  nickname 
}) => {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    console.log("Foto dipilih:", file);

    // preview foto sementara
    const imageURL = URL.createObjectURL(file);
    document.querySelector(".profile-avatar-img").src = imageURL;

    // nanti di sini bisa upload ke server
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
              src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
              alt="Profile"
              className="profile-avatar-img"
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
          >
            Ubah Foto
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