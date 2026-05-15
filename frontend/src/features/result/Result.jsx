import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import { getProfile } from "@/features/auth/api";
import { submitTestimonial } from "@/features/home/api";

export default function Result() {
    useEffect(() => {
        document.title = "Hasil Tes | Vimind";
    }, []);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Feedback States
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

    if (!result) {
        return (
            <div className="result-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ color: '#6B21A8' }}>Data Hasil Tes Tidak Ditemukan</h2>
                <p style={{ color: '#64748B', textAlign: 'center', maxWidth: '300px' }}>Sepertinya kamu belum melakukan tes atau data sudah kedaluwarsa.</p>
                <button
                    className="next-btn"
                    onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
                    style={{ marginTop: '10px' }}
                >
                    {isLoggedIn ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
                </button>
            </div>
        );
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const handleFeedbackSubmit = async () => {
        if (rating === 0 || comment.trim() === "") {
            alert("Harap berikan rating dan komentar.");
            return;
        }
        setSubmittingFeedback(true);
        try {
            await submitTestimonial({
                name: nickname || "Guest",
                email: isLoggedIn ? (await supabase.auth.getSession()).data.session?.user?.email : "guest@vimind.com",
                rating,
                comment,
            });
            setFeedbackSubmitted(true);
            setTimeout(() => {
                setShowFeedbackModal(false);
            }, 2500);
        } catch (err) {
            console.error(err);
            alert("Gagal mengirim feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
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
                        <button className="dashboard-btn" onClick={() => navigate("/dashboard")} style={{ marginRight: 10 }}>
                            Lihat Rangkuman di Dashboard
                        </button>
                        <button className="next-btn" onClick={() => setShowFeedbackModal(true)}>
                            Berikan Penilaian Tes
                        </button>
                    </div>
                )}
                {!isLoggedIn && (
                   <div className="result-footer">
                       <button className="next-btn" onClick={() => setShowFeedbackModal(true)}>
                           Berikan Ulasan Tes
                       </button>
                   </div>
                )}
            </div>

            {/* MODAL HASIL TERKUNCI (GUEST) */}
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

            {/* MODAL FEEDBACK / TESTIMONI */}
            {showFeedbackModal && (
                <div className="overlay">
                    <div className="login-modal" style={{ width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {!feedbackSubmitted ? (
                            <>
                                <h2>Berikan Penilaian</h2>
                                <p style={{ fontSize: '13px', color: '#666' }}>Bantu kami menjadi lebih baik dengan membagikan pengalaman Anda.</p>
                                
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span 
                                            key={star} 
                                            onClick={() => setRating(star)}
                                            style={{ 
                                                fontSize: '30px', 
                                                cursor: 'pointer', 
                                                color: rating >= star ? '#fbbf24' : '#e5e7eb',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                
                                <textarea 
                                    placeholder="Apa pendapatmu mengenai hasil tes ini?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        fontFamily: 'inherit',
                                        resize: 'none'
                                    }}
                                />

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => setShowFeedbackModal(false)}
                                        style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px', borderRadius: '8px', flex: 1, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Nanti Saja
                                    </button>
                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        disabled={submittingFeedback}
                                        style={{ background: '#8a5cff', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', flex: 1, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        {submittingFeedback ? 'Mengirim...' : 'Kirim Ulasan'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{ color: '#10b981' }}>Terima Kasih! 🎉</h2>
                                <p>Ulasan Anda telah kami terima.</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
