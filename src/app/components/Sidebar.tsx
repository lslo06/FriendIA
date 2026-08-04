import { Home, BookOpen, MessageCircle, LifeBuoy, User, Settings, LogOut } from "lucide-react";
import { Logo } from "./Logo";

type Screen = "dashboard" | "diary" | "chat" | "help" | "profile" | "settings";

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
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

export function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  const mobileNav = [...mainNav, ...bottomNav];

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

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 md:hidden"
        style={{ background: "var(--app-surface)", borderTop: "1px solid var(--app-border)", paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegación principal"
      >
        {mobileNav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const shortLabel = id === "dashboard" ? "Inicio" : id === "diary" ? "Diario" : id === "chat" ? "Chat" : id === "help" ? "Ayuda" : id === "profile" ? "Perfil" : "Ajustes";
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2"
              style={{ color: isActive ? "#5B88B2" : "var(--app-text-muted)", background: isActive ? "rgba(91,136,178,.12)" : "transparent" }}
              aria-label={label}
            >
              <Icon size={19} />
              <span className="w-full truncate text-center" style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
