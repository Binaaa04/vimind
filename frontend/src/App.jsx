import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DetectionIntro from "./pages/DetectionIntro";
import DetectionQuestion from "./pages/DetectionQuestion";
import DetectionBIntro from "./pages/DetectionBIntro";
import DetectionBQuestion from "./pages/DetectionBQuestion";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/deteksi" element={<DetectionIntro />} />
        <Route path="/deteksi/soal" element={<DetectionQuestion />} />
        <Route path="/deteksi/b" element={<DetectionBIntro />} />
        <Route path="/deteksi/b/soal" element={<DetectionBQuestion />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;