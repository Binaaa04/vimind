import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/HomeCSS.css";
import { getPublicFAQ, getPublicTestimonials } from "../services/api";
import logo from "../assets/logovimind2.png";
import heroImg from "../assets/BgLanding.svg";
import arrowUp from "../assets/Upbutton.svg";

export default function Home() {
  useEffect(() => {
    document.title = "Selamat Datang | Vimind";
  }, []);
  const navigate = useNavigate();

  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [isPillSticky, setIsPillSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
      setIsPillSticky(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const STATIC_FAQ = [
    { id: 1, question: "Apa itu Vimind?", answer: "Vimind adalah aplikasi yang membantu kamu memahami kondisi kesehatan mental melalui tes psikologi sederhana..." },
    { id: 2, question: "Bagaimana cara menggunakan Vimind?", answer: "Kamu hanya perlu menjawab beberapa pertanyaan pada tes yang tersedia di Vimind..." },
    { id: 3, question: "Apakah hasil tes di Vimind akurat?", answer: "Tes di Vimind dirancang sebagai alat refleksi diri. Hasilnya bukan diagnosis medis..." },
    { id: 4, question: "Apa itu Daily Mood Test?", answer: "Daily Mood Test adalah fitur untuk mencatat perasaanmu setiap hari agar kamu bisa memantau pola emosimu." },
    { id: 5, question: "Apakah data saya aman di Vimind?", answer: "Ya, privasi dan keamanan data pengguna adalah prioritas utama kami." },
    { id: 6, question: "Apakah ada biaya berlangganan?", answer: "Saat ini fitur dasar Vimind dapat digunakan secara gratis." },
    { id: 7, question: "Apakah saya harus login untuk menggunakan Vimind?", answer: "Ya, login diperlukan agar kami bisa menyimpan riwayat perkembangan kondisimu dengan aman." },
    { id: 8, question: "Apakah Vimind tersedia di Android dan iOS?", answer: "Saat ini Vimind dapat diakses melalui web browser di berbagai perangkat." },
  ];
  
  const STATIC_TESTIMONIALS = [
    { id: 1, name: "Andi Wijaya", comment: "Vimind membantu saya lebih sadar dengan kondisi perasaan saya setiap hari...", rating: 5 },
    { id: 2, name: "Siti Nurhaliza", comment: "Sangat mudah dipahami dan hasilnya cukup akurat untuk introspeksi diri.", rating: 4 },
    { id: 3, name: "Budi Santoso", comment: "Desain UI-nya sangat nyaman dilihat dan fiturnya mudah digunakan.", rating: 5 },
    { id: 4, name: "Rina Kartika", comment: "Aplikasi yang bagus untuk mulai peduli pada mental health kita sehari-hari.", rating: 4 },
    { id: 5, name: "Eko Prasetyo", comment: "Operasional jadi lebih cepat dan rapi berkat fitur yang sangat membantu.", rating: 5 },
    { id: 6, name: "Dian Pelangi", comment: "Saya merasa lebih teratur dan tenang setelah rutin menggunakan fitur trackingnya.", rating: 5 }
  ];

  const [faqData, setFaqData] = useState(STATIC_FAQ);
  const [testimonialsData, setTestimonialsData] = useState(STATIC_TESTIMONIALS);

  useEffect(() => {
    getPublicFAQ().then((res) => {
      const data = res.data || [];
      const filled = data.filter((f) => f.question?.trim());
      if (filled.length > 0) setFaqData(filled);
    }).catch(() => {});
    getPublicTestimonials().then((res) => {
      const data = res.data || [];
      if (data.length > 0) setTestimonialsData(data);
    }).catch(() => {});
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="home">
      <nav className={`navbar ${isPillSticky ? "navbar-sticky" : ""}`}>
        <div className="nav-left">
          <img src={logo} alt="Vimind Logo" />
        </div>
        <div className={`mobile-backdrop ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}></div>
        <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
          {isMenuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-right ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-links-pill">
            <span onClick={() => scrollToSection("fitur")}>Fitur</span>
            <span onClick={() => scrollToSection("testimoni")}>Testimoni</span>
            <span onClick={() => scrollToSection("faq")}>FAQ</span>
          </div>
          <button className="btn-signin" onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>Sign In</button>
        </div>
      </nav>

      <header className="hero">
        <img src={heroImg} alt="" className="hero-bg" />
        <div className="hero-content">
          <h1>Kadang Kita Ngerasa Ga Baik-baik Aja, Tapi Sulit Jelasin Kenapa.</h1>
          <p>Vimind bantu kamu memahami kondisi kesehatan mentalmu dengan pendekatan yang personal dan aman.</p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => navigate("/deteksi/soal")}>Coba Tes Gratis →</button>
          </div>
        </div>
      </header>

      <section id="fitur" className="fitur">
        <div className="fitur-header">
          <span className="badge">Eksplorasi Vimind</span>
          <h2>Kenali dirimu lebih baik lagi</h2>
          <p>Berikut adalah fitur menarik yang bisa bantu kamu buat lebih memahami dan menjaga kesehatan mental setiap hari.</p>
        </div>
        <div className="fitur-grid">
          <div className="fitur-card">
            <div className="fitur-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <h3>Deteksi Dini Cerdas</h3>
            <p>Refleksi diri instan melalui tes yang dirancang oleh pakar untuk memahami kondisi psikologismu saat ini.</p>
          </div>
          <div className="fitur-card">
            <div className="fitur-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
            </div>
            <h3>Daily Mood Tracker</h3>
            <p>Pantau dinamika emosimu setiap hari. Lihat pola perasaanmu melalui visualisasi grafik yang intuitif.</p>
          </div>
          <div className="fitur-card">
            <div className="fitur-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3>Ruang Aman & Pribadi</h3>
            <p>Privasi adalah prioritas. Seluruh data dan hasil tesmu dienkripsi secara aman, memberikanmu ketenangan pikiran.</p>
          </div>
        </div>
      </section>

      <section id="testimoni" className="testimoni">
        <div className="testimoni-header">
          <span className="badge">Testimoni</span>
          <h2>Kisah Perjalanan Bersama ViMind</h2>
          <p>Apa kata mereka yang telah menemukan ketenangan dan kejernihan pikiran melalui refleksi harian.</p>
        </div>
        <div className="marquee-container">
          <div className="marquee-row marquee-left">
            <div className="marquee-content">
              {[...testimonialsData, ...testimonialsData].map((t, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="testimoni-stars">
                    {"★".repeat(t.rating)}
                    <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - t.rating)}</span>
                  </div>
                  <p>"{t.comment || t.text}"</p>
                  <div className="testimoni-user">
                    <div className="testimoni-avatar">{t.name ? t.name[0] : "?"}</div>
                    <span className="testimoni-name">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="marquee-row marquee-right">
            <div className="marquee-content">
              {[...testimonialsData, ...testimonialsData].reverse().map((t, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="testimoni-stars">
                    {"★".repeat(t.rating)}
                    <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - t.rating)}</span>
                  </div>
                  <p>"{t.comment || t.text}"</p>
                  <div className="testimoni-user">
                    <div className="testimoni-avatar">{t.name ? t.name[0] : "?"}</div>
                    <span className="testimoni-name">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="faq-container">
          
          {/* KOLOM ATAS (Header) */}
          <div className="faq-header">
            <span className="faq-badge">FAQ</span>
            <h2 className="faq-title">
              <span className="red-question"></span> Frequently Asked<br />Questions
            </h2>
            <p className="faq-subtitle">
              Temukan jawaban dari berbagai pertanyaan seputar Vimind. Di sini kamu bisa memahami cara kerja fitur, tes kesehatan mental, serta bagaimana Vimind membantu kamu lebih mengenali dan menjaga kondisi emosimu.
            </p>
          </div>

          {/* KOLOM BAWAH (Daftar FAQ) */}
          <div className="faq-right">
            <div className="faq-list">
              {faqData && faqData.map((item, index) => (
                <div key={item.id} className={`faq-item ${openFaqIndex === index ? "active" : ""}`}>
                  <div className="faq-question" onClick={() => toggleFaq(index)}>
                    <span>{item.question}</span>
                    <span className="faq-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <div className={`scroll-nav-container-3d ${showScroll ? "show" : ""}`}>
        <button className="scroll-btn-3d-circle" onClick={scrollToTop} aria-label="Scroll to top">
          <img src={arrowUp} alt="" style={{ width: "52px", height: "52px" }} />
        </button>
      </div>
    </div>
  );
}
