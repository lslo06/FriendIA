import {
  Calendar, MessageCircle, BookOpen, BarChart2, FileText, Shield,
  ArrowRight, MapPin, Mail, Instagram, ChevronRight, CheckCircle
} from "lucide-react";
import { Logo } from "./Logo";
import controlarIcon from '../../assets/controlar.png';
import directorioIcon from '../../assets/directorio.png';
import graficoIcon from '../../assets/grafico-pastel-alt.png';
import mensajesIcon from '../../assets/mensajes.png';
import muescaMovilIcon from '../../assets/muesca-movil.png';
import aptitudMancuernasIcon from '../../assets/aptitud-con-mancuernas.png';
import siguiendoIcon from '../../assets/siguiendo.png';
import velaLotoYogaIcon from '../../assets/vela-de-loto-yoga.png';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
  onConsultorio: () => void;
}

const features = [
  { icon: MessageCircle, title: "Guía emocional con IA", desc: "Tu acompañante entre sesiones. Disponible 24/7 para escucharte, sin juicios y con empatía." },
  { icon: Calendar, title: "Rueda de emociones diaria", desc: "Check-in emocional estructurado con vocabulario afectivo preciso, no solo colores." },
  { icon: BookOpen, title: "Diario emocional privado", desc: "Escribe lo que sientes en un espacio seguro y completamente tuyo." },
  { icon: BarChart2, title: "Estadísticas semanales", desc: "Visualiza tus patrones emocionales a lo largo del tiempo con gráficas claras." },
  { icon: FileText, title: "Reporte PDF para tu psicólogo", desc: "Exporta tu historial emocional y compártelo en consulta para enriquecer tu proceso." },
  { icon: Shield, title: "Privacidad total", desc: "Tus datos están cifrados y nunca compartidos. Lo que escribes es solo tuyo." },
];

const howItWorks = [
  { num: "01", iconAsset: directorioIcon, title: "Agenda tu consulta", desc: "Inicia un proceso terapéutico con el Lic. Calvillo en su consultorio de Las Alamedas." },
  { num: "02", iconAsset: muescaMovilIcon, title: "Accede a FriendIA", desc: "Te compartimos acceso a la plataforma como herramienta de apoyo entre sesiones." },
  { num: "03", iconAsset: mensajesIcon, title: "Registra y conversa", desc: "Escribe en tu diario, habla con la guía de IA y registra tus emociones cada día." },
  { num: "04", iconAsset: graficoIcon, title: "Comparte tu progreso", desc: "Lleva tu reporte PDF a la próxima sesión y trabajamos juntos desde ahí." },
];

const testimonials = [
  { name: "Mariana G.", text: "Tener FriendIA entre sesiones me ayudó a identificar mis patrones de ansiedad que antes no notaba. Llegar a consulta con ese registro cambió todo.", iconAsset: siguiendoIcon },
  { name: "Carlos R.", text: "Al principio me daba pena escribir lo que sentía. El diario me dio un espacio sin presión. Ahora llego a sesión con mucho más claridad.", iconAsset: velaLotoYogaIcon },
  { name: "Sofía M.", text: "La técnica de grounding que me sugirió la IA cuando estaba en un momento difícil fue exactamente lo que necesitaba a las 2am.", iconAsset: aptitudMancuernasIcon },
];

export function Landing({ onLogin, onSignup, onConsultorio }: LandingProps) {
  return (
    <div style={{ background: "#121820", minHeight: "100vh", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>

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
        <Logo size={34} showName />
        <div className="flex items-center gap-8">
          {[["Funcionalidades","#features"],["Cómo funciona","#how"],["Testimonios","#testimonials"]].map(([label, href]) => (
            <a key={label} href={href} style={{ color: "#94A3B8", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#E2E8F0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
            >{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-5 py-2 rounded-xl transition-all"
            style={{ border: "1px solid rgba(91,136,178,0.5)", color: "#5B88B2", fontSize: 14, background: "transparent" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.08)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >Ya soy paciente</button>
          <a
            href="mailto:alexiscvlldgo@gmail.com"
            className="px-5 py-2 rounded-xl transition-all"
            style={{ background: "#5B88B2", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
          >Agendar consulta</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg, #0F1825 0%, #121820 100%)" }}>
        <div className="max-w-7xl mx-auto px-10 pt-20 pb-24">
          {/* Pill */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "rgba(91,136,178,0.1)", border: "1px solid rgba(91,136,178,0.25)", fontSize: 13, color: "#5B88B2" }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B88B2" }} />
              Herramienta terapéutica inter-sesiones
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center mb-6" style={{ maxWidth: 760, margin: "0 auto 24px" }}>
            <h1 style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.05, color: "#E2E8F0", letterSpacing: "-0.02em" }}>
              Tu proceso terapéutico,{" "}
              <span style={{ color: "#5B88B2" }}>acompañado todos los días</span>
            </h1>
          </div>
          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.7, textAlign: "center", maxWidth: 560, margin: "0 auto 16px" }}>
            El Lic. Irwing Alexis Calvillo Gutiérrez pone a disposición de sus pacientes <strong style={{ color: "#E2E8F0" }}>FriendIA</strong> — una plataforma de acompañamiento emocional con IA diseñada para complementar tu terapia entre sesiones.
          </p>
          <p style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 36 }}>
            No diagnostica · No reemplaza la terapia · Es tu espacio personal de registro y reflexión
          </p>

          {/* CTAs */}
          <div className="flex gap-4 justify-center mb-16">
            <a
              href="mailto:alexiscvlldgo@gmail.com"
              className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >
              Agendar consulta <ArrowRight size={18} />
            </a>
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{ border: "1px solid rgba(226,232,240,0.15)", color: "#E2E8F0", fontSize: 16, background: "transparent" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              Ya soy paciente →
            </button>
          </div>

          {/* Psychologist card — centered and prominent */}
          <div
            className="max-w-2xl mx-auto p-6 rounded-2xl flex items-center gap-6"
            style={{ background: "#1A2332", border: "1px solid rgba(91,136,178,0.2)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(91,136,178,0.18)", border: "2px solid rgba(91,136,178,0.4)" }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: "#5B88B2" }}>IA</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 3 }}>Psicólogo responsable</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>Lic. Irwing Alexis Calvillo Gutiérrez</p>
              <p style={{ fontSize: 13, color: "#94A3B8" }}>Licenciado en Psicología · Paseo del Calvario 200, Fracc. Las Alamedas</p>
            </div>
            <div className="flex flex-col gap-2">
              <a href="mailto:alexiscvlldgo@gmail.com"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(91,136,178,0.1)", color: "#5B88B2", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.2)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.1)")}
              ><Mail size={12} /> alexiscvlldgo@gmail.com</a>
              <a href="https://instagram.com/psic_alexis_calvillo" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(244,114,182,0.08)", color: "#F472B6", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,182,0.16)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,182,0.08)")}
              ><Instagram size={12} /> @psic_alexis_calvillo</a>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS FRIENDIA — brief explainer */}
      <section className="py-16 px-10" style={{ background: "#0F1825", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>
            ¿Qué es FriendIA?
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, marginBottom: 28 }}>
            Es una plataforma de bienestar emocional con inteligencia artificial creada para que los pacientes del consultorio tengan un espacio de reflexión, registro y acompañamiento <em>entre</em> sesiones. FriendIA no diagnostica ni da consejos directivos — formula preguntas abiertas para promover tu propio autoconocimiento, basándose en principios de catarsis emocional y etiquetado afectivo respaldados por la evidencia.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              "Fundamentado en evidencia clínica",
              "Preguntas abiertas, no respuestas prefabricadas",
              "Modo emergencia con líneas de crisis",
              "Reportes PDF para compartir en consulta",
              "Detecta rumiación y propone técnicas de anclaje",
              "Privado, cifrado, sin diagnósticos",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>
                  <img src={controlarIcon} alt="Check" className="w-4 h-4 brightness-0 invert" />
                </span>
                <span style={{ fontSize: 14, color: "#94A3B8" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Proceso</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Cómo funciona con el consultorio</h2>
            <p style={{ fontSize: 15, color: "#94A3B8", marginTop: 10 }}>FriendIA es una extensión de tu proceso terapéutico, no un sustituto.</p>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {howItWorks.map(({ num, iconAsset, title, desc }, i) => (
              <div key={num} style={{ position: "relative" }}>
                <div
                  className="p-6 rounded-2xl h-full"
                  style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img src={iconAsset} alt={title} className="w-7 h-7 brightness-0 invert" />
                    <span style={{ fontSize: 11, color: "#5B88B2", fontWeight: 700, letterSpacing: "0.06em" }}>{num}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{desc}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div style={{ position: "absolute", top: "50%", right: -16, transform: "translateY(-50%)", zIndex: 1 }}>
                    <ChevronRight size={24} color="#2D3F55" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-10" style={{ background: "#0F1825" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Funcionalidades</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Todo lo que incluye tu acceso</h2>
            <p style={{ fontSize: 15, color: "#94A3B8", marginTop: 10 }}>Diseñado con responsabilidad clínica para complementar tu proceso terapéutico.</p>
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
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Pacientes</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Lo que dicen quienes la usan</h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {testimonials.map(({ name, text, iconAsset }) => (
              <div key={name} className="p-6 rounded-2xl" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ display: "block", marginBottom: 14 }}>
                  <img src={iconAsset} alt={name} className="w-7 h-7 brightness-0 invert" />
                </span>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{text}"</p>
                <p style={{ fontSize: 13, color: "#5B88B2", fontWeight: 600 }}>— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — Contact */}
      <section className="py-20 px-10" style={{ background: "#0F1825" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>
            ¿Listo para iniciar tu proceso?
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7, marginBottom: 32 }}>
            Comunícate directamente con el Lic. Calvillo para agendar tu primera consulta. Una vez que seas paciente, te compartimos acceso a FriendIA.
          </p>

          {/* Contact cards */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: MapPin, label: "Consultorio", value: "Paseo del Calvario 200", sub: "Fracc. Las Alamedas", color: "#5B88B2", href: "https://maps.google.com/?q=Paseo+del+Calvario+200+Las+Alamedas" },
              { icon: Mail, label: "Correo", value: "alexiscvlldgo@gmail.com", sub: "Respuesta en 24 hrs", color: "#4CD964", href: "mailto:alexiscvlldgo@gmail.com" },
              { icon: Instagram, label: "Instagram", value: "@psic_alexis_calvillo", sub: "DM para consultas", color: "#F472B6", href: "https://instagram.com/psic_alexis_calvillo" },
            ].map(({ icon: Icon, label, value, sub, color, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 rounded-2xl transition-all"
                style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none", display: "flex" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = `${color}50`)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 2, wordBreak: "break-all" }}>{value}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <a
              href="mailto:alexiscvlldgo@gmail.com"
              className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >
              <Mail size={18} /> Agendar por correo
            </a>
            <a
              href="https://instagram.com/psic_alexis_calvillo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{ border: "1px solid rgba(244,114,182,0.4)", color: "#F472B6", background: "transparent", fontSize: 16, fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,182,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <Instagram size={18} /> Escribir por Instagram
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-10 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Logo size={26} showName />
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 10, maxWidth: 400, lineHeight: 1.6 }}>
              Herramienta de apoyo emocional ofrecida por el consultorio del Lic. Irwing Alexis Calvillo Gutiérrez.<br />
              FriendIA no diagnostica ni reemplaza la atención psicológica profesional.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-6">
              {["Privacidad", "Términos", "Contacto"].map(link => (
                <a key={link} href="#" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#E2E8F0")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
                >{link}</a>
              ))}
            </div>
            <button
              onClick={onLogin}
              style={{ fontSize: 13, color: "#5B88B2", background: "none", border: "none", cursor: "pointer" }}
            >Acceso para pacientes →</button>
          </div>
        </div>
      </footer>
    </div>
  );
}