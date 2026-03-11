import { useState, useEffect } from "react";
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
import { articlesList } from "../data/articlesData";
import { getProfile, updateProfile } from "../services/api";
import logo from "../assets/logovimind2.png";
import kemenkesLogo from "../assets/kemenkes_logo.png";
import familyBanner from "../assets/family_banner.png";
import "../css/DashboardCSS.css";

const Dashboard = () => {
  const [showMood, setShowMood] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showArticleMenu, setShowArticleMenu] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showNicknameSuccessModal, setShowNicknameSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          if (res.data?.name) {
            setNickname(res.data.name);
            localStorage.setItem("nickname", res.data.name);
          }
          if (res.data?.avatar_url) {
            setAvatarUrl(res.data.avatar_url);
            localStorage.setItem("avatar_url", res.data.avatar_url);
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

  const handleArticleClick = (articleId) => {
    const article = articlesList.find(a => a.id === articleId);
    setSelectedArticle(article);
    setShowArticleModal(true);
    setShowArticleMenu(false); // Tutup dropdown setelah klik
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("nickname");
      localStorage.removeItem("mood");
      localStorage.removeItem("quizFrom");
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
      alert("Gagal logout: " + error.message);
    }
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
                Artikel Kesehatan Mental ▾
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

            {/* SIDEBAR */}
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
                <div className="hero-big promo-left">
                  <div className="promo-content">
                    <h2 onClick={() => slide.link !== "#" && window.open(slide.link, "_blank")} style={{ cursor: slide.link !== "#" ? "pointer" : "default" }}>
                      {slide.title} <span className="highlight">{slide.highlight}</span>
                    </h2>
                    <div className="sponsor-logo">
                      <img src={kemenkesLogo} alt="Sponsor" />
                    </div>
                  </div>
                  <div className="promo-image">
                    <img src={slide.image} alt="Ilustrasi" />
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
    </div>
  );
};

export default Dashboard;