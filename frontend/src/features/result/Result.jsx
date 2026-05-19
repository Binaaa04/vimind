import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import { getProfile } from "@/features/auth/api";
import { submitTestimonial, checkRating } from "@/features/home/api";
import { saveMoodToBackend } from "@/features/dashboard/api";
import MoodModal from "@/features/detection/components/MoodModal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../../css/Result.css";

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
    const [userEmail, setUserEmail] = useState("");

    // Mood States
    const [showMoodModal, setShowMoodModal] = useState(false);

    // Feedback States
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [checkingRating, setCheckingRating] = useState(true);

    // Get data from location state (Passed from DetectionQuestion)
    const stateDiagnosis = location.state?.diagnosis;
    const storedDiagnosis = JSON.parse(localStorage.getItem("latest_diagnosis"));
    const diagnosis = stateDiagnosis || storedDiagnosis;

    useEffect(() => {
        const checkShouldShowMood = () => {
            const lastMoodDate = localStorage.getItem("mood_date");
            const today = new Date().toDateString();
            return lastMoodDate !== today;
        };

        const checkAuthAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                setShowModal(false);
                setUserEmail(session.user.email);
                
                if (checkShouldShowMood()) {
                    setShowMoodModal(true);
                }

                // Check rating status from backend (persistent)
                try {
                    const ratingRes = await checkRating(session.user.email);
                    const rated = ratingRes.data?.has_rated === true;
                    setHasRated(rated);
                    localStorage.setItem("has_rated_test", rated ? "true" : "false");
                } catch (err) {
                    // Fallback to localStorage if backend fails
                    setHasRated(localStorage.getItem("has_rated_test") === "true");
                } finally {
                    setCheckingRating(false);
                }

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
                setCheckingRating(false);
            }
        };
        checkAuthAndProfile();
    }, []);

    const result = diagnosis?.top_result || (diagnosis?.all_results ? diagnosis.all_results[0] : null);

    const chartData = (diagnosis?.all_results || [])
      .map(r => ({ name: r.disease_name, score: +r.percentage.toFixed(1) }))
      .sort((a, b) => b.score - a.score);

    // --- FITUR BARU: AUTO POP-UP FEEDBACK ---
    useEffect(() => {
        // Tampilkan pop-up setelah 1 detik halaman dimuat, 
        // asalkan ada hasil tes dan user tidak terhalang modal login (guest) dan tidak sedang milih mood
        if (result && !showModal && !showMoodModal && !checkingRating) {
            // Wajibkan rating bagi user login yang belum pernah rating
            if (isLoggedIn && !hasRated) {
                const timer = setTimeout(() => {
                    setShowFeedbackModal(true);
                }, 1000); // 1000ms = 1 detik jeda
                return () => clearTimeout(timer); 
            }
        }
    }, [result, showModal, showMoodModal, isLoggedIn, hasRated, checkingRating]);

    if (!result) {
        return (
            <div className="not-found-container">
                <h2 className="not-found-title">Data Hasil Tes Tidak Ditemukan</h2>
                <p className="not-found-desc">Sepertinya kamu belum melakukan tes atau data sudah kedaluwarsa.</p>
                <button
                    className="next-btn not-found-btn"
                    onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
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
            localStorage.setItem("has_rated_test", "true");
            setHasRated(true);
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
                            <img src={avatarUrl} alt="Avatar" />
                        ) : (
                            nickname ? nickname[0].toUpperCase() : "?"
                        )}
                    </div>
                    {isLoggedIn && (
                        <button className="logout-mini-btn" onClick={handleLogout}>Keluar</button>
                    )}
                </div>
            </div>

            {/* Blur hasil jika belum login ATAU (sudah login tapi belum rating & popup muncul) */}
            <div className={`result-card-container ${(!isLoggedIn || (isLoggedIn && !hasRated)) ? "content-blur" : ""}`}>
                <div className="result-card">
                    <div className="card-section">
                        <h3>Deskripsi Kondisi</h3>
                        <p>{result?.description || "Berdasarkan jawaban kuesioner, sistem sedang menganalisis kondisi Anda."}</p>
                    </div>

                    <div className="card-section">
                        <h3>Indikator yang Diukur</h3>
                        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 50 + 40, 120)}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12, fill: "#555" }} />
                                <Tooltip formatter={(val) => `${val.toFixed(1)}%`} />
                                <Bar dataKey="score" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
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

                {isLoggedIn ? (
                    <div className="result-footer">
                        <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
                            Lihat Rangkuman di Dashboard
                        </button>
                        <button className="next-btn" onClick={() => setShowFeedbackModal(true)}>
                            Berikan Penilaian Tes
                        </button>
                    </div>
                ) : (
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

            {/* MODAL MOOD */}
            {showMoodModal && (
                <MoodModal 
                    onSelect={async (m) => {
                        try {
                            if (userEmail) {
                                await saveMoodToBackend(userEmail, m);
                            }
                        } catch (e) {
                            console.error("Gagal simpan mood", e);
                        }
                        setShowMoodModal(false);
                    }}
                    onClose={() => setShowMoodModal(false)}
                />
            )}

            {/* MODAL FEEDBACK / TESTIMONI */}
            {showFeedbackModal && (
                <div className="overlay">
                    <div className="login-modal feedback-modal">
                        {!feedbackSubmitted ? (
                            <>
                                <h2>Berikan Penilaian</h2>
                                <p className="feedback-subtitle">Bantu kami menjadi lebih baik dengan membagikan pengalaman Anda.</p>

                                <div className="stars-container">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)} // 👈 2. Tambahkan event hover masuk
                                            onMouseLeave={() => setHoverRating(0)}    // 👈 3. Tambahkan event hover keluar
                                            className={`star ${(hoverRating || rating) >= star ? 'active' : ''}`} // 👈 4. Ubah logika class
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>

                                <textarea
                                    className="feedback-textarea"
                                    placeholder="Apa pendapatmu mengenai hasil tes ini?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                />

                                <div className="feedback-actions">
                                    <button
                                        className="btn-send"
                                        onClick={handleFeedbackSubmit}
                                        disabled={submittingFeedback}
                                    >
                                        {submittingFeedback ? 'Mengirim...' : 'Kirim Ulasan'}
                                    </button>
                                    
                                    {/* Sembunyikan tombol "Nanti Saja" jika user login & belum rating (Wajib!) */}
                                    {(!isLoggedIn || hasRated) && (
                                        <button
                                            className="btn-later"
                                            onClick={() => setShowFeedbackModal(false)}
                                        >
                                            Nanti Saja
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="success-title">Terima Kasih! 🎉</h2>
                                <p>Ulasan Anda telah kami terima.</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}