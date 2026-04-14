import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getQuestions, diagnose } from "../services/api";
import { supabase } from "../services/supabaseClient";
import "../css/DetectionQuestionCSS.css";

export default function Detection() {
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
  const [phase1Results, setPhase1Results] = useState([]); 
  const [isRefinedMode, setIsRefinedMode] = useState(false); 
  const [historyDiseaseID, setHistoryDiseaseID] = useState(0); 

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
        console.log("Questionnaire Mode:", forceNewTest ? "New Test (Screening)" : "Refined/Resume");

        if (!forceNewTest) {
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
            console.log("Fallback to Screening (No History)");
            const fallback = await getQuestions("screening");
            if (!ignore) setQuestions(fallback.data?.questions || fallback.data || []);
          }
        } else {
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
    return () => { ignore = true; }; 
  }, []);

  const nextQuestion = async () => {
    if (selected === null) return;

    const weights = { 1: 1.0, 2: 0.7, 3: 0.4, 4: 0.0 };
    const currentQuestion = questions[currentIndex];
    const currentAnswer = {
      symptom_id: currentQuestion.id,
      value: weights[selected],
      disease_id: currentQuestion.disease_id 
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
      
      const suspects = newAnswers
        .filter(a => a.value >= 0.7)
        .map(a => a.disease_id);
      
      let finalSuspects = suspects;
      if (finalSuspects.length === 0) {
        finalSuspects = [...newAnswers]
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .filter(a => a.value > 0)
          .map(a => a.disease_id);
      }

      if (finalSuspects.length === 0) {
        finalSuspects = [1, 2]; 
      }

      try {
        const response = await getQuestions("discovery", finalSuspects);
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

  // FUNGSI KEMBALI KE SOAL SEBELUMNYA (DIPERBARUI)
  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAnswers(answers.slice(0, -1));
      setSelected(null);
    }
  };

  // FUNGSI BARU UNTUK TOMBOL KELUAR
  const handleExit = () => {
    if (userEmail) {
      navigate("/dashboard"); // Arahkan ke dashboard jika sudah login
    } else {
      navigate("/"); // Arahkan ke landing page jika guest
    }
  };

  const finalizeDiagnosis = async (finalAnswers) => {
    setSubmitting(true);
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
      
      {/* TOMBOL KELUAR MENGGUNAKAN HANDLE EXIT */}
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

        {/* BUNGKUS TOMBOL KEMBALI DAN LANJUTKAN DI SINI */}
        <div className="action-buttons">
          {currentIndex > 0 && (
            <button className="prev-btn" onClick={previousQuestion}>
              Kembali
            </button>
          )}
          
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
      </div>

      <div className="logo-bottom">Vimind</div>
    </div>
  );
}