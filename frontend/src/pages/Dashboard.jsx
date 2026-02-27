import { useState, useEffect } from "react";
import MoodModal from "../components/MoodModal";
import logo from "../assets/logovimind2.png";

const Dashboard = () => {
  const [showMood, setShowMood] = useState(true);

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <div className="dashboard-navbar">
        <div className="nav-left">
          <img src={logo} alt="logo" className="nav-logo"/>
          <div className="divider"/>
          <span className="nav-menu">Artikel Kesehatan Mental ▾</span>
        </div>
      </div>


      {/* HERO */}
      <div className="dashboard-hero">
        <div className="hero-big"/>
        <div className="hero-small"/>
      </div>

      {/* SLIDER DOT */}
      <div className="dots">
        <span/>
        <span className="active"/>
        <span/>
      </div>


      {/* FEATURE SECTION */}
      <div className="bottom-section">

        <div className="bottom-left">
          <h2>Mari cek dan coba <br/>beberapa manfaat Vimind</h2>
        </div>

        <div className="bottom-cards">

          <div className="feature-card">
            <div className="icon">🙂</div>
            <div>
              <h4>Rangkuman Kondisi Mood</h4>
              <p>Berikut hasil rangkuman mood bulanan kamu.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon">🧠</div>
            <div>
              <h4>Cek Kondisi Mentalmu</h4>
              <p>Pengujian untuk mencari tau bagaimana kondisi mentalmu.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon">📊</div>
            <div>
              <h4>Lihat Rangkuman</h4>
              <p>Rangkuman dan perkembangan pengujian mentalmu selama ini.</p>
            </div>
          </div>

        </div>
      </div>


      {/* MODAL */}
      {showMood && (
        <MoodModal onClose={() => setShowMood(false)} />
      )}

    </div>
  );
};

export default Dashboard;