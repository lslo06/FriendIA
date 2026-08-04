import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, LogOut } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName, saveSurveyProfile } from "@/lib/profiles";
import { Landing } from "./components/Landing";
import { Auth, type AuthResult } from "./components/Auth";
import { Survey, type SurveyData } from "./components/Survey";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { Diary } from "./components/Diary";
import { Help } from "./components/Help";
import { Profile } from "./components/Profile";
import { AppSettings } from "./components/AppSettings";
import { EmergencyModal } from "./components/EmergencyModal";
import { ConsultorioPage } from "./components/ConsultorioPage";

type AppScreen = "landing" | "auth" | "survey" | "app" | "consultorio";
type AppTab = "dashboard" | "diary" | "chat" | "help" | "profile" | "settings";

function isPasswordSetupFlow() {
  return (
    new URLSearchParams(window.location.search).get("auth_action") ===
      "create-password" ||
    window.sessionStorage.getItem("friendia:auth_action") ===
      "create-password"
  );
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [showEmergency, setShowEmergency] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const userName = getDisplayName(profile, user?.email);

  useEffect(() => {
    if (loading || !user) return;

    if (isPasswordSetupFlow()) {
      setAuthMode("login");
      if (screen !== "auth") setScreen("auth");
      return;
    }

    if (profile?.survey_completed && (screen === "landing" || screen === "auth")) {
      setScreen("app");
    } else if (!profile?.survey_completed && (screen === "landing" || screen === "auth")) {
      setScreen("survey");
    }
  }, [user, profile, loading, screen]);

  function handleAuthSuccess(result: AuthResult) {
    setScreen(result.surveyCompleted ? "app" : "survey");
  }

  async function handleSurveyComplete(data: SurveyData) {
    if (!user) return;
    try {
      await saveSurveyProfile(user.id, data);
      await refreshProfile();
      setScreen("app");
      setActiveTab("dashboard");
      toast.success("¡Perfil configurado! Bienvenido/a a FriendIA");
    } catch (error) {
      console.error("Error guardando encuesta:", error);
      const message = error instanceof Error ? error.message : "No se pudo guardar tu perfil";
      toast.error(message);
    }
  }

  async function handleLogout() {
    await signOut();
    setScreen("landing");
    setActiveTab("dashboard");
  }

  async function confirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await handleLogout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      toast.error("No se pudo cerrar la sesión");
    } finally {
      setLoggingOut(false);
    }
  }

  function renderTab() {
    if (!user) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            userId={user.id}
            userName={userName}
            onOpenChat={() => setActiveTab("chat")}
            onOpenDiary={() => setActiveTab("diary")}
          />
        );
      case "chat":
        return (
          <Chat
            userId={user.id}
            userName={userName}
            onEmergency={() => setShowEmergency(true)}
            onBack={() => setActiveTab("dashboard")}
          />
        );
      case "diary":
        return <Diary userId={user.id} />;
      case "help":
        return <Help />;
      case "profile":
        return (
          <Profile
            userId={user.id}
            userName={userName}
            email={user.email ?? ""}
            profile={profile}
            onProfileUpdate={refreshProfile}
          />
        );
      case "settings":
        return (
          <AppSettings
            userId={user.id}
            onLogout={() => setShowLogoutConfirm(true)}
            onAccountDeleted={handleLogout}
          />
        );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <Loader2 size={32} color="#5B88B2" className="animate-spin" />
      </div>
    );
  }

  if (screen === "landing") {
    return (
      <Landing
        onLogin={() => { setAuthMode("login"); setScreen("auth"); }}
        onSignup={() => { setAuthMode("signup"); setScreen("auth"); }}
        onConsultorio={() => setScreen("consultorio")}
      />
    );
  }

  if (screen === "consultorio") {
    return (
      <ConsultorioPage
        onBack={() => setScreen("landing")}
        onLogin={() => { setAuthMode("login"); setScreen("auth"); }}
        onSignup={() => { setAuthMode("signup"); setScreen("auth"); }}
      />
    );
  }

  if (screen === "auth") {
    return (
      <Auth
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
        onBack={() => setScreen("landing")}
      />
    );
  }

  if (screen === "survey") {
    return (
      <Survey
        userName={userName}
        initialProfile={profile}
        onComplete={handleSurveyComplete}
      />
    );
  }

  return (
    <div className="friendia-app flex h-[100dvh] overflow-hidden" style={{ background: "var(--app-bg)" }}>
      <Sidebar
        active={activeTab}
        onNavigate={tab => setActiveTab(tab)}
        onLogout={() => setShowLogoutConfirm(true)}
        hideMobile={activeTab === "chat"}
      />
      <main className={`flex-1 flex flex-col overflow-hidden ${activeTab === "chat" ? "pb-0" : "pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            className="flex-1 min-h-0 flex flex-col"
            initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {showEmergency && (
          <motion.div
            key="emergency"
            className="fixed inset-0 z-50"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            <EmergencyModal
              onClose={() => setShowEmergency(false)}
              onGoToHelp={() => { setShowEmergency(false); setActiveTab("help"); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(4,9,15,.78)", backdropFilter: "blur(6px)" }}
          onClick={() => !loggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--app-surface)", border: "1px solid rgba(226,75,74,.35)", boxShadow: "0 18px 60px rgba(0,0,0,.4)" }}
            onClick={event => event.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-description"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl" style={{ background: "rgba(226,75,74,.12)", color: "#E24B4A" }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 id="logout-confirm-title" style={{ color: "var(--app-text)", fontSize: 18, fontWeight: 700 }}>¿Cerrar sesión?</h3>
                <p id="logout-confirm-description" className="mt-1" style={{ color: "var(--app-text-muted)", fontSize: 14, lineHeight: 1.55 }}>
                  Tendrás que iniciar sesión nuevamente para volver a entrar a FriendIA.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="px-4 py-2.5 rounded-xl"
                style={{ background: "var(--app-surface-alt)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void confirmLogout()}
                disabled={loggingOut}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "#E24B4A", color: "#fff", border: 0, opacity: loggingOut ? .65 : 1, fontWeight: 700 }}
              >
                {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
