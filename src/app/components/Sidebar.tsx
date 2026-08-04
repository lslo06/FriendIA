import { Home, BookOpen, MessageCircle, LifeBuoy, User, Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

type Screen = "dashboard" | "diary" | "chat" | "help" | "profile" | "settings";

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  hideMobile?: boolean;
}

const mainNav = [
  { id: "dashboard" as Screen, label: "Inicio", icon: Home },
  { id: "diary" as Screen, label: "Diario", icon: BookOpen },
  { id: "chat" as Screen, label: "Hablar con IA", icon: MessageCircle },
  { id: "help" as Screen, label: "Ayuda", icon: LifeBuoy },
];

const bottomNav = [
  { id: "profile" as Screen, label: "Perfil", icon: User },
  { id: "settings" as Screen, label: "Configuración", icon: Settings },
];

export function Sidebar({ active, onNavigate, onLogout, hideMobile = false }: SidebarProps) {
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  useEffect(() => {
    setMobileSettingsOpen(false);
  }, [active]);

  function navigateMobile(screen: Screen) {
    setMobileSettingsOpen(false);
    onNavigate(screen);
  }

  return (
    <>
      <aside
        style={{ width: 220, minWidth: 220, background: "var(--app-surface)", borderRight: "1px solid var(--app-border)" }}
        className="hidden md:flex flex-col h-full py-6 px-3"
      >
      <div className="px-3 mb-8">
        <Logo size={32} showName />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {mainNav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-150"
              style={{
                background: isActive ? "rgba(91,136,178,0.18)" : "transparent",
                color: isActive ? "#5B88B2" : "var(--app-text-muted)",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--app-border-subtle)";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: "calc(14px * var(--app-font-scale))", fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 mt-4 pt-4" style={{ borderTop: "1px solid var(--app-border)" }}>
        {bottomNav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
              style={{
                background: isActive ? "rgba(91,136,178,0.18)" : "transparent",
                color: isActive ? "#5B88B2" : "var(--app-text-muted)",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--app-border-subtle)";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: "calc(14px * var(--app-font-scale))" }}>{label}</span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
          style={{ color: "var(--app-text-muted)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--app-border-subtle)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <LogOut size={18} />
          <span style={{ fontSize: "calc(14px * var(--app-font-scale))" }}>Cerrar sesión</span>
        </button>
      </div>
      </aside>

      {mobileSettingsOpen && !hideMobile && (
        <>
          <button className="fixed inset-0 z-40 md:hidden" aria-label="Cerrar menú de ajustes" onClick={() => setMobileSettingsOpen(false)} style={{ background: "rgba(4,9,15,.28)", border: 0 }} />
          <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] right-3 z-50 w-56 overflow-hidden rounded-2xl p-2 md:hidden" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-medium)", boxShadow: "0 16px 45px rgba(0,0,0,.4)" }}>
            {bottomNav.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => navigateMobile(id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left" style={{ color: active === id ? "#5B88B2" : "var(--app-text)", background: active === id ? "rgba(91,136,178,.14)" : "transparent" }}>
                <Icon size={18} /><span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
              </button>
            ))}
            <div className="my-1" style={{ height: 1, background: "var(--app-border)" }} />
            <button onClick={() => { setMobileSettingsOpen(false); onLogout(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left" style={{ color: "#E24B4A", background: "transparent" }}>
              <LogOut size={18} /><span style={{ fontSize: 13, fontWeight: 600 }}>Cerrar sesión</span>
            </button>
          </div>
        </>
      )}

      <nav
        className={`${hideMobile ? "hidden" : "grid"} fixed inset-x-0 bottom-0 z-50 grid-cols-5 md:hidden`}
        style={{ background: "var(--app-surface)", borderTop: "1px solid var(--app-border)", paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegación principal"
      >
        {mainNav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const shortLabel = id === "dashboard" ? "Inicio" : id === "diary" ? "Diario" : id === "chat" ? "Chat" : "Ayuda";
          return (
            <button
              key={id}
              onClick={() => navigateMobile(id)}
              className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2"
              style={{ color: isActive ? "#5B88B2" : "var(--app-text-muted)", background: isActive ? "rgba(91,136,178,.12)" : "transparent" }}
              aria-label={label}
            >
              <Icon size={19} />
              <span className="w-full truncate text-center" style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{shortLabel}</span>
            </button>
          );
        })}
        <button onClick={() => setMobileSettingsOpen(open => !open)} className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2" style={{ color: mobileSettingsOpen || active === "profile" || active === "settings" ? "#5B88B2" : "var(--app-text-muted)", background: mobileSettingsOpen || active === "profile" || active === "settings" ? "rgba(91,136,178,.12)" : "transparent" }} aria-expanded={mobileSettingsOpen} aria-label="Abrir ajustes">
          <Settings size={19} /><span className="w-full truncate text-center" style={{ fontSize: 10, fontWeight: 600 }}>Ajustes</span>
        </button>
      </nav>
    </>
  );
}
