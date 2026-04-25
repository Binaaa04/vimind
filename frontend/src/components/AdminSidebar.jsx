import { NavLink, useNavigate } from "react-router-dom";
import "../css/AdminDashboard.css";
import logo from "../assets/logovimind2.png";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";

const AdminSidebar = ({ avatarUrl, nickname = "Admin" }) => {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // 🔥 default kecil

  const hoverTimeout = useRef(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  // 🔥 hover logic (anti flicker)
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 200); // delay biar smooth
  };

  // close popup kalau klik luar
  useEffect(() => {
    const handleClick = (e) => {
      if (
        !e.target.closest(".sidebar-user") &&
        !e.target.closest(".profile-popup")
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {/* 🔥 (opsional) toggle manual */}
      <button
        className="toggle-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? ">" : "<"}
      </button>

      {/* LOGO */}
      <div className="logo">
        <img src={logo} alt="Vimind Logo" className="logo-img" />
        {!isCollapsed && <span></span>}
      </div>

      {/* MENU */}
      <div className="menu-section">
        {!isCollapsed && <p className="menu-title">PROMOTION</p>}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          🔗 {!isCollapsed && "Banner Dashboard"}
        </NavLink>
      </div>


      <div className="menu-section">
        {!isCollapsed && <p className="menu-title">FAQ</p>}
        <NavLink
          to="/admin/faq"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          ❓ {!isCollapsed && "Ubah FAQ"}
        </NavLink>
      </div>

      <div className="menu-section">
        {!isCollapsed && <p className="menu-title">TEST</p>}
        <NavLink
          to="/admin/test"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          💡 {!isCollapsed && "Ubah Pertanyaan Test"}
        </NavLink>
        <NavLink
          to="/admin/feedback"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          💬 {!isCollapsed && "User Feedbacks"}
        </NavLink>
      </div>


      {/* ================= BOTTOM ================= */}
      <div className="sidebar-bottom">

        {/* PROFILE MINI */}
        <div
          className="sidebar-user clickable"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <img
            src={
              avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            }
            alt="avatar"
            className="sidebar-avatar"
          />
          {!isCollapsed && <span>{nickname}</span>}
        </div>

        {/* POPUP PROFILE */}
        {showProfileMenu && (
          <div className="profile-popup">
            <h4>Hai, {nickname}</h4>

            <img
              src={
                avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
              }
              alt="avatar"
              className="popup-avatar"
            />

            <button className="btn-primary">Ubah Foto</button>
            <button className="popup-btn">Change Nickname</button>
            <button className="popup-btn">Forgot Password</button>

            <div className="popup-footer">
              <img src={logo} alt="logo" style={{ width: 60 }} />
            </div>
          </div>
        )}

        {/* LOGOUT */}
        <button className="logout-btn" onClick={handleLogout}>
          🚪 {!isCollapsed && "Log Out"}
        </button>

      </div>
    </div>
  );
};

export default AdminSidebar;