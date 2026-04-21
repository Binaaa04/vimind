import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { getQuestions, diagnose } from "../services/api";
import { supabase } from "../services/supabaseClient";
import "../css/DetectionQuestionCSS.css";

// localStorage keys untuk offline resilience
const LS_DRAFT_KEY = "quiz_draft";

function saveDraft(data) {
  try {
    localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(data));
  } catch (_) {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(LS_DRAFT_KEY);
}

export default function Detection() {
  useEffect(() => {
    document.title = "Tes Gejala | Vimind";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Adaptive Logic States
  const [phase, setPhase] = useState(1);
  const [isRefinedMode, setIsRefinedMode] = useState(false);
  const [historyDiseaseID, setHistoryDiseaseID] = useState(0);

  // Offline banner state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryAnswers, setRetryAnswers] = useState(null); // jawaban pending untuk di-retry

  // ============================================================
  // Online / Offline detection
  // ============================================================
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Auto-retry finalize saat kembali online
  useEffect(() => {
    if (!isOffline && retryAnswers) {
      finalizeDiagnosis(retryAnswers, true);
    }
  }, [isOffline]);

  // ============================================================
  // Init — load pertanyaan + cek draft tersimpan
  // ============================================================
  useEffect(() => {
    let ignore = false;

    const init = async () => {
      try {
        let email = "";
        const { data: { session } } = await supabase.auth.getSession();
        if (ignore) return;

        if (session?.user) {
          email = session.user.email;
          setUserEmail(email);
        }

        const forceNewTest = location.state?.forceNewTest;

        // Cek apakah ada draft soal yang tersimpan (sesi sebelumnya putus)
        const draft = loadDraft();
        if (draft && !forceNewTest && draft.questions?.length > 0) {
          // Resume dari draft
          setQuestions(draft.questions);
          setAnswers(draft.answers || []);
          setCurrentIndex(draft.currentIndex || 0);
          setPhase(draft.phase || 1);
          setIsRefinedMode(draft.isRefinedMode || false);
          setHistoryDiseaseID(draft.historyDiseaseID || 0);
          setLoading(false);
          return;
        }

        if (!forceNewTest) {
          const response = await getQuestions("refined", [], email);
          if (ignore) return;

          const { questions: qs, is_refined } = response.data;

          if (qs && qs.length > 0) {
            setQuestions(qs);
            if (is_refined) {
              setIsRefinedMode(true);
              const { history_disease_id } = response.data;
              if (history_disease_id > 0) setHistoryDiseaseID(history_disease_id);
            }
          } else {
            const fallback = await getQuestions("screening");
            if (!ignore) setQuestions(fallback.data?.questions || fallback.data || []);
          }
        } else {
          // Mulai tes baru — hapus draft lama
          clearDraft();
          setIsRefinedMode(false);
          setHistoryDiseaseID(0);
          const fallback = await getQuestions("screening");
          if (!ignore) setQuestions(fallback.data?.questions || fallback.data || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Initialization failed:", err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    init();
    return () => { ignore = true; };
  }, []);

  // Simpan draft ke localStorage setiap kali ada perubahan state penting
  useEffect(() => {
    if (questions.length > 0) {
      saveDraft({
        questions,
        answers,
        currentIndex,
        phase,
        isRefinedMode,
        historyDiseaseID,
      });
    }
  }, [answers, currentIndex, phase, questions]);

  // ============================================================
  // Next Question
  // ============================================================
  const nextQuestion = async () => {
    if (selected === null) return;

    const weights = { 1: 1.0, 2: 0.7, 3: 0.4, 4: 0.0 };
    const currentQuestion = questions[currentIndex];
    const currentAnswer = {
      symptom_id: currentQuestion.id,
      value: weights[selected],
      disease_id: currentQuestion.disease_id,
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (phase === 1) {
      if (isRefinedMode) {
        await finalizeDiagnosis(newAnswers);
        return;
      }

      setLoading(true);

      try {
        // Pindah ke backend: Biarkan backend yang menentukan soal discovery
        // Kita kirim symptom_id dan value, disease_id opsional karena backend akan cek di DB
        const apiAnswers = newAnswers.map(({ symptom_id, value, disease_id }) => ({ 
          symptom_id, 
          value, 
          disease_id: disease_id || 0 
        }));
        const response = await getDiscoveryQuestions(apiAnswers);
        const newQuestions = response.data?.questions || response.data || [];

        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
          setCurrentIndex(0);
          setPhase(2);
        } else {
          await finalizeDiagnosis(newAnswers);
        }
      } catch (err) {
        console.error("Discovery failed:", err);
        await finalizeDiagnosis(newAnswers);
      } finally {
        setLoading(false);
      }
    } else {
      await finalizeDiagnosis(newAnswers);
    }
  };

  // ============================================================
  // Finalize Diagnosis (dengan offline resilience)
  // ============================================================
  const finalizeDiagnosis = async (finalAnswers, isRetry = false) => {
    if (!isRetry) setSubmitting(true);

    // Kalau offline, simpan jawaban dan tampilkan banner
    if (!navigator.onLine) {
      const apiAnswers = finalAnswers.map(({ symptom_id, value }) => ({ symptom_id, value }));
      localStorage.setItem("pending_answers", JSON.stringify(apiAnswers));
      setRetryAnswers(finalAnswers);
      setSubmitting(false);
      return;
    }

    try {
      const apiAnswers = finalAnswers.map(({ symptom_id, value }) => ({ symptom_id, value }));
      const result = await diagnose(apiAnswers, userEmail, historyDiseaseID);

      if (userEmail) {
        localStorage.setItem("latest_diagnosis", JSON.stringify(result.data));
        localStorage.removeItem("pending_answers");
      } else {
        localStorage.removeItem("latest_diagnosis");
        localStorage.setItem("pending_answers", JSON.stringify(apiAnswers));
      }

      // Berhasil — hapus draft
      clearDraft();
      setRetryAnswers(null);

      navigate("/selesai", { state: { diagnosis: result.data, isGuest: !userEmail } });
    } catch (err) {
      console.error("Diagnosis failed:", err);

      // Simpan jawaban agar bisa di-retry
      const apiAnswers = finalAnswers.map(({ symptom_id, value }) => ({ symptom_id, value }));
      localStorage.setItem("pending_answers", JSON.stringify(apiAnswers));
      setRetryAnswers(finalAnswers);
      setSubmitting(false);
    }
  };

  // ============================================================
  // Previous Question
  // ============================================================
  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAnswers(answers.slice(0, -1));
      setSelected(null);
    }
  };

  // Exit
  const handleExit = () => {
    // Draft tetap tersimpan, user bisa resume nanti
    if (userEmail) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // ============================================================
  // Render states
  // ============================================================
  if (loading) return (
    <div className="question-page">
      <h1>{phase === 2 ? "Menyiapkan Pertanyaan Lanjutan..." : "Memuat Pertanyaan..."}</h1>
      <p style={{ marginTop: "10px", color: "#666" }}>
        {phase === 2 ? "Sistem sedang mengkalibrasi soal berdasarkan jawaban Anda." : "Mohon tunggu sebentar."}
      </p>
    </div>
  );

  if (!questions || questions?.length === 0) {
    return (
      <div className="question-page">
        <h1>Terjadi Kesalahan</h1>
        <p>Gagal memuat daftar pertanyaan. Silahkan coba lagi nanti.</p>
        <button onClick={() => window.location.reload()} className="next-btn" style={{ marginTop: "20px" }}>
          Muat Ulang
        </button>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / (questions?.length || 1)) * 100;

  return (
    <div className="question-page">

      {/* OFFLINE BANNER */}
      {isOffline && (
        <div className="offline-banner">
          📵 Koneksi terputus — jawabanmu tersimpan otomatis. Akan dilanjutkan saat kembali online.
        </div>
      )}

      {/* RETRY BANNER — internet mati saat submit */}
      {!isOffline && retryAnswers && (
        <div className="retry-banner">
          🔄 Koneksi kembali! Mengirim jawaban...
        </div>
      )}

      {/* TOMBOL KELUAR */}
      <button className="back-btn" onClick={handleExit}>
        Keluar
      </button>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="question-container">
        <div className="phase-indicator" style={{
          fontSize: "0.8rem",
          color: "#888",
          marginBottom: "10px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          {phase === 1 ? "TAHAP 1: PENGECEKAN UMUM" : "TAHAP 2: PENDALAMAN GEJALA"}
        </div>

        <h1>
          {currentIndex + 1}. {questions[currentIndex]?.name}
        </h1>

        <div className="options-wrapper">
          <div className="label-left">Setuju</div>
          <div className="circles">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`circle ${selected === i ? "active" : ""}`}
                onClick={() => setSelected(i)}
              ></div>
            ))}
          </div>
          <div className="label-right">
            Tidak<br />Setuju
          </div>
        </div>

        <div className="action-buttons">
          {currentIndex > 0 && (
            <button className="prev-btn" onClick={previousQuestion}>
              Kembali
            </button>
          )}

          <button
            className="next-btn"
            onClick={nextQuestion}
            disabled={selected === null || submitting || (isOffline && currentIndex === questions.length - 1)}
            style={{
              opacity: selected === null || submitting ? 0.5 : 1,
              cursor: selected === null || submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Mengolah..." : (currentIndex < questions.length - 1 ? "Lanjutkan" : (phase === 1 ? "Lanjut Fase Detail" : "Selesai"))}
          </button>
        </div>
      </div>

      <div className="logo-bottom">Vimind</div>
    </div>
  );
}