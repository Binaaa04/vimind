import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Result() {
    const navigate = useNavigate();

    const [showLogin, setShowLogin] = useState(true);
    const [loading, setLoading] = useState(false); // ← PINDAH KE SINI

    return (
        <div className="result-page">

            {/* HEADER */}
            <div className="result-header">
                <div>
                    <h1>Mari Kita Lihat Hasil Tesmu</h1>
                    <p>
                        anda sedang mengalami <b>Depresi Ringan</b><br />
                        Dengan Presentasi <b>66%</b>
                    </p>
                </div>

                <div className="avatar"></div>
            </div>

            {/* CARD */}
            <div className="result-card">
                <h2>Hasil Skrining Kesehatan Mental</h2>

                <p>
                    Berdasarkan jawaban kuesioner yang telah diisi, kondisi Anda menunjukkan
                    indikasi depresi ringan.
                </p>

                <h3>Saran Perbaikan Kondisi</h3>
                <ul>
                    <li>Jaga pola tidur</li>
                    <li>Olahraga ringan</li>
                    <li>Kurangi stres</li>
                    <li>Berbicara dengan orang terdekat</li>
                </ul>

                <h3>Saran Rujukan Profesional</h3>
                <p>
                    Jika gejala berlangsung lebih dari dua minggu,
                    disarankan berkonsultasi dengan profesional.
                </p>
            </div>

            {/* LOGIN POPUP */}
            {showLogin && (
                <div className="overlay">
                    <div className="login-modal">
                        <h2>Silahkan Login</h2>
                        <p>Masuk untuk membuka lebih banyak fitur</p>

                        <button
                            disabled={loading}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => {
                                    navigate("/login");
                                }, 1500);
                            }}
                        >
                            {loading ? "Mengalihkan..." : "Login"}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}