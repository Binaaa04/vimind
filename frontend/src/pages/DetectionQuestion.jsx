import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getQuestions, diagnose } from "../services/api";
import { supabase } from "../services/supabaseClient";
import "../css/DetectionQuestionCSS.css";

export default function Detection() {
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // All answers {symptom_id, value}
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Adaptive Logic States
  const [phase, setPhase] = useState(1); // 1: Screening, 2: Discovery
  const [phase1Results, setPhase1Results] = useState([]); // {disease_id, value}
  const [isRefinedMode, setIsRefinedMode] = useState(false); // Skip Phase 2 for returning users
  const [historyDiseaseID, setHistoryDiseaseID] = useState(0); // Known prior disease to anchor result

  useEffect(() => {
    let ignore = false; // StrictMode fix: ignore stale async results from unmounted render

    const init = async () => {
      try {
        let email = "";
        const { data: { session } } = await supabase.auth.getSession();
        if (ignore) return; // Component was unmounted mid-fetch, abort

        if (session?.user) {
          email = session.user.email;
          setUserEmail(email);
        }

        const forceNewTest = location.state?.forceNewTest;
        console.log("Questionnaire Mode:", forceNewTest ? "New Test (Screening)" : "Refined/Resume");

        if (!forceNewTest) {
          // Request questions (refined if logged in, backend auto-falls-back to screening)
          const response = await getQuestions("refined", [], email);
          if (ignore) return; 

          const { questions: qs, is_refined } = response.data;

          if (qs && qs.length > 0) {
            setQuestions(qs);
            if (is_refined) {
              console.log("Setting Refined Mode: ON");
              setIsRefinedMode(true); 
              const { history_disease_id } = response.data;
              if (history_disease_id > 0) setHistoryDiseaseID(history_disease_id);
            }
          } else {
            // Fallback: no history or healthy history, use general screening
            console.log("Fallback to Screening (No History)");
            const fallback = await getQuestions("screening");
            if (!ignore) setQuestions(fallback.data?.questions || fallback.data || []);
          }
        } else {
          // User forced a new test
          console.log("Forcing New Test (Screening Mode)");
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
    return () => { ignore = true; }; // Cleanup: mark stale render, prevent setState on unmount
  }, []);

  const nextQuestion = async () => {
    if (selected === null) return;

    const weights = { 1: 1.0, 2: 0.7, 3: 0.4, 4: 0.0 };
    const currentQuestion = questions[currentIndex];
    const currentAnswer = {
      symptom_id: currentQuestion.id,
      value: weights[selected],
      disease_id: currentQuestion.disease_id // Keep track for screening logic
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setSelected(null);

    // Transition Logic
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (phase === 1) {
      // END OF PHASE 1

      // REFINED MODE: User has known history → questions were already targeted → skip Phase 2
      if (isRefinedMode) {
        await finalizeDiagnosis(newAnswers);
        return;
      }

      // SCREENING MODE: General questions → analyze and move to Phase 2 (Discovery)
      setLoading(true);
      
      // Find suspect diseases (score >= 0.7)
      const suspects = newAnswers
        .filter(a => a.value >= 0.7)
        .map(a => a.disease_id);
      
      // If no strong suspects, take top 3 highest scores
      let finalSuspects = suspects;
      if (finalSuspects.length === 0) {
        finalSuspects = [...newAnswers]
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .filter(a => a.value > 0)
          .map(a => a.disease_id);
      }

      // If still empty (user said NO to everything), just finish
      if (finalSuspects.length === 0) {
        finalSuspects = [1, 2]; // Fallback
      }

      try {
        const response = await getQuestions("discovery", finalSuspects);
        const newQuestions = response.data?.questions || response.data || [];

        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
          setCurrentIndex(0);
          setPhase(2);
        } else {
          // No more specific questions? Just finish.
          await finalizeDiagnosis(newAnswers);
        }
      } catch (err) {
        console.error("Discovery failed:", err);
        await finalizeDiagnosis(newAnswers);
      } finally {
        setLoading(false);
      }
    } else {
      // END OF PHASE 2 -> FINAL DIAGNOSIS
      await finalizeDiagnosis(newAnswers);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Remove the last answer from the answers array
      setAnswers(answers.slice(0, -1));
      // Reset selected state
      setSelected(null);
    }
  };

  const finalizeDiagnosis = async (finalAnswers) => {
    setSubmitting(true);
    try {
      // Remove disease_id metadata before sending to API
      const apiAnswers = finalAnswers.map(({ symptom_id, value }) => ({ symptom_id, value }));
      // Pass historyDiseaseID so backend anchors result to prior diagnosis in refined mode
      const result = await diagnose(apiAnswers, userEmail, historyDiseaseID);

      if (userEmail) {
        localStorage.setItem("latest_diagnosis", JSON.stringify(result.data));
        localStorage.removeItem("pending_answers");
      } else {
        localStorage.removeItem("latest_diagnosis"); 
        localStorage.setItem("pending_answers", JSON.stringify(apiAnswers));
      }

      navigate("/selesai", { state: { diagnosis: result.data, isGuest: !userEmail } });
    } catch (err) {
      console.error("Diagnosis failed:", err);
      alert("Terjadi kesalahan saat mengolah data. Silahkan coba lagi.");
      setSubmitting(false);
    }
  };

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
      {currentIndex > 0 && (
        <button className="back-btn" onClick={previousQuestion}>
          ← 
        </button>
      )}

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

        <button
          className="next-btn"
          onClick={nextQuestion}
          disabled={selected === null || submitting}
          style={{
            opacity: selected === null || submitting ? 0.5 : 1,
            cursor: selected === null || submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Mengolah..." : (currentIndex < questions.length - 1 ? "Lanjutkan" : (phase === 1 ? "Lanjut Fase Detail" : "Selesai"))}
        </button>
      </div>

      <div className="logo-bottom">Vimind</div>
    </div>
  );
}
