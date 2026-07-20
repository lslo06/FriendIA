import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Logo } from "./Logo";

export interface AuthResult {
  userName: string;
  surveyCompleted: boolean;
}

interface AuthProps {
  onSuccess: (result: AuthResult) => void;
  onBack: () => void;
  initialMode?: "login" | "signup";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Auth({
  onSuccess,
  onBack,
  initialMode = "login",
}: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPass, setShowPass] = useState(false);

  const [name, setName] = useState("");
  const [apellidoPat, setApellidoPat] = useState("");
  const [apellidoMat, setApellidoMat] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [googleCompletarPerfil, setGoogleCompletarPerfil] = useState(false);
  const [googleNombre, setGoogleNombre] = useState("");
  const [googleApellidoPat, setGoogleApellidoPat] = useState("");
  const [googleApellidoMat, setGoogleApellidoMat] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleProcesado = useRef(false);

  async function procesarSesionGoogle(session: Session) {
    if (googleProcesado.current) return;

    const provider = session.user.app_metadata?.provider;
    if (provider !== "google") return;

    googleProcesado.current = true;

    try {
      const response = await fetch(`${API_URL}/api/perfiles/google-status`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        googleProcesado.current = false;
        throw new Error(result.error || "No se pudo verificar el perfil");
      }

      const nombre =
        result.nombre ||
        session.user.user_metadata?.given_name ||
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "Usuario";

      if (result.needsLastNames) {
        setGoogleNombre(nombre);
        setGoogleCompletarPerfil(true);
        return;
      }

      onSuccess({
        userName: nombre,
        surveyCompleted: result.survey_completed ?? false,
      });
    } catch (err) {
      googleProcesado.current = false;
      const message =
        err instanceof Error ? err.message : "Error verificando tu perfil";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    async function revisarSesion() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await procesarSesionGoogle(session);
      }
    }

    revisarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setTimeout(() => {
          procesarSesionGoogle(session);
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      googleProcesado.current = false;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión con Google";

      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  async function handleGuardarApellidosGoogle() {
    try {
      setError("");
      setLoading(true);

      if (!googleApellidoPat.trim()) {
        throw new Error("Ingresa tu apellido paterno");
      }

      if (!googleApellidoMat.trim()) {
        throw new Error("Ingresa tu apellido materno");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No se encontró una sesión activa");
      }

      const response = await fetch(
        `${API_URL}/api/perfiles/google-completar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            apellido_pat: googleApellidoPat.trim(),
            apellido_mat: googleApellidoMat.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo completar el perfil");
      }

      toast.success("Perfil completado correctamente");

      onSuccess({
        userName: result.user?.nombre || googleNombre || "Usuario",
        surveyCompleted: result.user?.survey_completed ?? false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name.trim()) throw new Error("Ingresa tu nombre");
    if (!apellidoPat.trim()) throw new Error("Ingresa tu apellido paterno");
    if (!apellidoMat.trim()) throw new Error("Ingresa tu apellido materno");
    if (!email.trim()) throw new Error("Ingresa tu correo electrónico");

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const response = await fetch(`${API_URL}/api/perfiles/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: name.trim(),
        apellido_pat: apellidoPat.trim(),
        apellido_mat: apellidoMat.trim(),
        email: email.trim(),
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo crear la cuenta");
    }

    toast.success(result.message || "Cuenta creada correctamente");

    if (!result.session) {
      setMode("login");
      toast.info("Revisa tu correo para confirmar tu cuenta");
      return;
    }

    if (result.session?.access_token && result.session?.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) throw sessionError;
    }

    onSuccess({
      userName: result.user?.nombre || name,
      surveyCompleted: result.user?.survey_completed ?? false,
    });
  }

  async function handleLogin() {
    if (!email.trim()) throw new Error("Ingresa tu correo electrónico");
    if (!password) throw new Error("Ingresa tu contraseña");

    const response = await fetch(`${API_URL}/api/perfiles/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Correo o contraseña incorrectos");
    }

    if (result.session?.access_token && result.session?.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) throw sessionError;
    }

    toast.success("Sesión iniciada correctamente");

    onSuccess({
      userName:
        result.user?.nombre ||
        result.user?.email ||
        email.split("@")[0],
      surveyCompleted: result.user?.survey_completed ?? false,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "#0F1825",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#E2E8F0",
    fontSize: 14,
  };

  const labelStyle = {
    fontSize: 13,
    color: "#94A3B8",
    display: "block",
    marginBottom: 6,
  };

  if (googleCompletarPerfil) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#121820" }}
      >
        <div
          className="w-full max-w-md p-10 rounded-2xl"
          style={{
            background: "#1A2332",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <Logo size={44} showName />

            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#E2E8F0",
                marginTop: 20,
                marginBottom: 6,
              }}
            >
              Completa tu perfil
            </h1>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                textAlign: "center",
              }}
            >
              Hola {googleNombre}, agrega tus apellidos para continuar.
            </p>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(226,75,74,0.1)",
                border: "1px solid rgba(226,75,74,0.3)",
                color: "#E24B4A",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Apellido paterno</label>
              <input
                type="text"
                value={googleApellidoPat}
                onChange={(e) => setGoogleApellidoPat(e.target.value)}
                placeholder="Tu apellido paterno"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Apellido materno</label>
              <input
                type="text"
                value={googleApellidoMat}
                onChange={(e) => setGoogleApellidoMat(e.target.value)}
                placeholder="Tu apellido materno"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGuardarApellidosGoogle}
              className="w-full py-3.5 rounded-xl mt-2 flex items-center justify-center gap-2"
              style={{
                background: "#5B88B2",
                color: "#fff",
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#121820" }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          position: "absolute",
          top: 24,
          left: 32,
          color: "#94A3B8",
          fontSize: 14,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      <div
        className="w-full max-w-md p-10 rounded-2xl"
        style={{
          background: "#1A2332",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size={44} showName />

          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#E2E8F0",
              marginTop: 20,
              marginBottom: 4,
            }}
          >
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>

          <p style={{ fontSize: 14, color: "#94A3B8" }}>
            {mode === "login"
              ? "Inicia sesión para continuar"
              : "Comienza tu viaje emocional"}
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-5"
          style={{
            background: "#fff",
            color: "#2C3E50",
            fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            o con correo
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(226,75,74,0.1)",
              border: "1px solid rgba(226,75,74,0.3)",
              color: "#E24B4A",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Apellido paterno</label>
                <input
                  value={apellidoPat}
                  onChange={(e) => setApellidoPat(e.target.value)}
                  placeholder="Tu apellido paterno"
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Apellido materno</label>
                <input
                  value={apellidoMat}
                  onChange={(e) => setApellidoMat(e.target.value)}
                  placeholder="Tu apellido materno"
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                color="#94A3B8"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                color="#94A3B8"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 rounded-xl outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl mt-2 flex items-center justify-center gap-2"
            style={{
              background: "#5B88B2",
              color: "#fff",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#94A3B8",
            marginTop: 20,
          }}
        >
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            style={{
              color: "#5B88B2",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}