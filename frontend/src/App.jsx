import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import Home from "@/features/home/Home";
import DetectionIntro from "@/features/detection/pages/DetectionIntro";
import DetectionQuestion from "@/features/detection/pages/DetectionQuestion";
import Finish from "@/features/detection/pages/Finish";
import Result from "@/features/result/Result";
import Register from "@/features/auth/pages/Register";
import Success from "@/features/auth/pages/Success";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetSent from "@/features/auth/pages/ResetSent";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import ResetSuccess from "@/features/auth/pages/ResetSuccess";
import Login from "@/features/auth/pages/Login";
import Dashboard from "@/features/dashboard/Dashboard";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import AuthCallback from "@/features/auth/pages/AuthCallback";
import { useAuthSync } from "@/shared/hooks/useAuthSync";

function App() {
  useAuthSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
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
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
