import {
  Calendar, MessageCircle, BookOpen, BarChart2, FileText, Shield,
  ArrowRight, MapPin, Mail, Instagram, ChevronRight, Smartphone, Bell, Loader2, Menu, X
} from "lucide-react";
import { Logo } from "./Logo";
import { joinMobileWaitlist } from "@/lib/waitlist";
import controlarIcon from '../../assets/controlar.png';
import directorioIcon from '../../assets/directorio.png';
import graficoIcon from '../../assets/grafico-pastel-alt.png';
import mensajesIcon from '../../assets/mensajes.png';
import muescaMovilIcon from '../../assets/muesca-movil.png';
import aptitudMancuernasIcon from '../../assets/aptitud-con-mancuernas.png';
import siguiendoIcon from '../../assets/siguiendo.png';
import velaLotoYogaIcon from '../../assets/vela-de-loto-yoga.png';
import { useState } from "react";
import { motion } from "motion/react";
import { emotionIcons } from "@/lib/emotionIcons";
// Minimal SVG QR placeholder — replace innerContent with real QR when app is live
function QRPlaceholder() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Corner squares */}
      <rect x="8" y="8" width="32" height="32" rx="4" fill="none" stroke="#5B88B2" strokeWidth="3"/>
      <rect x="14" y="14" width="20" height="20" rx="2" fill="#5B88B2"/>
      <rect x="80" y="8" width="32" height="32" rx="4" fill="none" stroke="#5B88B2" strokeWidth="3"/>
      <rect x="86" y="14" width="20" height="20" rx="2" fill="#5B88B2"/>
      <rect x="8" y="80" width="32" height="32" rx="4" fill="none" stroke="#5B88B2" strokeWidth="3"/>
      <rect x="14" y="86" width="20" height="20" rx="2" fill="#5B88B2"/>
      {/* Data modules */}
      {[50,56,62,68,74].map(x => [50,56,62,68,74].map(y => (
        Math.sin(x * y) > 0.1 ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#5B88B2" opacity="0.7"/> : null
      )))}
      <rect x="50" y="8" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="58" y="8" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="66" y="8" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="50" y="16" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="66" y="16" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="50" y="24" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="58" y="24" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="66" y="24" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="8" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="16" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="24" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="32" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="8" y="58" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="24" y="58" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="8" y="66" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="16" y="66" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="32" y="66" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="80" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="88" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="96" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="107" y="50" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="80" y="58" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="96" y="58" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="107" y="58" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="80" y="66" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="88" y="66" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="107" y="66" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="50" y="80" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="58" y="80" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="50" y="88" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="66" y="88" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="58" y="96" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="66" y="96" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="50" y="107" width="5" height="5" rx="1" fill="#5B88B2"/>
      <rect x="66" y="107" width="5" height="5" rx="1" fill="#5B88B2"/>
    </svg>
  );
}

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

function MobileAppSection() {
  const [notified, setNotified] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      await joinMobileWaitlist(email);
      setNotified(true);
      setEmail("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos registrar tu correo. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-10" style={{ background: "#121820", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl p-5 sm:p-10 flex flex-col md:flex-row items-stretch md:items-center gap-8 md:gap-12"
          style={{ background: "linear-gradient(135deg, #1A2332 0%, #1E2D42 100%)", border: "1px solid rgba(91,136,178,0.18)" }}
        >
          {/* Left */}
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 11, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Próximamente</span>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: "rgba(245,166,35,0.15)", color: "#F5A623", fontWeight: 700 }}>En desarrollo</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 10, lineHeight: 1.2 }}>
              FriendIA en tu celular,<br />
              <span style={{ color: "#5B88B2" }}>siempre contigo</span>
            </h2>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, marginBottom: 24 }}>
              La app móvil de FriendIA está en camino. Notificaciones de check-in, acceso al diario y tu guía emocional desde cualquier lugar.
            </p>

            {/* Store badges — disabled/coming soon */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* App Store */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", opacity: 0.5, cursor: "not-allowed" }}
                title="Próximamente disponible"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#E2E8F0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <p style={{ fontSize: 9, color: "#94A3B8", lineHeight: 1 }}>Próximamente en</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", lineHeight: 1.3 }}>App Store</p>
                </div>
              </div>
              {/* Google Play */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", opacity: 0.5, cursor: "not-allowed" }}
                title="Próximamente disponible"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3.18 23.76c.3.17.64.24.98.21l12.09-12.09L12.8 8.43 3.18 23.76z" fill="#EA4335"/><path d="M20.7 10.37l-2.82-1.62-3.46 3.46 3.46 3.46 2.85-1.64c.81-.47.81-1.19-.03-1.66z" fill="#FBBC05"/><path d="M3.18.24C2.87.44 2.67.8 2.67 1.3v21.4c0 .5.2.87.51 1.06l12.09-12.09L3.18.24z" fill="#4285F4"/><path d="M16.25 12L4.18.24l-.99.57L15.28 12l-12.09 12.09.99.57L16.25 12z" fill="#34A853"/></svg>
                <div>
                  <p style={{ fontSize: 9, color: "#94A3B8", lineHeight: 1 }}>Próximamente en</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", lineHeight: 1.3 }}>Google Play</p>
                </div>
              </div>
            </div>

            {/* Notify form */}
            {!notified ? (
              <form onSubmit={handleNotify}>
                <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 10 }}>
                  <Bell size={13} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                  Avísame cuando esté lista
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                    placeholder="tu@correo.com"
                    className="flex-1 px-4 py-2.5 rounded-xl outline-none"
                    style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", fontSize: 13 }}
                    onFocus={e => (e.target.style.borderColor = "#5B88B2")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl transition-all"
                    style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", opacity: isSubmitting ? 0.7 : 1 }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Guardando…
                      </span>
                    ) : "Notificarme"}
                  </button>
                </div>
                {error && (
                  <p role="alert" style={{ color: "#E24B4A", fontSize: 12, marginTop: 8 }}>
                    {error}
                  </p>
                )}
                <p style={{ color: "#64748B", fontSize: 11, marginTop: 8 }}>
                  Usaremos tu correo únicamente para avisarte del lanzamiento.
                </p>
              </form>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(76,217,100,0.1)", border: "1px solid rgba(76,217,100,0.25)" }}>
                <img src={emotionIcons.celebration} alt="" className="h-8 w-8 object-contain" />
                <p style={{ fontSize: 13, color: "#4CD964" }}>¡Listo! Te avisamos cuando la app esté disponible.</p>
              </div>
            )}
          </div>

          {/* Right — QR + phone mockup */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div
              className="flex flex-col items-center gap-3 p-5 rounded-2xl"
              style={{ background: "#0F1825", border: "1px solid rgba(91,136,178,0.2)" }}
            >
              <div style={{ position: "relative" }}>
                <QRPlaceholder />
                {/* "coming soon" overlay */}
                <div
                  style={{
                    position: "absolute", inset: 0, borderRadius: 8,
                    background: "rgba(15,24,37,0.75)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                    backdropFilter: "blur(2px)"
                  }}
                >
                  <Smartphone size={28} color="#5B88B2" />
                  <span style={{ fontSize: 11, color: "#5B88B2", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>QR disponible<br />al lanzar</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", lineHeight: 1.5 }}>
                Escanea para descargar<br />
                <span style={{ color: "#2D3F55" }}>(disponible en el lanzamiento)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const privacySections = [
  ["Responsable y alcance", "FriendIA es una herramienta de acompañamiento emocional ofrecida por el consultorio del Lic. Irwing Alexis Calvillo Gutiérrez. Este aviso explica cómo se trata la información de quienes utilizan la plataforma."],
  ["Información que recopilamos", "Podemos almacenar datos de cuenta y perfil, respuestas del check-in emocional, entradas del diario, conversaciones con la guía de IA, preferencias y datos técnicos necesarios para iniciar sesión, proteger la cuenta y operar el servicio. Si activas voluntariamente el seguimiento del ciclo, también almacenamos las fechas de inicio y fin que registres."],
  ["Para qué se utiliza", "La información se usa para prestar las funciones solicitadas, mostrar historiales y tendencias emocionales, generar los reportes elegidos por el usuario, mantener la seguridad, corregir errores y mejorar la experiencia. Las fechas del ciclo se usan solo para mostrar tu historial y estimaciones dentro de tu perfil; no se envían a la guía de IA ni se incluyen automáticamente en reportes. FriendIA no vende datos personales."],
  ["Proveedores", "La plataforma puede usar proveedores de infraestructura, autenticación, base de datos e inteligencia artificial para procesar la información necesaria. Estos proveedores reciben únicamente lo requerido para prestar sus servicios y están sujetos a sus propias medidas y condiciones de privacidad."],
  ["Conservación y control", "Los datos se conservan mientras la cuenta permanezca activa o sean necesarios para operar el servicio y cumplir obligaciones aplicables. Desde Configuración puedes eliminar historiales o solicitar la eliminación de la cuenta. Los reportes PDF quedan bajo tu responsabilidad al descargarlos o compartirlos."],
  ["Seguridad y derechos", "Aplicamos controles razonables de acceso y seguridad, aunque ningún sistema conectado a internet puede garantizar riesgo cero. Puedes solicitar acceso, rectificación, cancelación u oposición escribiendo al correo de contacto."],
  ["Menores y cambios", "Si una persona menor de edad utiliza FriendIA, debe hacerlo con la autorización y supervisión correspondiente. Las modificaciones importantes se comunicarán en la plataforma y mostrarán una nueva fecha de vigencia."],
];

const termsSections = [
  ["Aceptación", "Al crear una cuenta o utilizar FriendIA aceptas estos términos y el Aviso de privacidad. Si no estás de acuerdo, no utilices la plataforma."],
  ["Naturaleza del servicio", "FriendIA es una herramienta de registro, reflexión y acompañamiento entre sesiones. No ofrece diagnósticos o tratamiento médico o psicológico, ni sustituye a profesionales de la salud. Las respuestas de IA pueden ser incompletas o equivocadas y no deben tomarse como instrucciones clínicas."],
  ["Emergencias", "FriendIA no es un servicio de emergencias. Si existe peligro inmediato o riesgo de daño, llama al 911 en México, acude a urgencias o contacta a una persona de confianza. No dependas del chat para recibir ayuda urgente."],
  ["Cuenta y uso permitido", "Debes proporcionar información correcta, proteger tus credenciales y notificarnos sobre accesos no autorizados. No puedes intentar vulnerar la plataforma, automatizar usos abusivos, suplantar personas, infringir derechos o utilizar el servicio para causar daño."],
  ["Contenido y reportes", "Conservas la responsabilidad sobre lo que escribes y sobre cualquier reporte que descargues o compartas. Autorizas únicamente el procesamiento técnico necesario para ofrecer las funciones que solicitas."],
  ["Disponibilidad", "Podemos actualizar, suspender o modificar funciones para mantener la seguridad y calidad del servicio. Aunque procuramos continuidad, no garantizamos funcionamiento ininterrumpido ni resultados terapéuticos específicos."],
  ["Terminación y cambios", "Puedes dejar de usar FriendIA y eliminar tu cuenta desde Configuración. Podemos restringir cuentas que incumplan estos términos. Los cambios se publicarán con una nueva fecha de vigencia."],
];

export function LegalDialog({ type, onClose }: { type: "privacy" | "terms"; onClose: () => void }) {
  const sections = type === "privacy" ? privacySections : termsSections;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" style={{ background: "rgba(4,9,15,.84)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <article className="relative w-full max-w-3xl max-h-[calc(100dvh-24px)] sm:max-h-[88dvh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8" style={{ background: "#1A2332", border: "1px solid rgba(91,136,178,.3)", boxShadow: "0 24px 80px rgba(0,0,0,.5)" }} onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <button onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 rounded-xl p-2" style={{ color: "#94A3B8", background: "rgba(255,255,255,.05)", border: 0 }}><X size={20} /></button>
        <Logo size={28} showName />
        <p className="mt-6" style={{ color: "#5B88B2", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Vigente desde el 9 de agosto de 2026</p>
        <h2 id="legal-title" className="mt-2 pr-10" style={{ color: "#E2E8F0", fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: 800 }}>{type === "privacy" ? "Aviso de privacidad" : "Términos de uso"}</h2>
        <div className="mt-6 space-y-6" style={{ color: "#B7C3D4", fontSize: 14, lineHeight: 1.75 }}>
          {sections.map(([title, text], index) => <section key={title}><h3 style={{ color: "#E2E8F0", fontWeight: 700 }}>{index + 1}. {title}</h3><p>{text}</p></section>)}
          <section><h3 style={{ color: "#E2E8F0", fontWeight: 700 }}>Contacto</h3><p>Para ejercer derechos o resolver dudas, escribe a <a href="mailto:alexiscvlldgo@gmail.com" style={{ color: "#78A6D1" }}>alexiscvlldgo@gmail.com</a>.</p></section>
        </div>
      </article>
    </div>
  );
}

export function Landing({ onLogin, onSignup, onConsultorio }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalDocument, setLegalDocument] = useState<"privacy" | "terms" | null>(null);

  function openLegal(document: "privacy" | "terms") {
    setMobileMenuOpen(false);
    setLegalDocument(document);
  }

  return (
    <div style={{ background: "#121820", minHeight: "100vh", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav
        className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(18,24,32,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <Logo size={34} showName />
        <div className="hidden xl:flex items-center gap-5">
          {[["Funcionalidades","#features"],["Cómo funciona","#how"],["Testimonios","#testimonials"],["Iniciar tu proceso","#start"]].map(([label, href]) => (
            <a key={label} href={href} style={{ color: "#94A3B8", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#E2E8F0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
            >{label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-5 py-2 rounded-xl transition-all"
            style={{ border: "1px solid rgba(91,136,178,0.5)", color: "#5B88B2", fontSize: 14, background: "transparent" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.08)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >Acceder</button>
          <a
            href="mailto:alexiscvlldgo@gmail.com"
            className="px-5 py-2 rounded-xl transition-all"
            style={{ background: "#5B88B2", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
          >Agendar consulta</a>
        </div>
        <button className="xl:hidden p-2 rounded-xl" onClick={() => setMobileMenuOpen(open => !open)} aria-label="Abrir menú" aria-expanded={mobileMenuOpen} style={{ background: "rgba(91,136,178,.12)", border: "1px solid rgba(91,136,178,.25)", color: "#78A6D1" }}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        {mobileMenuOpen && (
          <div className="absolute inset-x-3 top-full mt-2 max-h-[calc(100dvh-88px)] overflow-y-auto rounded-2xl p-3 xl:hidden" style={{ background: "#182230", border: "1px solid rgba(91,136,178,.25)", boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
            {[['Funcionalidades','#features'],['Cómo funciona','#how'],['Testimonios','#testimonials'],['Iniciar tu proceso','#start']].map(([label, href]) => <a key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3" style={{ color: "#CBD5E1", textDecoration: "none", fontSize: 14 }}>{label}</a>)}
            <div className="my-2" style={{ height: 1, background: "rgba(255,255,255,.08)" }} />
            <button onClick={() => { setMobileMenuOpen(false); onLogin(); }} className="w-full rounded-xl px-4 py-3 text-left" style={{ color: "#78A6D1", background: "rgba(91,136,178,.1)", border: 0, fontWeight: 700 }}>Acceder</button>
            <a href="mailto:alexiscvlldgo@gmail.com" className="mt-2 block w-full rounded-xl px-4 py-3 text-center" style={{ color: "#fff", background: "#5B88B2", textDecoration: "none", fontWeight: 700 }}>Agendar consulta</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg, #0F1825 0%, #121820 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
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
            <h1 style={{ fontSize: "clamp(2.35rem, 8vw, 58px)", fontWeight: 700, lineHeight: 1.05, color: "#E2E8F0", letterSpacing: "-0.02em", overflowWrap: "anywhere" }}>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
            
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
              Acceder →
            </button>
          </div>

          {/* Psychologist card — centered and prominent */}
          <div
            className="max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left overflow-hidden"
            style={{ background: "#1A2332", border: "1px solid rgba(91,136,178,0.2)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(91,136,178,0.18)", border: "2px solid rgba(91,136,178,0.4)" }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: "#5B88B2" }}>IA</span>
            </div>
            <div className="min-w-0 w-full" style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 3 }}>Psicólogo responsable</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>Lic. Irwing Alexis Calvillo Gutiérrez</p>
              <p style={{ fontSize: 13, color: "#94A3B8" }}>Licenciado en Psicología · Paseo del Calvario 200, Fracc. Las Alamedas</p>
            </div>
            <div className="flex w-full sm:w-auto min-w-0 flex-col gap-2">
              <a href="mailto:alexiscvlldgo@gmail.com"
                className="flex min-w-0 items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg transition-all break-all"
                style={{ background: "rgba(91,136,178,0.1)", color: "#5B88B2", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.2)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.1)")}
              ><Mail size={12} /> alexiscvlldgo@gmail.com</a>
              <a href="https://instagram.com/psic_alexis_calvillo" target="_blank" rel="noopener noreferrer"
                className="flex min-w-0 items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg transition-all break-all"
                style={{ background: "rgba(244,114,182,0.08)", color: "#F472B6", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,182,0.16)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,182,0.08)")}
              ><Instagram size={12} /> @psic_alexis_calvillo</a>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS FRIENDIA — brief explainer */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10" style={{ background: "#0F1825", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ fontSize: 14, color: "#94A3B8" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
            <section id="how" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-10">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                  <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Proceso</span>
                  <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 36px)", fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Cómo funciona con el consultorio</h2>
                  <p style={{ fontSize: 15, color: "#94A3B8", marginTop: 10 }}>FriendIA es una extensión de tu proceso terapéutico, no un sustituto.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <div className="hidden lg:block" style={{ position: "absolute", top: "50%", right: -16, transform: "translateY(-50%)", zIndex: 1 }}>
                          <ChevronRight size={24} color="#2D3F55" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
      

      {/* FEATURES */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-10" style={{ background: "#0F1825" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Funcionalidades</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 36px)", fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Todo lo que incluye tu acceso</h2>
            <p style={{ fontSize: 15, color: "#94A3B8", marginTop: 10 }}>Diseñado con responsabilidad clínica para complementar tu proceso terapéutico.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <section id="testimonials" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2" style={{ fontSize: 12, color: "#5B88B2", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              <img src={emotionIcons.group} alt="" className="h-8 w-8 object-contain" />
              Pacientes
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 36px)", fontWeight: 700, color: "#E2E8F0", marginTop: 8 }}>Lo que dicen quienes la usan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
      <section id="start" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-10 scroll-mt-20" style={{ background: "#0F1825" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 36px)", fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>
            ¿Listo para iniciar tu proceso?
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7, marginBottom: 32 }}>
            Comunícate directamente con el Lic. Calvillo para agendar tu primera consulta. Una vez que seas paciente, te compartimos acceso a FriendIA.
          </p>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

      {/* MOBILE APP */}
      <MobileAppSection />

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 lg:px-10 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <Logo size={26} showName />
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 10, maxWidth: 400, lineHeight: 1.6 }}>
              Herramienta de apoyo emocional ofrecida por el consultorio del Lic. Irwing Alexis Calvillo Gutiérrez.<br />
              FriendIA no diagnostica ni reemplaza la atención psicológica profesional.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <button onClick={() => openLegal("privacy")} style={{ fontSize: 13, color: "#94A3B8", background: "none", border: 0, padding: 0 }}>Privacidad</button>
              <button onClick={() => openLegal("terms")} style={{ fontSize: 13, color: "#94A3B8", background: "none", border: 0, padding: 0 }}>Términos</button>
              <a href="#start" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>Contacto</a>
            </div>
            <button
              onClick={onLogin}
              style={{ fontSize: 13, color: "#5B88B2", background: "none", border: "none", cursor: "pointer" }}
            >Acceso para pacientes →</button>
          </div>
        </div>
      </footer>
      {legalDocument && <LegalDialog type={legalDocument} onClose={() => setLegalDocument(null)} />}
    </div>
  );
}
