
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./app/App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    <Toaster theme="dark" position="top-center" richColors />
  </AuthProvider>
);
