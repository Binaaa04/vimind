import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import SummaryModal from "@/features/detection/components/SummaryModal";
import MoodResultModal from "@/features/detection/components/MoodResultModal";
import { useNavigate } from "react-router-dom";
import MoodModal from "@/features/detection/components/MoodModal";
import ProfileSidebar from "@/features/dashboard/components/ProfileSidebar";
import NicknameModal from "@/features/auth/components/NicknameModal";
import NicknameSuccessModal from "@/features/auth/components/NicknameSuccessModal";
import LogoutModal from "@/shared/components/LogoutModal";
import TestOptionsModal from "@/features/detection/components/TestOptionsModal";
import { getProfile, updateProfile } from "@/features/auth/api";
import { sendChatMessage, getBanners } from "@/features/dashboard/api";
import logo from "@/assets/logovimind2.png";

import chatbotIcon from "@/assets/chatbot.png";
import "./Dashboard.css"; 

const Dashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard Utama | Vimind";
  }, []);

  // === STATE MODALS ===
  const [showSummary, setShowSummary] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showNicknameSuccessModal, setShowNicknameSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [showMood, setShowMood] = useState(false);

  // === STATE CHAT ===
  const [chatMessages, setChatMessagesRaw] = useState(() => {
    try {
      const saved = sessionStorage.getItem("vivi_chat");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const setChatMessages = (updater) => {
    setChatMessagesRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sessionStorage.setItem("vivi_chat", JSON.stringify(next));
      return next;
    });
  };

  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // === STATE USER ===
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "...");
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatar_url") || "");
  const [moodToast, setMoodToast] = useState("");
  const [banners, setBanners] = useState([]);

  const mood = localStorage.getItem("mood");

  const checkShouldShowMood = () => {
    const lastMoodDate = localStorage.getItem("mood_date");
    const today = new Date().toDateString();
    return lastMoodDate !== today;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          const res = await getProfile(); // Email removed, uses JWT
          const name = res.data?.name || user.user_metadata?.full_name || user.email.split("@")[0];
          const avatar = res.data?.avatar_url || "";

          setNickname(name);
          setAvatarUrl(avatar);

          localStorage.setItem("nickname", name);
          if (avatar) {
            localStorage.setItem("avatar_url", avatar);
          } else {
            localStorage.removeItem("avatar_url");
          }

          if (!isAdmin && (!res.data || !res.data.birth_date)) {
            navigate("/lengkapi-biodata", { replace: true });
          }
        } catch (err) {
          console.error("Profile fetch error, attempting to auto-create:", err);
          if (!isAdmin) {
            try {
              const fallbackName = user.user_metadata?.full_name || user.email.split("@")[0];
              const avatar = user.user_metadata?.avatar_url || "";
              await updateProfile(user.email, fallbackName, avatar, "");
              localStorage.setItem("nickname", fallbackName);
              if (avatar) {
                localStorage.setItem("avatar_url", avatar);
              } else {
                localStorage.removeItem("avatar_url");
              }
              console.log("User auto-created in backend during OAuth login.");
              navigate("/lengkapi-biodata", { replace: true });
            } catch (createErr) {
              console.error("Failed to auto-create user during OAuth login:", createErr);
            }
          }
        } finally {
          setIsProfileLoading(false);
        }
      }
    };

    const fetchBanners = async () => {
      try {
        const response = await getBanners();
        setBanners(response.data);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };

    fetchProfile();
    fetchBanners();

    if (checkShouldShowMood()) {
      setShowMood(true);
    }
  }, [user, isAdmin, navigate]);

  const handleSaveNickname = async (newNickname) => {
    const finalNickname = newNickname?.trim() || "User";
    try {
      await updateProfile("", finalNickname); // email empty, uses JWT
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
    const body = chatBodyRef.current;
    if (!body) return;
    const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 80;
    if (isNearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  const handleMoodSelected = async (selectedMood) => {
    setMoodToast(`Mood "${selectedMood}" tersimpan! ✓`);
    setTimeout(() => setMoodToast(""), 3000);
  };

  const fetchChatbotReply = async (newMessages) => {
    try {
      setIsChatLoading(true);
      const res = await sendChatMessage("", newMessages); // uses JWT

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
      await signOut();
      localStorage.removeItem("nickname");
      localStorage.removeItem("avatar_url");
      localStorage.removeItem("mood");
      localStorage.removeItem("mood_date");
      sessionStorage.removeItem("vivi_chat");
      sessionStorage.removeItem("vimind_quiz_answers");
      sessionStorage.removeItem("vimind_quiz_page");
      sessionStorage.removeItem("vimind_quiz_mode");
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
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

  // Data isi carousel (Prioritaskan Banners dari Admin, lalu gabung News API)
  const carouselSlides = [
    ...(banners || [])
      .filter((b) => b.title?.trim() || b.image_url?.trim())
      .map((b) => ({
        id: `banner-${b.id}`,
        title: b.title || "Vimind Promo",
        highlight: "Promo",
        rightText: "Konten pilihan admin khusus buat kamu.",
        bgRight: "#8B5CF6",
        image: b.image_url,
        link: b.link_url
      }))
  ];

  // Tidak ada fallback — carousel hanya muncul kalau ada konten dari admin/news

  // Efek Auto-Slide setiap 3 detik (3000 ms)
  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 3000);
    return () => clearInterval(slideTimer);
  }, [carouselSlides.length]);

  if (isProfileLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29' }}>
        <p style={{ color: 'white', fontFamily: 'Inter' }}>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-main">

        {/* NAVBAR */}
        <div className="dashboard-navbar">
          <div className="nav-left">
            <img src={logo} alt="logo" className="nav-logo" />

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
                  setShowMobileMenu(false);
                }}
              >
                Profile
              </button>
            </div>
          )}


          {/* PROFILE AREA */}
          <div className="nav-profile-area" style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            {/* PROFILE */}
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
            userEmail={user?.email}
            isAdmin={isAdmin}
            onAvatarUpdate={(newUrl) => {
              setAvatarUrl(newUrl);
              localStorage.setItem("avatar_url", newUrl);
            }}
          />
        </div>

        {/* HERO CAROUSEL — hanya muncul kalau ada slide */}
        {carouselSlides.length > 0 ? (
          <>
            <div className="carousel-container">
              <div 
                className="carousel-track"
                style={{
                  transform: `translateX(calc(-${currentSlide * 100}% - ${currentSlide * 15}px))`
                }}
              >
                {carouselSlides.map((slide, index) => {
                  const nextSlide = carouselSlides[(index + 1) % carouselSlides.length];

                  return (
                    <div className="dashboard-hero" key={slide.id}>
                      
                      {/* Banner Kiri (Slide Aktif) */}
                      <div
                        className="hero-big promo-left"
                        onClick={() => slide.link !== "#" && window.open(slide.link, "_blank")}
                        style={{ cursor: slide.link !== "#" ? "pointer" : "default" }}
                      >
                        {slide.image && (
                          <img
                            src={slide.image}
                            alt={slide.title || "Vimind Promo Banner"}
                            className="promo-image-cover"
                          />
                        )}
                      </div>

                      {/* Banner Kanan (Peek Image Selanjutnya) */}
                      <div
                        className="hero-small promo-right"
                        onClick={() => nextSlide.link !== "#" && window.open(nextSlide.link, "_blank")}
                        style={{ cursor: nextSlide.link !== "#" ? "pointer" : "default" }}
                      >
                        {nextSlide.image && (
                          <img
                            src={nextSlide.image}
                            alt={nextSlide.title || "Vimind Promo Banner Preview"}
                            className="promo-image-cover"
                          />
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* DOTS NAVIGATION */}
            <div className="dots">
              {carouselSlides.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={currentSlide === index ? "active" : ""}
                />
              ))}
            </div>
          </>
        ) : (
          /* EMPTY STATE: Tampil kalau tidak ada banner dari admin */
          <div className="dashboard-empty-banner">
            <span className="empty-banner-emoji">💜</span>
            <div className="empty-banner-text">
              <p className="empty-banner-title">
                Selamat datang di Vimind!
              </p>
              <p className="empty-banner-subtitle">
                Gunakan fitur di bawah untuk mulai memantau kesehatan mentalmu.
              </p>
            </div>
          </div>
        )}

        {/* FEATURE */}
        <div className="bottom-section">

          <div className="bottom-left">
            {/* FIX #1: Skeleton loading pada greeting agar tidak glitch */}
            <div className="welcome-greeting" style={{ minHeight: '24px' }}>
              {nickname === '...' ? (
                <span className="skeleton-text" style={{ 
                  display: 'inline-block', 
                  width: '120px', 
                  height: '18px', 
                  borderRadius: '4px', 
                  backgroundColor: '#e9ddff',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }} />
              ) : (
                <>
                  <span className="wave-emoji" style={{ marginRight: '6px', fontSize: '1.1rem' }}>👋</span>
                  <span className="welcome-text">
                    Halo, <strong className="user-name-highlight">{nickname && nickname !== '...' ? nickname.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'User'}</strong>!
                  </span>
                </>
              )}
            </div>
            <h2 className="welcome-subtitle">Mari cek dan coba beberapa manfaat Vimind</h2>
          </div>

          <div className="bottom-cards feature-cards">

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
                {/* FIX UX #4: Microcopy kontekstual */}
                <p>{mood ? `Mood hari ini: ${mood} — Tap untuk lihat rangkuman` : "Belum isi mood hari ini. Tap untuk mulai."}</p>
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
                <p>Mulai tes psikologi untuk memahami kondisi mentalmu saat ini.</p>
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
                <p>Pantau perkembangan kondisi mentalmu dari waktu ke waktu.</p>
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
        <MoodModal 
          onClose={() => setShowMood(false)} 
          onSelect={handleMoodSelected} 
        />
      )}

      {/* TOAST FEEDBACK */}
      {moodToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10B981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {moodToast}
        </div>
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* FIX UX #2: Tombol Reset Chat */}
              {chatMessages.length > 0 && (
                <button
                  className="chatbot-close-btn"
                  title="Mulai percakapan baru"
                  onClick={() => {
                    setChatMessages([]);
                    sessionStorage.removeItem("vivi_chat");
                  }}
                  style={{ fontSize: '13px', opacity: 0.7 }}
                >
                  🔄
                </button>
              )}
              <button
                className="chatbot-close-btn"
                onClick={() => setShowChatbot(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-body" ref={chatBodyRef}>
            {chatMessages.length === 0 && (
              <div className="chatbot-msg chatbot-msg-welcome">
                Halo{nickname !== 'User' ? ` ${nickname}` : ''}! Aku Vivi 😊 <br />Ada yang ingin kamu ceritakan hari ini?
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
