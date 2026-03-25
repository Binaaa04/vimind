import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getProfile } from "../services/api";

export default function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get data from location state (Passed from DetectionQuestion)
    const stateDiagnosis = location.state?.diagnosis;
    const storedDiagnosis = JSON.parse(localStorage.getItem("latest_diagnosis"));
    const diagnosis = stateDiagnosis || storedDiagnosis;

    useEffect(() => {
        const checkAuthAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                setShowModal(false);
                try {
                    const profileRes = await getProfile(session.user.email);
                    setNickname(profileRes.data.name || session.user.email.split("@")[0]);
                    setAvatarUrl(profileRes.data.avatar_url || "");
                } catch (err) {
                    setNickname(session.user.email.split("@")[0]);
                }
            } else {
                setIsLoggedIn(false);
                setShowModal(true);
            }
        };
        checkAuthAndProfile();
    }, []);

    const result = diagnosis?.top_result || (diagnosis?.all_results ? diagnosis.all_results[0] : null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="result-page">
            <div className="result-header">
                <div className="header-info">
                    <h1>Mari Lihat Hasil Tesmu{nickname ? `, ${nickname}!` : ""}</h1>
                    <div className="result-badge">
                        {result ? (
                            <>
                                <span>Kamu Terdeteksi:</span>
                                <h2>{result.disease_name}</h2>
                                <div className="percentage-pill">
                                    Akurasi: {(result.percentage || 0).toFixed(0)}%
                                </div>
                            </>
                        ) : (
                            <p>Data hasil tes tidak ditemukan.</p>
                        )}
                    </div>
                </div>

                <div className="header-actions">
                    <div className="avatar">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            nickname ? nickname[0].toUpperCase() : "?"
                        )}
                    </div>
                    {isLoggedIn && (
                        <button className="logout-mini-btn" onClick={handleLogout}>Keluar</button>
                    )}
                </div>
            </div>

            <div className={`result-card-container ${!isLoggedIn ? "content-blur" : ""}`}>
                <div className="result-card">
                    <div className="card-section">
                        <h3>Deskripsi Kondisi</h3>
                        <p>{result?.description || "Berdasarkan jawaban kuesioner, sistem sedang menganalisis kondisi Anda."}</p>
                    </div>

                    <div className="card-section">
                        <h3>Saran Perbaikan</h3>
                        <div className="recommendations-box">
                            {result?.recommendations ? (
                                result.recommendations.split(",").map((s, i) => (
                                    <div key={i} className="rec-item">
                                        <span className="bullet">✦</span>
                                        <p>{s.trim()}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Tetap jaga kesehatan mental Anda.</p>
                            )}
                        </div>
                    </div>

                    <div className="card-section rujukan">
                        <h3>Saran Rujukan Profesional</h3>
                        <p>
                            Jika gejala ini mengganggu aktivitas harian Anda selama lebih dari <b>2 minggu</b>,
                            sangat disarankan untuk berkonsultasi dengan psikolog atau psikiater.
                        </p>
                    </div>
                </div> 

                {isLoggedIn && (
                    <div className="result-footer">
                        <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
                            Lihat Rangkuman di Dashboard
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="overlay">
                    <div className="login-modal">
                        <div className="lock-icon">🔒</div>
                        <h2>Hasil Terkunci</h2>
                        <p>Simpan hasil tes ini secara permanen dengan masuk ke akun kamu.</p>
                        <button
                            disabled={loading}
                            onClick={() => {
                                setLoading(true);
                                navigate("/login");
                            }}
                        >
                            {loading ? "Menuju Login..." : "Masuk Sekarang"}
                        </button>
                        <p className="guest-note">Akurasi deteksi mental health bisa berubah seiring waktu.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
