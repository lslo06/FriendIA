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
  return (
    <aside
      style={{ width: 220, minWidth: 220, background: "#1A2332", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      className="flex flex-col h-full py-6 px-3"
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
                color: isActive ? "#5B88B2" : "#94A3B8",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {bottomNav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
              style={{
                background: isActive ? "rgba(91,136,178,0.18)" : "transparent",
                color: isActive ? "#5B88B2" : "#94A3B8",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: 14 }}>{label}</span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
          style={{ color: "#94A3B8" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <LogOut size={18} />
          <span style={{ fontSize: 14 }}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
