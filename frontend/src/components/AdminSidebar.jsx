import { NavLink, useNavigate } from "react-router-dom";
import "../css/AdminSidebar.css";
import logo from "../assets/logovimind2.png";
import logoSmall from "../assets/logo.png";
import { useState, useEffect } from "react";
import arrowVector from "../assets/arrowVector.svg";

// Import SVG untuk menu
import linkIcon from "../assets/link.svg";
import faqIcon from "../assets/faq.svg";
import testIcon from "../assets/test.svg";
import feedbackIcon from "../assets/feedback.svg";
import logoutIcon from "../assets/LogOut.svg"; // ✅ FIX: samakan nama
import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";

const AdminSidebar = ({ avatarUrl, nickname = "Admin" }) => {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
        {!isCollapsed && <p className="menu-title">PROMOTION</p>}
        <NavLink
          to="/admin"
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
          <img
            src={logoutIcon?.src || logoutIcon}
            alt="Logout"
            className="logout-icon"
          />
          {!isCollapsed && <span>Log Out</span>}
        </button>

      </div>
    </div>
  );
};

export default AdminSidebar;