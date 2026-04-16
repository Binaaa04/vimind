import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
//import Welcome from "./pages/Welcome";
import DetectionIntro from "./pages/DetectionIntro";
import DetectionQuestion from "./pages/DetectionQuestion";
import Finish from "./pages/Finish";
import Result from "./pages/Result";
import Register from "./pages/Register";
import Success from "./pages/Success";
import ForgotPassword from "./pages/ForgotPassword";
import ResetSent from "./pages/ResetSent";
import ResetPassword from "./pages/ResetPassword";
import ResetSuccess from "./pages/ResetSuccess";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFAQ from "./pages/AdminFAQ";
import AdminTest from "./pages/AdminTest";
import AuthCallback from "./pages/AuthCallback";
import { useEffect } from "react";
import { supabase } from "./services/supabaseClient";
import { diagnose } from "./services/api";

function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        const pendingAnswersRaw = localStorage.getItem("pending_answers");
        if (pendingAnswersRaw) {
          try {
            const parsedAnswers = JSON.parse(pendingAnswersRaw);
            const diagRes = await diagnose(parsedAnswers, session.user.email);
            localStorage.setItem("latest_diagnosis", JSON.stringify(diagRes.data));
            localStorage.removeItem("pending_answers");
            console.log("App: Successfully synced pending diagnosis to DB.");
            // 2. Redirect to Results page immediately
            window.location.href = "/hasil";
          } catch (syncErr) {
            console.error("App: Failed to sync pending diagnosis:", syncErr);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        {/* <Route path="/Welcome" element={<Welcome />} /> */}
        <Route path="/deteksi" element={<DetectionIntro />} />
        <Route path="/deteksi/soal" element={<DetectionQuestion />} />
        <Route path="/selesai" element={<Finish />} />
        <Route path="/hasil" element={<Result />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/success" element={<Success />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-sent" element={<ResetSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/admin/faq" element={<AdminFAQ />} />
        <Route path="/admin/test" element={<AdminTest />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;