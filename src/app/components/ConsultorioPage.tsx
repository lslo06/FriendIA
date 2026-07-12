import { MapPin, Mail, Instagram, Phone, ArrowLeft, BookOpen, Brain, HeartHandshake, FileText } from "lucide-react";
import { Logo } from "./Logo";

interface ConsultorioPageProps {
  onBack: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

const services = [
  { icon: Brain, title: "Terapia individual", desc: "Atención psicológica personalizada para adultos. Intervención basada en evidencia para ansiedad, depresión, estrés y más." },
  { icon: HeartHandshake, title: "Seguimiento inter-sesiones", desc: "FriendIA como herramienta complementaria entre consultas: registro emocional, diario y reportes semanales en PDF." },
  { icon: BookOpen, title: "Psicoeducación emocional", desc: "Recursos y técnicas de regulación emocional basadas en TCC para trabajar entre sesiones." },
  { icon: FileText, title: "Reportes para profesionales", desc: "Los pacientes pueden exportar su historial emocional para compartirlo en consulta y enriquecer el proceso terapéutico." },
];

export function ConsultorioPage({ onBack, onLogin, onSignup }: ConsultorioPageProps) {
  return (
    <div style={{ background: "#121820", minHeight: "100vh", color: "#E2E8F0" }}>
      {/* Nav */}
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
            className="px-5 py-2 rounded-xl"
            style={{ background: "#5B88B2", color: "#fff", fontSize: 14, fontWeight: 600 }}
          >Comenzar gratis</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-14">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 transition-all"
          style={{ color: "#94A3B8", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#E2E8F0")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
        >
          <ArrowLeft size={16} /> Volver al inicio
        </button>

        {/* Hero del consultorio */}
        <div
          className="rounded-2xl p-10 mb-10"
          style={{
            background: "linear-gradient(135deg, #1A2332 0%, #1E2D42 100%)",
            border: "1px solid rgba(91,136,178,0.2)"
          }}
        >
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(91,136,178,0.2)", border: "2px solid rgba(91,136,178,0.4)" }}
            >
              <span style={{ fontSize: 36, fontWeight: 700, color: "#5B88B2" }}>IA</span>
            </div>

            <div>
              <span style={{ fontSize: 11, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Psicólogo responsable</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", margin: "8px 0 4px", lineHeight: 1.2 }}>
                Lic. Irwing Alexis<br />Calvillo Gutiérrez
              </h1>
              <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 16 }}>Licenciado en Psicología · Bienestar emocional y salud mental</p>

              <div className="flex flex-wrap gap-2">
                {["Ansiedad", "Depresión", "Estrés laboral", "Autoestima", "TCC"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full" style={{ fontSize: 12, background: "rgba(91,136,178,0.12)", color: "#5B88B2", fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            {
              icon: MapPin,
              label: "Consultorio",
              value: "Paseo del Calvario 200",
              sub: "Fraccionamiento Las Alamedas",
              color: "#5B88B2",
              href: "https://maps.google.com/?q=Paseo+del+Calvario+200+Fraccionamiento+Las+Alamedas"
            },
            {
              icon: Mail,
              label: "Correo electrónico",
              value: "alexiscvlldgo@gmail.com",
              sub: "Respuesta en 24 hrs",
              color: "#4CD964",
              href: "mailto:alexiscvlldgo@gmail.com"
            },
            {
              icon: Instagram,
              label: "Instagram",
              value: "@psic_alexis_calvillo",
              sub: "Contenido de bienestar",
              color: "#F472B6",
              href: "https://instagram.com/psic_alexis_calvillo"
            },
          ].map(({ icon: Icon, label, value, sub, color, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl transition-all"
              style={{
                background: "#1A2332",
                border: "1px solid rgba(255,255,255,0.06)",
                textDecoration: "none",
                display: "flex",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = `${color}40`)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 2 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* FriendIA + Consultorio integration */}
        <div className="mb-10">
          <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Cómo funciona en consulta</span>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#E2E8F0", margin: "10px 0 6px" }}>FriendIA como herramienta inter-sesiones</h2>
          <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.7, marginBottom: 24 }}>
            FriendIA no reemplaza la psicoterapia — la complementa. Los pacientes pueden registrar sus emociones, escribir en su diario y conversar con la guía de IA entre sesiones, lo que permite un seguimiento más continuo y enriquece cada consulta presencial.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {services.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-2xl"
                style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(91,136,178,0.12)" }}>
                  <Icon size={18} color="#5B88B2" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA agendar */}
        <div
          className="rounded-2xl p-8 flex items-center justify-between gap-6"
          style={{ background: "rgba(91,136,178,0.08)", border: "1px solid rgba(91,136,178,0.25)" }}
        >
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>¿Quieres agendar una consulta?</h3>
            <p style={{ fontSize: 14, color: "#94A3B8" }}>Escríbeme por correo o Instagram y con gusto te atiendo.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="mailto:alexiscvlldgo@gmail.com"
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >
              <Mail size={15} /> Enviar correo
            </a>
            <a
              href="https://instagram.com/psic_alexis_calvillo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all"
              style={{ border: "1px solid rgba(244,114,182,0.4)", color: "#F472B6", background: "transparent", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,182,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <Instagram size={15} /> Instagram
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: "#2D3F55", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
          FriendIA es una herramienta de apoyo emocional. No diagnostica, no emite tratamientos y no reemplaza la atención psicológica profesional.<br />
          El uso de la plataforma está sujeto a los Términos de Servicio y la Política de Privacidad.
        </p>
      </div>
    </div>
  );
}
