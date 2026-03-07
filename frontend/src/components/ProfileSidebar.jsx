import "./ProfileSidebar.css";
import logo from "../assets/logovimind2.png";

const ProfileSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`profile-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`profile-sidebar ${isOpen ? "open" : ""}`}>
        <div className="profile-top">
          <div className="profile-header">
            <h3>Hai, Udean</h3>
          </div>

          <div className="profile-avatar-wrap">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
              alt="Profile"
              className="profile-avatar-img"
            />
          </div>

          <button className="profile-photo-btn">Ubah Foto</button>

          <div className="profile-menu">
            <button className="profile-menu-btn">Change Nickname</button>
            <button className="profile-menu-btn">Forgot Password</button>
          </div>
        </div>

        <div className="profile-bottom">
          <button className="profile-logout-btn">
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