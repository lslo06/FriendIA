import { useState } from "react";
import { Landing } from "./components/Landing";
import { Auth } from "./components/Auth";
import { Survey, type SurveyData } from "./components/Survey";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { Diary } from "./components/Diary";
import { Help } from "./components/Help";
import { Profile } from "./components/Profile";
import { AppSettings } from "./components/AppSettings";
import { EmergencyModal } from "./components/EmergencyModal";

type AppScreen = "landing" | "auth" | "survey" | "app";
type AppTab = "dashboard" | "diary" | "chat" | "help" | "profile" | "settings";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [userName, setUserName] = useState("Sofía");
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [showEmergency, setShowEmergency] = useState(false);

  function handleLogin(name: string) {
    setUserName(name);
    setScreen("app");
    setActiveTab("dashboard");
  }

  function handleSignup(name: string) {
    setUserName(name);
    setScreen("survey");
  }

  function handleSurveyComplete(data: SurveyData) {
    setUserName(data.name || userName);
    setScreen("app");
    setActiveTab("dashboard");
  }

  function renderTab() {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            userName={userName}
            onOpenChat={() => setActiveTab("chat")}
            onOpenDiary={() => setActiveTab("diary")}
          />
        );
      case "chat":
        return <Chat userName={userName} onEmergency={() => setShowEmergency(true)} />;
      case "diary":
        return <Diary />;
      case "help":
        return <Help />;
      case "profile":
        return <Profile userName={userName} />;
      case "settings":
        return <AppSettings />;
    }
  }

  if (screen === "landing") {
    return (
      <Landing
        onLogin={() => { setAuthMode("login"); setScreen("auth"); }}
        onSignup={() => { setAuthMode("signup"); setScreen("auth"); }}
      />
    );
  }

  if (screen === "auth") {
    return (
      <Auth
        initialMode={authMode}
        onSuccess={authMode === "login" ? handleLogin : handleSignup}
        onBack={() => setScreen("landing")}
      />
    );
  }

  if (screen === "survey") {
    return <Survey userName={userName} onComplete={handleSurveyComplete} />;
  }

  // App layout
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#121820" }}>
      <Sidebar
        active={activeTab}
        onNavigate={tab => setActiveTab(tab)}
        onLogout={() => setScreen("landing")}
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
