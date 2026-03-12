import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getQuestions, diagnose } from "../services/api";
import { supabase } from "../services/supabaseClient";

export default function Detection() {
  const navigate = useNavigate();

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

  useEffect(() => {
    const init = async () => {
      try {
        let email = "";
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          email = session.user.email;
          setUserEmail(email);
        }

        // Start Phase 1: Try Refined first
        let response = await getQuestions("refined", [], email);
        
        // If Refined returns an empty array (due to missing DB rule data for that disease ID), fallback to screening
        if (!response.data || response.data.length === 0) {
            console.warn("Refined diagnosis returned empty. Falling back to Screening.");
            response = await getQuestions("screening", [], "");
        }
        
        setQuestions(response.data);
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
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
      // END OF PHASE 1 -> ANALYZE & MOVE TO PHASE 2
      setLoading(true);
      
      // Find suspect diseases (score > 0.5)
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

      // If still empty (user said NO to everything), just finish or pick random 2
      if (finalSuspects.length === 0) {
        finalSuspects = [1, 2]; // Fallback
      }

      try {
        const response = await getQuestions("discovery", finalSuspects);
        const newQuestions = response.data;

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

  const finalizeDiagnosis = async (finalAnswers) => {
    setSubmitting(true);
    try {
      // Remove disease_id metadata before sending to API
      const apiAnswers = finalAnswers.map(({ symptom_id, value }) => ({ symptom_id, value }));
      const result = await diagnose(apiAnswers, userEmail);

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
