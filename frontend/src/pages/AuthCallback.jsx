import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;

      // Check for error in URL hash (e.g., otp_expired, access_denied)
      if (hash.includes("error=")) {
        const params = new URLSearchParams(hash.replace("#", "?"));
        const errorCode = params.get("error_code") || "unknown_error";
        const errorDesc = params.get("error_description") || "Terjadi kesalahan saat verifikasi.";

        if (errorCode === "otp_expired") {
          setErrorMessage("Link konfirmasi email sudah kadaluarsa. Silakan minta link baru.");
        } else {
          setErrorMessage(decodeURIComponent(errorDesc.replaceAll("+", " ")));
        }
        setStatus("error");
        return;
      }

      // Let Supabase handle the token in the hash automatically
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Try to exchange the token
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        ).catch(() => ({ error: { message: "Token tidak valid." } }));

        if (exchangeError) {
          setErrorMessage("Gagal memverifikasi akun. Link mungkin sudah digunakan atau kadaluarsa.");
          setStatus("error");
          return;
        }
      }

      // Success!
      setStatus("success");
    };

    handleCallback();
  }, []);

  // Auto-redirect countdown for success
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  const handleResendEmail = async () => {
    const email = prompt("Masukkan email kamu untuk mengirim ulang link konfirmasi:");
    if (!email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      alert("Gagal mengirim ulang: " + error.message);
    } else {
      alert("Link konfirmasi baru sudah dikirim ke " + email + ". Cek inbox kamu!");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      color: "#fff"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.15)",
        padding: "48px 40px",
        maxWidth: "440px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
      }}>
        {/* Loading */}
        {status === "loading" && (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
            <h2 style={{ margin: "0 0 8px", fontWeight: 700 }}>Memverifikasi Akun...</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", margin: 0 }}>Mohon tunggu sebentar.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>✅</div>
            <h2 style={{ margin: "0 0 12px", fontWeight: 700, color: "#4ade80" }}>
              Email Berhasil Dikonfirmasi!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "24px", lineHeight: 1.6 }}>
              Akunmu sudah aktif. Kamu akan diarahkan ke halaman login dalam{" "}
              <span style={{ color: "#a78bfa", fontWeight: 700 }}>{countdown}</span> detik...
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "14px 32px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%"
              }}
            >
              Login Sekarang →
            </button>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>❌</div>
            <h2 style={{ margin: "0 0 12px", fontWeight: 700, color: "#f87171" }}>
              Verifikasi Gagal
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "28px", lineHeight: 1.6 }}>
              {errorMessage}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleResendEmail}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 32px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📧 Kirim Ulang Email Konfirmasi
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  padding: "12px 32px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Daftar Ulang
              </button>
            </div>
          </>
        )}

        <p style={{ marginTop: "24px", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
          ViMind — Mental Health Platform
        </p>
      </div>
    </div>
  );
}
