import { useState } from "react";
import SummaryModal from "../components/SummaryModal";
import MoodResultModal from "../components/MoodResultModal";
import { useNavigate } from "react-router-dom";
import MoodModal from "../components/MoodModal";
import ProfileSidebar from "../components/ProfileSidebar";
import NicknameModal from "../components/NicknameModal";
import logo from "../assets/logovimind2.png";

const Dashboard = () => {
  const [showMood, setShowMood] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState(
    localStorage.getItem("nickname") || "Udean"
  );

  const navigate = useNavigate();
  const mood = localStorage.getItem("mood");

  const handleSaveNickname = (newNickname) => {
    const finalNickname = newNickname?.trim() || "Udean";
    setNickname(finalNickname);
    localStorage.setItem("nickname", finalNickname);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-main">

      {/* NAVBAR */}
      <div className="dashboard-navbar">
        <div className="nav-left">
          <img src={logo} alt="logo" className="nav-logo" />
          <div className="divider" />
          <span className="nav-menu">Artikel Kesehatan Mental ▾</span>
        </div>
        {/* PROFILE AREA */}
        <div className="nav-profile-area">
          <button
            className={`profile-trigger ${showSidebar ? "active" : ""}`}
            onClick={() => setShowSidebar(!showSidebar)}
          >   
            <span>Profile</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
              alt="Profile"
              className="profile-trigger-avatar"
            />
          </button>

          {/* SIDEBAR */}
          <ProfileSidebar 
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)} 
            onOpenNicknameModal={() => setShowNicknameModal(true)}
            nickname={nickname}
          />
        </div>
      </div>

      {/* HERO */}
      <div className="dashboard-hero">
        <div className="hero-big" />
        <div className="hero-small" />
      </div>

      {/* DOTS */}
      <div className="dots">
        <span />
        <span className="active" />
        <span />
      </div>

      {/* FEATURE */}
      <div className="bottom-section">

        <div className="bottom-left">
          <h2>Mari cek dan coba <br />beberapa manfaat Vimind</h2>
        </div>

        <div className="bottom-cards">

          {/* MOOD RESULT */}
          <div
            className="feature-card"
            onClick={() => {
              if (!mood) {
                alert("Isi mood dulu ya 🙂");
                return;
              }
              setShowResult(true);
            }}
          >
            <div className="icon">🙂</div>
            <div>
              <h4>Rangkuman Kondisi Mood</h4>
              <p>Berikut hasil rangkuman mood bulanan kamu.</p>
            </div>
          </div>

          {/* QUIZ BUTTON */}
          <div
            className="feature-card"
            onClick={() => {
              localStorage.setItem("quizFrom", "dashboard");
              navigate("/deteksi");
            }}
          >
            <div className="icon">🧠</div>
            <div>
              <h4>Cek Kondisi Mentalmu</h4>
              <p>Pengujian untuk mencari tau bagaimana kondisi mentalmu.</p>
            </div>
          </div>

          {/* SUMMARY */}
          <div
            className="feature-card"
            onClick={() => setShowSummary(true)}
          >
            <div className="icon">📊</div>
            <div>
              <h4>Lihat Rangkuman</h4>
              <p>Rangkuman dan perkembangan pengujian mentalmu selama ini.</p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* NICKNAME MODAL */}
      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        onSave={handleSaveNickname}
      />

      {/* MOOD MODAL */}
      {showMood && (
        <MoodModal onClose={() => setShowMood(false)} />
      )}

      {/* RESULT MODAL */}
      {showResult && (
        <MoodResultModal
          mood={mood}
          onClose={() => setShowResult(false)}
        />
      )}

      {/* SUMMARY */}
      {showSummary && (
        <SummaryModal onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
};

export default Dashboard;