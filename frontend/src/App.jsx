import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DetectionIntro from "./pages/DetectionIntro";
import DetectionQuestion from "./pages/DetectionQuestion";
import DetectionBIntro from "./pages/DetectionBIntro";
import DetectionBQuestion from "./pages/DetectionBQuestion";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/deteksi" element={<DetectionIntro />} />
        <Route path="/deteksi/soal" element={<DetectionQuestion />} />
        <Route path="/deteksi/b" element={<DetectionBIntro />} />
        <Route path="/deteksi/b/soal" element={<DetectionBQuestion />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;