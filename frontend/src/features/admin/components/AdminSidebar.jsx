import { NavLink, useNavigate } from "react-router-dom";
import "@/css/AdminSidebar.css";
import logo from "@/assets/logovimind2.png";
import logoSmall from "@/assets/logo.png";
import arrowVector from "@/assets/arrowVector.svg";

// Import SVG untuk menu
import linkIcon from "@/assets/link.svg";
import faqIcon from "@/assets/faq.svg";
import testIcon from "@/assets/Test.svg";
import feedbackIcon from "@/assets/feedback.svg";
import logoutIcon from "@/assets/LogOut.svg";
import dashboardIcon from "@/assets/Dashboard.svg";

// Hook React digabung jadi satu di sini biar gak error "already been declared"
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";

const AdminSidebar = ({ avatarUrl, nickname = "Admin" }) => {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // State baru untuk pop-up konfirmasi logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      // Tutup profile menu jika klik di luar
      if (
        !e.target.closest(".sidebar-user") &&
        !e.target.closest(".profile-popup")
      ) {
        setShowProfileMenu(false);
      }
      
      // Tutup logout confirm jika klik di luar
      if (
        !e.target.closest(".logout-btn") &&
        !e.target.closest(".logout-popup")
      ) {
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>

      {/* Toggle */}
      <button
        className="toggle-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <img
          src={arrowVector}
          alt="Toggle"
          style={{
            width: "14px",
            height: "14px",
            transition: "transform 0.3s ease",
            transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)"
          }}
        />
      </button>

      {/* LOGO */}
      <div className="logo">
        <img
          src={isCollapsed ? logoSmall : logo}
          alt="Vimind Logo"
          className={`logo-img ${isCollapsed ? "collapsed-logo" : ""}`}
        />
        {!isCollapsed && <span></span>}
      </div>

      {/* MENU */}
      <div className="menu-section">
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <img
            src={dashboardIcon?.src || dashboardIcon}
            alt="Dashboard Icon"
            className="menu-icon-img"
          />
          {!isCollapsed && <span>Dashboard Analytics</span>}
        </NavLink>
      </div>

      <div className="menu-section">
        {!isCollapsed && <p className="menu-title">PROMOTION</p>}
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <img
            src={linkIcon?.src || linkIcon}
            alt="Promotion Icon"
            className="menu-icon-img"
          />
          {!isCollapsed && <span>Promosi Dashboard</span>}
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
          <img
            src={faqIcon?.src || faqIcon}
            alt="FAQ Icon"
            className="menu-icon-img"
          />
          {!isCollapsed && <span>Ubah FAQ</span>}
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
          <img
            src={testIcon?.src || testIcon}
            alt="Test Icon"
            className="menu-icon-img"
          />
          {!isCollapsed && <span>Ubah Pertanyaan Test</span>}
        </NavLink>

        <NavLink
          to="/admin/feedback"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <img
            src={feedbackIcon?.src || feedbackIcon}
            alt="Feedback Icon"
            className="menu-icon-img"
          />
          {!isCollapsed && <span>User Feedback</span>}
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

            <div style={{ padding: "8px 0" }}>
              <span style={{
                background: "#f3f0ff",
                color: "#7c3aed",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Administrator
              </span>
            </div>

            <div className="popup-footer">
              <img src={logo} alt="logo" style={{ width: 60, marginTop: '8px' }} />
            </div>
          </div>
        )}

        {/* LOGOUT */}
        {/* Ubah onClick agar membuka state showLogoutConfirm, bukan langsung handleLogout */}
        <button className="logout-btn" onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}>
          <img
            src={logoutIcon?.src || logoutIcon}
            alt="Logout"
            className="logout-icon"
          />
          {!isCollapsed && <span>Log Out</span>}
        </button>

        {/* POPUP KONFIRMASI LOGOUT */}
        {showLogoutConfirm && (
          <div className="logout-popup">
            <h4>Yakin mau keluar?</h4>
            <div className="logout-popup-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Batal
              </button>
              <button className="btn-confirm" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSidebar;