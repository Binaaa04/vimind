import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Result() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true); // Default true biar gak flicker pas loading
    const [showLogin, setShowLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const [diagnosis, setDiagnosis] = useState(null);

    useEffect(() => {
        const checkLogin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const loggedIn = !!session;
            setIsLogin(loggedIn);
            setShowLogin(!loggedIn);
        };
        checkLogin();

        // Load latest diagnosis
        const stored = localStorage.getItem("latest_diagnosis");
        if (stored) {
            setDiagnosis(JSON.parse(stored));
        }
    }, []);

    const result = diagnosis?.top_result;

    return (
        <div className="result-page">
            {/* HEADER */}
            <div className="result-header">
                <div>
                    <h1>Mari Kita Lihat Hasil Tesmu</h1>
                    <p>
                        {result ? (
                            <>
                                anda sedang mengalami <b>{result.disease_name}</b><br />
                                Dengan Persentase <b>{(result.percentage).toFixed(0)}%</b>
                            </>
                        ) : (
                            "Data hasil tes tidak ditemukan."
                        )}
                    </p>
                </div>

                <div className="avatar"></div>
            </div>

            {/* CARD */}
            <div className={`result-card ${!isLogin ? "content-blur" : ""}`}>
                <h2>Hasil Skrining Kesehatan Mental</h2>

                <p>
                    {result?.description || "Berdasarkan jawaban kuesioner yang telah diisi, sistem sedang menganalisis kondisi Anda."}
                </p>

                <h3>Saran Perbaikan Kondisi</h3>
                <div style={{ whiteSpace: "pre-line", color: "#555", fontSize: "14px" }}>
                    {result?.recommendations?.split(",").map((s, i) => (
                        <li key={i}>{s.trim()}</li>
                    )) || "Tetap jaga kesehatan mental Anda."}
                </div>

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

            {isLogin && (
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <button
                        className="next-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            )}
        </div>
    );
}
/*RESULT*/