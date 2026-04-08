import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getProfile, diagnose } from "../services/api";

export default function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Get data from location state or localStorage
    const [currentDiagnosis, setCurrentDiagnosis] = useState(() => {
        const stateDiagnosis = location.state?.diagnosis;
        const storedDiagnosis = JSON.parse(localStorage.getItem("latest_diagnosis"));
        return stateDiagnosis || storedDiagnosis;
    });

    useEffect(() => {
        const handleSession = async (session) => {
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

                // Sync pending answers if user just logged in from guest flow
                const pendingAnswersRaw = localStorage.getItem("pending_answers");
                if (pendingAnswersRaw) {
                    setSyncing(true);
                    try {
                        const parsedAnswers = JSON.parse(pendingAnswersRaw);
                        const diagRes = await diagnose(parsedAnswers, session.user.email);
                        setCurrentDiagnosis(diagRes.data);
                        localStorage.setItem("latest_diagnosis", JSON.stringify(diagRes.data));
                        localStorage.removeItem("pending_answers");
                        // Also clear the redirect flag since we've now handled it
                        localStorage.removeItem("redirectAfterLogin");
                    } catch (syncErr) {
                        console.error("Failed to sync pending diagnosis:", syncErr);
                    } finally {
                        setSyncing(false);
                    }
                }
            } else {
                setIsLoggedIn(false);
                setShowModal(true);
            }
        };

        // First check current session (handles email/password login redirect)
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Also listen for auth changes (handles Google OAuth token in URL hash)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const result = currentDiagnosis?.top_result || (currentDiagnosis?.all_results ? currentDiagnosis.all_results[0] : null);

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
                        {syncing ? (
                            <p>Menyinkronkan hasil tes Anda...</p>
                        ) : result ? (
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
                                localStorage.setItem("redirectAfterLogin", "/hasil");
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
