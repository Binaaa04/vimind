import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/HomeCSS.css";
import { getPublicFAQ, getPublicTestimonials } from "../services/api";
import logo from "../assets/logovimind2.png";
import heroImg from "../assets/BgLanding.svg";
import fiturImg from "../assets/fitur.png";
import arrowUp from "../assets/Upbutton.svg";

export default function Home() {
  useEffect(() => {
    document.title = "Selamat Datang | Vimind";
  }, []);
  const navigate = useNavigate();

  // ==========================================
  // 1. STATE & DATA
  // ==========================================
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  
  // STATE PENTING UNTUK NAVBAR MELAYANG
  const [isPillSticky, setIsPillSticky] = useState(false);

  // Deteksi scroll untuk memunculkan tombol Navigasi Scroll & Efek Sticky
  useEffect(() => {
    const handleScroll = () => {
      // Logic untuk Tombol Panah Atas
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }

      // Logic untuk Navbar Kapsul Sticky
      if (window.scrollY > 80) {
        setIsPillSticky(true);
      } else {
        setIsPillSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi untuk scroll mulus ke paling atas
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Data FAQ — diambil dari API, fallback ke static
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
  const [faqData, setFaqData] = useState(STATIC_FAQ);

  // Fetch Data (FAQ & Testimonials)
  useEffect(() => {
    getPublicFAQ()
      .then((res) => {
        const data = res.data || [];
        const filled = data.filter((f) => f.question?.trim());
        if (filled.length > 0) setFaqData(filled);
      })
      .catch(() => {});
      
    getPublicTestimonials()
      .then((res) => {
        const data = res.data || [];
        if (data.length > 0) setTestimonialsData(data);
      })
      .catch(() => {});
  }, []);

  // Data Testimoni — diambil dari API, fallback ke static
  const STATIC_TESTIMONIALS = [
    { id: 1, name: "Andi Wijaya", comment: "Vimind membantu saya lebih sadar dengan kondisi perasaan saya setiap hari...", rating: 5 },
    { id: 2, name: "Siti Nurhaliza", comment: "Sangat mudah dipahami dan hasilnya cukup akurat untuk introspeksi diri.", rating: 4 },
    { id: 3, name: "Budi Santoso", comment: "Desain UI-nya sangat nyaman dilihat dan fiturnya mudah digunakan.", rating: 5 },
    { id: 4, name: "Rina Kartika", comment: "Aplikasi yang bagus untuk mulai peduli pada mental health kita sehari-hari.", rating: 4 },
    { id: 5, name: "Eko Prasetyo", comment: "Operasional jadi lebih cepat dan rapi berkat fitur yang sangat membantu.", rating: 5 },
    { id: 6, name: "Dian Pelangi", comment: "Saya merasa lebih teratur dan tenang setelah rutin menggunakan fitur trackingnya.", rating: 5 }
  ];
  const [testimonialsData, setTestimonialsData] = useState(STATIC_TESTIMONIALS);

  // Fungsi Toggle FAQ
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // ==========================================
  // 2. TAMPILAN UI (RENDER)
  // ==========================================
  return (
    <div className="home">

      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-left">
          <img src={logo} alt="logo" />
        </div>

        {/* HAMBURGER BUTTON */}
        <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-right ${isMenuOpen ? "open" : ""}`}>
          
          {/* PERHATIKAN BARIS INI: Penambahan isPillSticky di dalam className */}
          <div className={`nav-links-pill ${isPillSticky ? "is-sticky" : ""}`}>
            <span onClick={() => setIsMenuOpen(false)}>Contact Us</span>
            <span onClick={() => setIsMenuOpen(false)}>Testimoni</span>
            <span onClick={() => setIsMenuOpen(false)}>FAQ</span>
          </div>
          
          <button className="btn-signin" onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>Sign in</button>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <img src={heroImg} alt="hero" className="hero-bg" />
        <div className="hero-content">
          <h1>Kadang Kita Ngerasa Ga Baik-baik Aja, Tapi Sulit Jelasin Kenapa.</h1>
          <p>Vimind bantu kamu memahami kondisi kesehatan mentalmu</p>
          <button onClick={() => navigate("/deteksi/soal")}>Coba tes gratis →</button>
        </div>
      </div>

      {/* FITUR */}
      <div className="fitur">
        <div className="fitur-header">
          <span className="badge"><b>Vimind punya apa sih ?</b></span>
          <h2>Fitur menarik yang bisa kamu coba</h2>
          <p>Berikut adalah fitur menarik yang bisa bantu kamu memahami kesehatan mental setiap hari.</p>
        </div>
        <div className="fitur-image">
          <img src={fiturImg} alt="fitur" />
        </div>
      </div>

      {/* TESTIMONI MARQUEE SECTION */}
      <div className="testimoni">
        <div className="testimoni-header">
          <span className="badge">Testimoni</span>
          <h2>Kisah para teman teman yang udah pernah pake vimind</h2>
          <p>Temukan cerita dari para pengguna yang telah merasakan manfaat memahami kesehatan mental bersama ViMind.</p>
        </div>

        <div className="marquee-container">
          {/* Row 1: Slide Left */}
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

          {/* Row 2: Slide Right */}
          <div className="marquee-row marquee-right">
            <div className="marquee-content">
              {[...testimonialsData, ...testimonialsData].reverse().map((item, idx) => (
                <div key={idx} className="testimonial-card">
                  <h4 className="testimoni-title">Vimind sangat membantu sekali.</h4>
                  <p className="testimoni-text">"{item.text}"</p>
                  <div className="testimoni-footer">
                    <span className="testimoni-name">{item.name}</span>
                    <div className="stars">{"⭐".repeat(item.rating)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Slide Left (Offset) */}
          <div className="marquee-row marquee-left" style={{ animationDuration: '45s' }}>
            <div className="marquee-content">
              {[...testimonialsData, ...testimonialsData].map((item, idx) => (
                <div key={idx} className="testimonial-card">
                  <h4 className="testimoni-title">Sangat direkomendasikan untu teman-teman.</h4>
                  <p className="testimoni-text">"{item.text}"</p>
                  <div className="testimoni-footer">
                    <span className="testimoni-name">{item.name}</span>
                    <div className="stars">{"⭐".repeat(item.rating)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-badge">
            FAQ
          </div>
          <h2 className="faq-title">
            <span className="question-mark">?</span>
            Frequently Asked Questions
          </h2>
          <p className="faq-subtitle">
            Temukan jawaban dari berbagai pertanyaan seputar Vimind. Di sini kamu bisa memahami cara kerja fitur, tes kesehatan mental, serta bagaimana Vimind membantu kamu lebih mengenali dan menjaga kondisi emosimu.
          </p>

          <div className="faq-list">
            {faqData.map((item, index) => (
              <div key={item.id} className={`faq-item ${openFaqIndex === index ? 'active' : ''}`}>
                <div className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{item.question}</span>
                  <span className="faq-icon">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L7 8L13 1" stroke="#2e1c6b" strokeWidth="2" strokeLinecap="round" />
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
      </section>

      {/* FOOTER */}
      {/* <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h2 className="footer-logo">Vimind</h2>
            <div className="social-icons">
              <span className="social-icon">f</span>
              <span className="social-icon">📷</span>
              <span className="social-icon">🐦</span>
              <span className="social-icon">🎵</span>
            </div>
          </div>

          <div className="footer-col">
            <h3>PERUSAHAAN</h3>
            <ul>
              <li>Home</li>
              <li>Fitur</li>
              <li>Kontak Kami</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>INFORMATION</h3>
            <ul>
              <li>Apa itu Kesehatan Mental</li>
              <li>Cara Menggunakan Vimind</li>
              <li>Payment Information</li>
              <li>Privasi & Keamanan Data</li>
              <li>Syarat & Ketentuan</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h3>CONTACT</h3>
            <div className="contact-item">
              <span className="contact-icon">🏠</span>
              <p>Jl. Niaga No.3, Ciptomulyo, Kec. Sukun,<br />Kota Malang, Jawa Timur 65148</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon">💬</span>
              <p>+62 811-9757-222</p>
            </div>
          </div>
        </div>
      </footer> */}

      <div className={`scroll-nav-container-3d ${showScroll ? "show" : ""}`}>
        <button className="scroll-btn-3d-circle" onClick={scrollToTop} title="Kembali ke atas">
          <img src={arrowUp} alt="Panah Ke Atas" style={{ width: '55px', height: '55px' }} />
        </button>
      </div>
    </div>
  );
}