import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getQuestions, diagnose } from "../services/api";
import { supabase } from "../services/supabaseClient";

export default function Detection() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // Array of {symptom_id, value}
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch User Info
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // You might need to map Supabase UUID to your DB integer ID
          // However, assuming you might be using UUID or handle mapping in backend
          // For now, let's pass the email or a placeholder if mapping is complex
          setUserEmail(session.user.email);
        }

        const response = await getQuestions();
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

    // Mapping weights: Circle 1 (Left) = 1.0, Circle 4 (Right) = 0.0
    const weights = { 1: 1.0, 2: 0.7, 3: 0.4, 4: 0.0 };
    const currentAnswer = {
      symptom_id: questions[currentIndex].id,
      value: weights[selected]
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // FINISHED -> DIAGNOSE
      setSubmitting(true);
      try {
        const result = await diagnose(newAnswers, userEmail);

        if (userEmail) {
          localStorage.setItem("latest_diagnosis", JSON.stringify(result.data));
        } else {
          // GUEST: Save to sessionStorage (Temporary) or just pass via state
          // sessionStorage survives refresh but dies on tab close.
          // React location state survives refresh too.
          // To make it disappear ON REFRESH, we can use a temporary global state, 
          // or just explicitly clear it. For now, let's use sessionStorage as it's 'temporary' enough,
          // OR just don't save it anywhere except the navigate state.
          localStorage.removeItem("latest_diagnosis"); // Clear old data
        }

        navigate("/selesai", { state: { diagnosis: result.data, isGuest: !userEmail } });
      } catch (err) {
        console.error("Diagnosis failed:", err);
        alert("Terjadi kesalahan saat mengolah data. Silahkan coba lagi.");
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="question-page"><h1>Memuat Pertanyaan...</h1></div>;

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="question-page">

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="question-container">

        <h1>
          {currentIndex + 1}. {questions[currentIndex]?.name}
        </h1>

        <div className="options-wrapper">

          <div className="label-left">Setuju</div>

          <div className="circles">

            <div
              className={`circle ${selected === 1 ? "active" : ""}`}
              onClick={() => setSelected(1)}
            ></div>

            <div
              className={`circle ${selected === 2 ? "active" : ""}`}
              onClick={() => setSelected(2)}
            ></div>

            <div
              className={`circle ${selected === 3 ? "active" : ""}`}
              onClick={() => setSelected(3)}
            ></div>

            <div
              className={`circle ${selected === 4 ? "active" : ""}`}
              onClick={() => setSelected(4)}
            ></div>

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
          {submitting ? "Mengolah..." : (currentIndex < questions.length - 1 ? "Lanjutkan" : "Selesai")}
        </button>

      </div>

      <div className="logo-bottom">Vimind</div>

    </div>
  );
}
