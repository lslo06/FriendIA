import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Logo } from "./Logo";

interface AuthProps {
  onSuccess: (userName: string) => void;
  onBack: () => void;
  initialMode?: "login" | "signup";
}

export function Auth({ onSuccess, onBack, initialMode = "login" }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSuccess(name || email.split("@")[0] || "Usuario");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#121820" }}
    >
      <button
        onClick={onBack}
        style={{ position: "absolute", top: 24, left: 32, color: "#94A3B8", fontSize: 14, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
      >
        ← Volver
      </button>

      <div
        className="w-full max-w-md p-10 rounded-2xl"
        style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size={44} showName />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginTop: 20, marginBottom: 4 }}>
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p style={{ fontSize: 14, color: "#94A3B8" }}>
            {mode === "login" ? "Inicia sesión para continuar" : "Comienza tu viaje emocional"}
          </p>
        </div>

        {/* Google */}
        <button
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-5 transition-all"
          style={{ background: "#fff", color: "#2C3E50", fontWeight: 600, fontSize: 15 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#f0f0f0")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#fff")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>o con correo</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label style={{ fontSize: 13, color: "#94A3B8", display: "block", marginBottom: 6 }}>Nombre</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="¿Cómo te llamamos?"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontSize: 14 }}
                onFocus={e => (e.target.style.borderColor = "#5B88B2")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", display: "block", marginBottom: 6 }}>Correo electrónico</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontSize: 14 }}
                onFocus={e => (e.target.style.borderColor = "#5B88B2")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", display: "block", marginBottom: 6 }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition-all"
                style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontSize: 14 }}
                onFocus={e => (e.target.style.borderColor = "#5B88B2")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {mode === "login" && (
            <a href="#" style={{ fontSize: 13, color: "#5B88B2", textAlign: "right", display: "block", marginTop: -8 }}>¿Olvidaste tu contraseña?</a>
          )}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl mt-2 transition-all"
            style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 15 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
          >
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "#94A3B8", marginTop: 20 }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ color: "#5B88B2", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
