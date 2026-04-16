import { NavLink, useNavigate } from "react-router-dom";
import "../css/AdminDashboard.css";
import logo from "../assets/logovimind2.png";
const AdminSidebar = ({ nickname = "Udean", avatarUrl }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="admin-sidebar">

            {/* LOGO */}
            <div className="logo">
                <img src={logo} alt="Vimind Logo" className="logo-img" />
            </div>

            {/* MENU */}
            <div className="menu-section">
                <p className="menu-title">PROMOTION</p>
                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    🔗 Link Promosi Dashboard
                </NavLink>
            </div>

            <div className="menu-section">
                <p className="menu-title">FAQ</p>
                <NavLink
                    to="/admin/faq"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    ❓ Ubah FAQ
                </NavLink>
            </div>

            <div className="menu-section">
                <p className="menu-title">TEST</p>
                <NavLink
                    to="/admin/test"
                    className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                    }
                >
                    💡 Ubah Pertanyaan Test
                </NavLink>
            </div>

            {/* ================= BOTTOM ================= */}
            <div className="sidebar-bottom">

                {/* PROFILE MINI */}
                <div className="sidebar-user">
                    <img
                        src={
                            avatarUrl ||
                            "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                        }
                        alt="avatar"
                        className="sidebar-avatar"
                    />
                    <span>{nickname}</span>
                </div>

                {/* LOGOUT */}
                <button className="logout-btn" onClick={handleLogout}>
                    🔴 Log Out
                </button>

            </div>
        </div>
    );
};

export default AdminSidebar;