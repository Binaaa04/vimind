import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/HomeCSS.css";
import logo from "../assets/logovimind2.png";
import heroImg from "../assets/hero.png"; // ✅ TAMBAHAN
import fiturImg from "../assets/fitur.png"; // ✅ TAMBAHAN

export default function Home() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const faqs = [
    {
      q: "Apa itu Vimind?",
      a: "Vimind adalah aplikasi untuk memahami kondisi kesehatan mental melalui tes singkat."
    },
    {
      q: "Bagaimana cara menggunakan Vimind?",
      a: "Jawab beberapa pertanyaan dan kamu akan mendapatkan hasil kondisi mentalmu."
    },
    {
      q: "Apakah hasilnya akurat?",
      a: "Hasil hanya berupa indikasi, bukan diagnosis medis."
    },
    {
      q: "Apakah data saya aman?",
      a: "Data kamu aman dan tidak dibagikan."
    }
  ];

  return (
    <div className="home">

      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-left">
          <img src={logo} alt="logo" />
        </div>

        <div className="nav-right">
          <span>Contact Us</span>
          <span>Testimoni</span>
          <span>FAQ</span>
          <button onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </div>

      {/* ✅ HERO BARU */}
      <div className="hero">
        <img src={heroImg} alt="hero" className="hero-bg" />

        <div className="hero-content">
          <h1>
            Kadang kita ngerasa ga baik-baik aja,
            tapi sulit jelasin kenapa.
          </h1>

          <p>
            Vimind bantu kamu memahami kondisi kesehatan mentalmu
          </p>

          <button onClick={() => navigate("/deteksi/soal")}>
            Coba tes gratis →
          </button>
        </div>
      </div>

      {/* FITUR */}
      <div className="fitur">
        <div className="fitur-header">
          <span className="badge">Vimind punya apa sih ?</span>
          <h2>Fitur menarik yang bisa kamu coba</h2>
          <p>
            Berikut adalah fitur menarik yang bisa bantu kamu memahami
            kesehatan mental setiap hari.
          </p>
        </div>

        <div className="fitur-image">
          <img src={fiturImg} alt="fitur" />
        </div>
      </div>

      {/* TESTIMONI */}
      <div className="testimoni">
        <div className="testimoni-header">
          <span className="badge">Testimoni</span>
          <h2>Kisah para teman teman yang udah pernah pake vimind</h2>
          <p>
            Temukan cerita dari para pengguna yang telah merasakan manfaat memahami kesehatan mental
          </p>
        </div>

        <div className="testimoni-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="testimonial-card">
              
              <div className="card-content">
                <h4>Operasional jadi lebih cepat dan rapi.</h4>
                <p>
                  Vimind membantu saya lebih sadar dengan kondisi perasaan saya setiap hari...
                </p>
              </div>

              <div className="card-footer">
                <span className="name">Andi Wijaya</span>
                <div className="stars">⭐⭐⭐⭐⭐</div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="faq">
        <div className="faq-header">
          <span className="badge">FAQ</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        {faqs.map((item, i) => (
          <div key={i} className={`faq-item ${active === i ? "active" : ""}`}>
            <div
              className="faq-q"
              onClick={() => setActive(active === i ? null : i)}
            >
              {item.q}
              <span>{active === i ? "-" : "+"}</span>
            </div>
            <div className="faq-a">{item.a}</div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-container">
          <div>
            <h2>Vimind</h2>
            <p>© 2026 Vimind</p>
          </div>

          <div>
            <h3>Perusahaan</h3>
            <p>Home</p>
            <p>Fitur</p>
            <p>Kontak</p>
          </div>

          <div>
            <h3>Information</h3>
            <p>Cara Menggunakan</p>
            <p>Privasi</p>
            <p>FAQ</p>
          </div>

          <div>
            <h3>Contact</h3>
            <p>Malang, Indonesia</p>
            <p>+62 811-9757-222</p>
          </div>
        </div>
      </div>

    </div>
  );
}