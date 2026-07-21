
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import App from "./app/App";
import "./styles/index.css";

function FriendIA() {
  const { settings } = useAuth();

  return (
    <>
      <App />
      <Toaster
        theme={settings?.modo_oscuro === false ? "light" : "dark"}
        position="top-center"
        richColors
      />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <FriendIA />
  </AuthProvider>
);
