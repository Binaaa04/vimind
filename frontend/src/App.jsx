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
import AuthCallback from "./pages/AuthCallback";

function App() {
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
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;