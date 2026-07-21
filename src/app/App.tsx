import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [showEmergency, setShowEmergency] = useState(false);

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
        return <Chat userName={userName} onEmergency={() => setShowEmergency(true)} />;
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
            onLogout={handleLogout}
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
    <div className="friendia-app flex h-screen overflow-hidden" style={{ background: "var(--app-bg)" }}>
      <Sidebar
        active={activeTab}
        onNavigate={tab => setActiveTab(tab)}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderTab()}
      </main>
      {showEmergency && (
        <EmergencyModal
          onClose={() => setShowEmergency(false)}
          onGoToHelp={() => { setShowEmergency(false); setActiveTab("help"); }}
        />
      )}
    </div>
  );
}
