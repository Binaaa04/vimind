import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminFAQ from "./AdminFAQ";
import AdminTest from "./AdminTest";
import "../css/AdminDashboard.css";

const BannerCard = ({ title }) => {
  const [link, setLink] = useState("");
  const [active, setActive] = useState(false);

  return (
    <div className="banner-card">
      <h3>{title}</h3>

      <div className="input-row">
        <input
          type="text"
          placeholder="Masukkan Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button className="submit-btn">Submit</button>
      </div>

      <div className="preview-box">
        <span>Preview</span>

        <div className="action-btns">
          <button className="deactive" onClick={() => setActive(false)}>
            Deactivate
          </button>
          <button className="active-btn" onClick={() => setActive(true)}>
            Activate
          </button>
        </div>
      </div>

      {active && <p className="status">✔ Aktif</p>}
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      
      {/* ✅ Sidebar yang BENAR */}
      <AdminSidebar />

      <div className="admin-content">
        <Routes>

          {/* PROMOSI */}
          <Route
            path="/"
            element={
              <>
                <h1>Promosi Dashboard</h1>
                <BannerCard title="Banner 1" />
                <BannerCard title="Banner 2" />
                <BannerCard title="Banner 3" />
              </>
            }
          />

          {/* FAQ */}
          <Route path="faq" element={<AdminFAQ />} />

          {/* TEST */}
          <Route path="test" element={<AdminTest />} />

        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;