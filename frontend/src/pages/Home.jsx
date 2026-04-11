import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/HomeCSS.css";
import logo from "../assets/logovimind2.png";
import heroImg from "../assets/hero.png";
import fiturImg from "../assets/fitur.png";

export default function Home() {
  const navigate = useNavigate();

  // ==========================================
  // 1. STATE & DATA
  // ==========================================
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Data FAQ
  const faqData = [
    {
      id: 1,
      question: "Apa itu Vimind?",
      answer: "Vimind adalah aplikasi yang membantu kamu memahami kondisi kesehatan mental melalui tes psikologi sederhana, daily mood check, serta rangkuman statistik yang menunjukkan perkembangan kondisi emosimu dari waktu ke waktu."
    },
    {
      id: 2,
      question: "Bagaimana cara menggunakan Vimind?",
      answer: "Kamu hanya perlu menjawab beberapa pertanyaan pada tes yang tersedia di Vimind. Setelah selesai, kamu akan mendapatkan gambaran kondisi mentalmu beserta insight yang dapat membantu kamu lebih memahami perasaanmu."
    },
    {
      id: 3,
      question: "Apakah hasil tes di Vimind akurat?",
      answer: "Tes di Vimind dirancang sebagai alat refleksi diri untuk membantu kamu memahami kondisi emosionalmu. Hasilnya bukan diagnosis medis, namun dapat menjadi gambaran awal sebelum berkonsultasi dengan profesional."
    },
    {
      id: 4,
      question: "Apa itu Daily Mood Test?",
      answer: "Daily Mood Test adalah fitur untuk mencatat perasaanmu setiap hari agar kamu bisa memantau pola emosimu."
    },
    {
      id: 5,
      question: "Apakah data saya aman di Vimind?",
      answer: "Ya, privasi dan keamanan data pengguna adalah prioritas utama kami."
    },
    {
      id: 6,
      question: "Apakah ada biaya berlangganan?",
      answer: "Saat ini fitur dasar Vimind dapat digunakan secara gratis."
    },
    {
      id: 7,
      question: "Apakah saya harus login untuk menggunakan Vimind?",
      answer: "Ya, login diperlukan agar kami bisa menyimpan riwayat perkembangan kondisimu dengan aman."
    },
    {
      id: 8,
      question: "Apakah Vimind tersedia di Android dan iOS?",
      answer: "Saat ini Vimind dapat diakses melalui web browser di berbagai perangkat."
    }
  ];

  // Data Testimoni
  const testimonialsData = [
    { id: 1, name: "Andi Wijaya", text: "Vimind membantu saya lebih sadar dengan kondisi perasaan saya setiap hari...", rating: 5 },
    { id: 2, name: "Siti Nurhaliza", text: "Sangat mudah dipahami dan hasilnya cukup akurat untuk introspeksi diri.", rating: 4 },
    { id: 3, name: "Budi Santoso", text: "Desain UI-nya sangat nyaman dilihat dan fiturnya mudah digunakan.", rating: 5 },
    { id: 4, name: "Rina Kartika", text: "Aplikasi yang bagus untuk mulai peduli pada mental health kita sehari-hari.", rating: 4 },
    { id: 5, name: "Eko Prasetyo", text: "Operasional jadi lebih cepat dan rapi berkat fitur yang sangat membantu.", rating: 5 },
    { id: 6, name: "Dian Pelangi", text: "Saya merasa lebih teratur dan tenang setelah rutin menggunakan fitur trackingnya.", rating: 5 }
  ];

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
          <span onClick={() => setIsMenuOpen(false)}>Contact Us</span>
          <span onClick={() => setIsMenuOpen(false)}>Testimoni</span>
          <span onClick={() => setIsMenuOpen(false)}>FAQ</span>
          <button onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>Sign in</button>
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
              {[...testimonialsData, ...testimonialsData].map((item, idx) => (
                <div key={idx} className="testimonial-card">
                   <h4 className="testimoni-title">Operasional jadi lebih cepat dan rapi.</h4>
                  <p className="testimoni-text">"{item.text}"</p>
                  <div className="testimoni-footer">
                    <span className="testimoni-name">{item.name}</span>
                    <div className="stars">{"⭐".repeat(item.rating)}</div>
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
              <div
                key={item.id}
                className={`faq-item ${openFaqIndex === index ? 'active' : ''}`}
              >
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
      <footer className="footer">
        <div className="footer-container">

          {/* Kolom 1: Logo & Sosial Media */}
          <div className="footer-brand">
            {/* Menggunakan h2 sementara, ganti dengan <img> jika kamu punya gambar logo putih */}
            <h2 className="footer-logo">Vimind</h2>
            <div className="social-icons">
              {/* Ini adalah karakter unicode/emoji sebagai placeholder ikon */}
              <span className="social-icon">f</span>
              <span className="social-icon">📷</span>
              <span className="social-icon">🐦</span>
              <span className="social-icon">🎵</span>
            </div>
          </div>

          {/* Kolom 2: Perusahaan */}
          <div className="footer-col">
            <h3>PERUSAHAAN</h3>
            <ul>
              <li>Home</li>
              <li>Fitur</li>
              <li>Kontak Kami</li>
            </ul>
          </div>

          {/* Kolom 3: Information */}
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

          {/* Kolom 4: Contact */}
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
      </footer>

    </div>
  );
}