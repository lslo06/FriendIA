import {
  Calendar, MessageCircle, BookOpen, BarChart2, HeartHandshake, Shield,
  CheckCircle, ArrowRight, ChevronRight
} from "lucide-react";
import { Logo } from "./Logo";

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

const features = [
  { icon: Calendar, title: "Calendario emocional", desc: "Registra cómo te sientes cada día y visualiza tus patrones emocionales a lo largo del tiempo." },
  { icon: MessageCircle, title: "IA conversacional", desc: "Tu Guía emocional disponible 24/7, entrenada para escuchar, acompañar y orientar." },
  { icon: BookOpen, title: "Diario emocional", desc: "Escribe tus pensamientos en un espacio privado y seguro. Solo para ti." },
  { icon: BarChart2, title: "Estadísticas semanales", desc: "Visualiza tu progreso emocional con gráficas claras y comprensibles." },
  { icon: HeartHandshake, title: "Ayuda profesional", desc: "Accede a psicólogos certificados y líneas de crisis cuando más lo necesitas." },
  { icon: Shield, title: "Privacidad total", desc: "Tus datos están cifrados y nunca compartidos. Tu espacio, tus reglas." },
];

const steps = [
  { num: "01", icon: "📝", title: "Regístrate y cuéntanos sobre ti", desc: "Una breve encuesta inicial para personalizar tu experiencia emocional." },
  { num: "02", icon: "💬", title: "Habla con tu Guía emocional cada día", desc: "Conversa con nuestra IA empática, disponible en cualquier momento del día." },
  { num: "03", icon: "📊", title: "Visualiza tu progreso y busca apoyo", desc: "Entiende tus patrones y accede a apoyo profesional cuando lo necesites." },
];

export function Landing({ onLogin, onSignup }: LandingProps) {
  return (
    <div style={{ background: "#121820", minHeight: "100vh", color: "#E2E8F0" }}>
      {/* NAV */}
      <nav
        className="flex items-center justify-between px-10 py-4"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(18,24,32,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <Logo size={36} showName />
        <div className="flex items-center gap-8">
          {["Funcionalidades", "Cómo funciona", "Para consultorios"].map(link => (
            <a key={link} href="#" style={{ color: "#94A3B8", fontSize: 14, transition: "color 0.15s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#E2E8F0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
            >{link}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-5 py-2 rounded-xl transition-all"
            style={{ border: "1px solid rgba(91,136,178,0.5)", color: "#5B88B2", fontSize: 14, background: "transparent" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.08)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >Iniciar sesión</button>
          <button
            onClick={onSignup}
            className="px-5 py-2 rounded-xl transition-all"
            style={{ background: "#5B88B2", color: "#fff", fontSize: 14, fontWeight: 600 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
          >Comenzar gratis</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-10 pt-20 pb-24 flex items-center gap-16 max-w-7xl mx-auto">
        <div style={{ flex: 1 }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(91,136,178,0.12)", border: "1px solid rgba(91,136,178,0.3)", fontSize: 13, color: "#5B88B2" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B88B2", display: "inline-block" }} />
            Bienestar emocional · Con IA
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, color: "#E2E8F0", marginBottom: 20 }}>
            Tu compañero emocional<br />
            <span style={{ color: "#5B88B2" }}>siempre disponible</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            FriendIA te acompaña a identificar, expresar y procesar tus emociones día a día, con el apoyo de inteligencia artificial empática y herramientas de bienestar.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onSignup}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontSize: 15, fontWeight: 600 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >
              Empezar ahora <ArrowRight size={16} />
            </button>
            <button
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl transition-all"
              style={{ border: "1px solid rgba(226,232,240,0.2)", color: "#E2E8F0", fontSize: 15, background: "transparent" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              Ver demo
            </button>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          <div
            style={{
              background: "#1A2332",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)"
            }}
          >
            {/* browser bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#0F1825", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E24B4A" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F5A623" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4CD964" }} />
              <div style={{ flex: 1, background: "#1A2332", borderRadius: 6, height: 22, marginLeft: 8, display: "flex", alignItems: "center", paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>app.friendia.mx</span>
              </div>
            </div>
            {/* preview content */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontSize: 20 }}>👋</span>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>Hola, Sofía</p>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>Viernes, 12 de junio de 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[["Días activos", "24", "#5B88B2"], ["Entradas diario", "18", "#4CD964"], ["Racha actual", "7 🔥", "#F5A623"]].map(([label, val, color]) => (
                  <div key={label} style={{ background: "#0F1825", borderRadius: 12, padding: "12px 14px" }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: color as string }}>{val}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0F1825", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>Tu semana emocional</p>
                <div className="flex gap-2">
                  {[["L","#4CD964"],["M","#4CD964"],["Mi","#F5A623"],["J","#E24B4A"],["V","#5B88B2"],["S","#1E2D42"],["D","#1E2D42"]].map(([d,c]) => (
                    <div key={d} className="flex flex-col items-center gap-1">
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: c as string, opacity: c === "#1E2D42" ? 0.4 : 1 }} />
                      <span style={{ fontSize: 10, color: "#94A3B8" }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-10 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Funcionalidades</span>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Todo lo que necesitas para tu bienestar</h2>
          <p style={{ fontSize: 16, color: "#94A3B8", marginTop: 10 }}>Herramientas diseñadas con empatía para acompañarte cada día.</p>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl transition-all"
              style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(91,136,178,0.3)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(91,136,178,0.12)" }}>
                <Icon size={20} color="#5B88B2" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-10 py-20" style={{ background: "#0F1825" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Cómo funciona</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Tres pasos hacia tu bienestar</h2>
          </div>
          <div className="flex gap-8 items-start">
            {steps.map((step, i) => (
              <div key={step.num} className="flex-1 flex items-start gap-4">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: "#1A2332" }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: 11, color: "#5B88B2", fontWeight: 700, letterSpacing: "0.08em" }}>{step.num}</span>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#E2E8F0", margin: "6px 0" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={28} color="#2D3F55" style={{ marginTop: 14, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR CONSULTORIES */}
      <section className="px-10 py-20 max-w-7xl mx-auto">
        <div
          className="rounded-2xl p-12 flex items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #1A2332 0%, #1E2D42 100%)", border: "1px solid rgba(91,136,178,0.2)" }}
        >
          <div style={{ maxWidth: 560 }}>
            <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Para consultorios</span>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: "#E2E8F0", margin: "10px 0 12px" }}>Una herramienta complementaria para psicólogos</h2>
            <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7 }}>
              Clínicas y psicólogos pueden integrar FriendIA como apoyo entre sesiones para sus pacientes. Registros emocionales, reportes semanales y seguimiento entre consultas.
            </p>
          </div>
          <button
            className="flex-shrink-0 px-7 py-3.5 rounded-xl transition-all"
            style={{ background: "#5B88B2", color: "#fff", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
          >Contactar para consultorios</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-10 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Logo size={28} showName />
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 10, maxWidth: 360 }}>
              FriendIA no sustituye la atención psicológica profesional. Ante cualquier emergencia, busca apoyo profesional.
            </p>
          </div>
          <div className="flex gap-6">
            {["Privacidad", "Términos", "Contacto"].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: "#94A3B8" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#E2E8F0")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
