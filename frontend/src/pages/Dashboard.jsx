import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import SummaryModal from "../components/SummaryModal";
import MoodResultModal from "../components/MoodResultModal";
import { useNavigate } from "react-router-dom";
import MoodModal from "../components/MoodModal";
import ProfileSidebar from "../components/ProfileSidebar";
import NicknameModal from "../components/NicknameModal";
import NicknameSuccessModal from "../components/NicknameSuccessModal";
import LogoutModal from "../components/LogoutModal";
import ArticleModal from "../components/ArticleModal";
import TestOptionsModal from "../components/TestOptionsModal";
import { articlesList } from "../data/articlesData";
import { getProfile, updateProfile, diagnose, sendChatMessage } from "../services/api";
import logo from "../assets/logovimind2.png";
import kemenkesLogo from "../assets/kemenkes_logo.png";
import familyBanner from "../assets/family_banner.png";
import chatbotIcon from "../assets/chatbot.png";
import "../css/DashboardCSS.css";

const Dashboard = () => {
  const [showMood, setShowMood] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showArticleMenu, setShowArticleMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileArticleList, setShowMobileArticleList] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showNicknameSuccessModal, setShowNicknameSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showTestOptions, setShowTestOptions] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [userEmail, setUserEmail] = useState("");
  const [nickname, setNickname] = useState(
    localStorage.getItem("nickname") || "User"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem("avatar_url") || ""
  );

  const [news, setNews] = useState([]);
  const navigate = useNavigate();
  const mood = localStorage.getItem("mood");

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        try {
          const res = await getProfile(session.user.email);
          const name = res.data?.name || session.user.user_metadata?.full_name || session.user.email.split("@")[0];
          const avatar = res.data?.avatar_url || "";

          setNickname(name);
          setAvatarUrl(avatar);

          localStorage.setItem("nickname", name);
          if (avatar) {
            localStorage.setItem("avatar_url", avatar);
          } else {
            localStorage.removeItem("avatar_url");
          }
        } catch (err) {
          console.error("Profile not found, using default.");
          // If profile not in DB yet, use Supabase metadata if exists
          const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
          setNickname(name);
        }

      }
    };
    const fetchNews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/news`);
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
    };

    fetchUserAndProfile();
    fetchNews();
  }, []);

  const handleSaveNickname = async (newNickname) => {
    const finalNickname = newNickname?.trim() || "User";
    try {
      await updateProfile(userEmail, finalNickname);
      setNickname(finalNickname);
      localStorage.setItem("nickname", finalNickname);
      setShowNicknameModal(false);
      setShowNicknameSuccessModal(true);
    } catch (err) {
      console.error("Failed to save nickname:", err);
      alert("Gagal menyimpan nickname.");
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setShowArticleMenu(false);
    setShowMobileArticleList(false);
    setShowArticleModal(true);
  };

  const fetchChatbotReply = async (newMessages) => {
    try {
      setIsChatLoading(true);
      const emailToUse = userEmail || "guest";
      const res = await sendChatMessage(emailToUse, newMessages);
      
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply }
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, aku sedang mengalami kendala. Bisa dicoba lagi nanti ya!" }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { role: "user", content: chatInput };
    const updatedMessages = [...chatMessages, newMsg];
    
    setChatMessages(updatedMessages);
    setChatInput("");
    
    fetchChatbotReply(updatedMessages);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("nickname");
      localStorage.removeItem("avatar_url"); // Fix: clear avatar
      localStorage.removeItem("mood");
      localStorage.removeItem("quizFrom");
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
      alert("Gagal logout: " + error.message);
    }
  };

  const handleResumeTest = () => {
    localStorage.setItem("quizFrom", "dashboard");
    navigate("/deteksi", { state: { forceNewTest: false } });
    setShowTestOptions(false);
  };

  const handleNewTest = () => {
    localStorage.setItem("quizFrom", "dashboard");
    navigate("/deteksi", { state: { forceNewTest: true } });
    setShowTestOptions(false);
  };

  // --- STATE UNTUK CAROUSEL ---
  const [currentSlide, setCurrentSlide] = useState(0);

  // Data isi carousel (Dinamis dari News API + Fallback Statis)
  const carouselSlides = news.length > 0
    ? news.slice(0, 3).map((item, index) => ({
      id: index,
      title: item.title,
      highlight: item.highlight,
      rightText: "Mari baca berita kesehatan selengkapnya untuk wawasan lebih luas.",
      bgRight: index === 0 ? "#E9004C" : index === 1 ? "#8B5CF6" : "#10B981",
      image: item.image,
      link: item.link
    }))
    : [
      {
        id: 0,
        title: "Vimind Didukung",
        highlight: "Kementerian Kesehatan RI",
        rightText: "Lembaga Penyelenggara Pelatihan Bidang Kesehatan yang Telah Diakreditasi oleh Kemenkes RI",
        bgRight: "#E9004C",
        image: familyBanner,
        link: "#"
      },
      {
        id: 1,
        title: "Kesehatan Mental",
        highlight: "Adalah Prioritas",
        rightText: "Mari jaga kesehatan mentalmu bersama para ahli terbaik dari Vimind.",
        bgRight: "#8B5CF6",
        image: familyBanner,
        link: "#"
      }
    ];

  // Efek Auto-Slide setiap 3 detik (3000 ms)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 3000);
    return () => clearInterval(slideTimer);
  }, [carouselSlides.length]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-main">

        {/* NAVBAR */}
        <div className="dashboard-navbar">
          <div className="nav-left">
            <img src={logo} alt="logo" className="nav-logo" />
            <div className="divider" />
            <div className="article-menu-wrapper">
              <button
                className="nav-menu"
                onClick={() => setShowArticleMenu(!showArticleMenu)}
              >
                <span>Artikel Kesehatan Mental</span>
                <span className="dropdown-arrow">▾</span>
              </button>

              {/* DROPDOWN MENU */}
              {showArticleMenu && (
                <div className="article-menu-dropdown">
                  {news.length > 0 ? (
                    news.map((item) => (
                      <div
                        key={item.id}
                        className="article-menu-item"
                        onClick={() => window.open(item.link, "_blank")}
                      >
                        {item.title}
                      </div>
                    ))
                  ) : (
                    articlesList.map((article) => (
                      <div
                        key={article.id}
                        className="article-menu-item"
                        onClick={() => handleArticleClick(article.id)}
                      >
                        {article.title}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Buka menu mobile"
          >
            <span />
            <span />
            <span />
          </button>

          {showMobileMenu && (
            <div className="mobile-menu-dropdown">
              <button
                type="button"
                className="mobile-menu-item"
                onClick={() => {
                  setShowSidebar(true);
                  setShowMobileArticleList(false);
                  setShowMobileMenu(false);
                }}
              >
                Profile
              </button>
              <button
                type="button"
                className="mobile-menu-item"
                onClick={() => {
                  setShowMobileArticleList(true);
                  setShowMobileMenu(false);
                }}
              >
                Artikel...
              </button>
            </div>
          )}

          {showMobileArticleList && (
            <div className="mobile-article-list-dropdown">
              <div className="mobile-article-list-header">
                <span>Daftar Artikel</span>
                <button
                  type="button"
                  className="mobile-article-list-close"
                  onClick={() => setShowMobileArticleList(false)}
                >
                  ✕
                </button>
              </div>
              {news.length > 0 ? (
                news.map((item) => (
                  <div
                    key={item.id}
                    className="article-menu-item"
                    onClick={() => {
                      window.open(item.link, "_blank");
                      setShowMobileArticleList(false);
                    }}
                  >
                    {item.title}
                  </div>
                ))
              ) : (
                articlesList.map((article) => (
                  <div
                    key={article.id}
                    className="article-menu-item"
                    onClick={() => handleArticleClick(article)}
                  >
                    {article.title}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE AREA */}
          <div className="nav-profile-area">
            <button
              className={`profile-trigger ${showSidebar ? "active" : ""}`}
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <span>Profile</span>
              <img
                src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"}
                alt="Profile"
                className="profile-trigger-avatar"
              />
            </button>
          </div>

          <ProfileSidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            onOpenNicknameModal={() => setShowNicknameModal(true)}
            onOpenLogoutModal={() => setShowLogoutModal(true)}
            nickname={nickname}
            avatarUrl={avatarUrl}
            userEmail={userEmail}
            onAvatarUpdate={(newUrl) => {
              setAvatarUrl(newUrl);
              localStorage.setItem("avatar_url", newUrl);
            }}
          />
        </div>

        {/* HERO CAROUSEL */}
        <div style={{ overflow: "hidden", width: "100%", marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              transition: "transform 0.5s ease-in-out",
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >
            {carouselSlides.map((slide, index) => (
              <div className="dashboard-hero" key={slide.id} style={{ minWidth: "100%", flexShrink: 0, marginBottom: 0 }}>
                {/* Banner Kiri */}
                <div
                  className="hero-big promo-left"
                  onClick={() => slide.link !== "#" && window.open(slide.link, "_blank")}
                  style={{ cursor: slide.link !== "#" ? "pointer" : "default", display: "flex", justifyContent: "center", textAlign: "center" }}
                >
                  <div className="promo-content">
                    <h2>
                      {slide.title} <span className="highlight">{slide.highlight}</span>
                    </h2>
                    <div className="sponsor-logo" style={{ justifyContent: "center", display: "flex" }}>
                      <img src={kemenkesLogo} alt="Sponsor" />
                    </div>
                  </div>
                </div>

                {/* Banner Kanan */}
                <div className="hero-small promo-right" style={{ backgroundColor: slide.bgRight }}>
                  <div className="promo-right-content">
                    <h2 className="academy-logo">🧠 Vimind <span>academy</span></h2>
                    <p>{slide.rightText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOTS (Bisa diklik manual juga) */}
        <div className="dots">
          {carouselSlides.map((_, index) => (
            <span
              key={index}
              className={currentSlide === index ? "active" : ""}
              onClick={() => setCurrentSlide(index)}
              style={{ cursor: "pointer" }}
            />
          ))}
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
                  setShowMood(true);
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
                setShowTestOptions(true);
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

      {showTestOptions && (
        <TestOptionsModal
          onResume={handleResumeTest}
          onNewTest={handleNewTest}
          onClose={() => setShowTestOptions(false)}
        />
      )}

      {/* NICKNAME MODAL */}
      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        onSave={handleSaveNickname}
      />

      {/* NICKNAME SUCCESS MODAL */}
      <NicknameSuccessModal
        isOpen={showNicknameSuccessModal}
        onClose={() => setShowNicknameSuccessModal(false)}
      />

      {/* LOGOUT MODAL */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
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

      {/* ARTICLE MODAL */}
      <ArticleModal
        isOpen={showArticleModal}
        article={selectedArticle}
        onClose={() => setShowArticleModal(false)}
      />
      {/* ================= CHATBOT FLOAT ================= */}
      <button
        className="chatbot-float-btn"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <img src={chatbotIcon} alt="chatbot" />
      </button>

      {showChatbot && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span>Vivi <small>AI Bot</small></span>
            </div>
            <button 
              className="chatbot-close-btn" 
              onClick={() => setShowChatbot(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-body">
            {chatMessages.length === 0 && (
              <div className="chatbot-msg chatbot-msg-welcome">
                Halo{nickname !== 'User' ? ` ${nickname}` : ''}! Aku Vivi 😊 <br/>Ada yang ingin kamu ceritakan hari ini?
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-assistant'}`}
              >
                <div className="chatbot-msg-content">{msg.content}</div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="chatbot-msg-loading">
                <span className="dot-typing">Vivi sedang mengetik</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSendChat}>
            <input 
              className="chatbot-input-field"
              placeholder="Ceritakan kondisimu..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatLoading}
            />
            <button 
              className="chatbot-send-btn"
              type="submit" 
              disabled={isChatLoading || !chatInput.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;