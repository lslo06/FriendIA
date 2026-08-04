import { useState } from "react";
import { AlertTriangle, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_SETTINGS,
  deleteAccount,
  deleteChatHistory,
  normalizeFontSize,
  type SettingsUpdates,
} from "@/lib/settings";

interface AppSettingsProps {
  userId: string;
  onLogout: () => void;
  onAccountDeleted: () => void;
}

export function AppSettings({ userId, onLogout, onAccountDeleted }: AppSettingsProps) {
  const { settings, updateSettings } = useAuth();
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"history" | "account" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const darkMode = settings?.modo_oscuro ?? true;
  const fontSize = normalizeFontSize(
    settings?.tamano_fuente ?? DEFAULT_SETTINGS.tamano_fuente
  );
  const dailyCheckIn = settings?.registro_diario_activo
    ?? DEFAULT_SETTINGS.registro_diario_activo;
  const saveHistory = settings?.guardar_historial_chat
    ?? DEFAULT_SETTINGS.guardar_historial_chat;
  const reminderTime = settings?.hora_registro
    ?? DEFAULT_SETTINGS.hora_registro
    ?? "20:00";

  async function persist(updates: SettingsUpdates) {
    setSaving(true);
    try {
      await updateSettings(updates);
    } catch (error) {
      console.error("Error guardando la configuración:", error);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={saving}
        aria-pressed={value}
        className="relative transition-all"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: value ? "#5B88B2" : "var(--app-muted-strong)",
          border: "none", cursor: saving ? "not-allowed" : "pointer", flexShrink: 0,
          opacity: saving ? 0.6 : 1,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s ease",
        }} />
      </button>
    );
  }

  function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="mb-6">
        <p style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>{label}</p>
        <div style={{ background: "var(--app-surface)", borderRadius: 16, border: "1px solid var(--app-border)", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }

  function Row({ label, control, danger = false, onClick }: { label: string; control: React.ReactNode; danger?: boolean; onClick?: () => void }) {
    return (
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--app-border-subtle)", cursor: onClick ? "pointer" : "default" }}
        onClick={onClick}
      >
        <span style={{ fontSize: "calc(14px * var(--app-font-scale))", color: danger ? "#E24B4A" : "var(--app-text)" }}>{label}</span>
        {control}
      </div>
    );
  }

  async function handleDeleteHistory() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteChatHistory(userId);
      toast.success("Historial de chat eliminado");
      setConfirmAction(null);
    } catch (error) {
      console.error("Error eliminando el historial:", error);
      toast.error("No se pudo eliminar el historial");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Cuenta eliminada");
      onAccountDeleted();
    } catch (error) {
      console.error("Error eliminando la cuenta:", error);
      toast.error("No se pudo eliminar la cuenta");
      setDeleting(false);
    }
  }

  const deletingAccount = confirmAction === "account";

  return (
    <div className="relative flex-1 overflow-y-auto p-8" style={{ background: "var(--app-bg)" }}>
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,9,15,.76)", backdropFilter: "blur(8px)" }}
          onClick={() => !deleting && setConfirmAction(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: "var(--app-surface)",
              border: "1px solid rgba(226,75,74,.32)",
              boxShadow: "0 24px 80px rgba(0,0,0,.42)",
            }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="settings-confirm-title"
            aria-describedby="settings-confirm-description"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl" style={{ background: "rgba(226,75,74,.12)", color: "#E24B4A" }}>
                  {deletingAccount ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
                </div>
                <div>
                  <h2 id="settings-confirm-title" style={{ color: "var(--app-text)", fontSize: 19, fontWeight: 700 }}>
                    {deletingAccount ? "¿Eliminar tu cuenta?" : "¿Borrar el historial?"}
                  </h2>
                  <p id="settings-confirm-description" className="mt-2" style={{ color: "var(--app-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                    {deletingAccount
                      ? "Se eliminarán permanentemente tu perfil, diario, conversaciones y configuraciones. Esta acción no se puede deshacer."
                      : "Se borrarán todos los mensajes de tus conversaciones. Esta acción no se puede deshacer."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={deleting}
                aria-label="Cerrar confirmación"
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: "var(--app-surface-alt)", border: 0, color: "var(--app-text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5" style={{ borderTop: "1px solid var(--app-border)" }}>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl"
                style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border)", color: "var(--app-text)", fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void (deletingAccount ? handleDeleteAccount() : handleDeleteHistory())}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "#E24B4A", border: 0, color: "#fff", fontWeight: 700, opacity: deleting ? .65 : 1 }}
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deletingAccount ? "Eliminar cuenta" : "Borrar historial"}
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 style={{ fontSize: "calc(24px * var(--app-font-scale))", fontWeight: 700, color: "var(--app-text)", marginBottom: 24 }}>Configuración</h1>

      <Section label="Apariencia">
        <Row
          label="Modo oscuro"
          control={
            <Toggle
              value={darkMode}
              onChange={value => persist({ modo_oscuro: value })}
            />
          }
        />
        <Row label="Tamaño de texto" control={
          <select
            value={fontSize}
            disabled={saving}
            onChange={event => persist({ tamano_fuente: Number(event.target.value) })}
            style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border-strong)", color: "var(--app-text)", borderRadius: 8, padding: "4px 10px", fontSize: "calc(13px * var(--app-font-scale))" }}
          >
            <option value={13}>Pequeño</option>
            <option value={14}>Normal</option>
            <option value={16}>Grande</option>
          </select>
        } />
      </Section>

      <Section label="Notificaciones">
        <Row
          label="Check-in diario"
          control={
            <Toggle
              value={dailyCheckIn}
              onChange={value => persist({ registro_diario_activo: value })}
            />
          }
        />
        <Row label="Hora del recordatorio" control={
          <input
            type="time"
            value={reminderTime}
            disabled={!dailyCheckIn || saving}
            onChange={event => persist({ hora_registro: event.target.value })}
            style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border-strong)", color: "var(--app-text)", borderRadius: 8, padding: "4px 10px", fontSize: "calc(13px * var(--app-font-scale))" }}
          />
        } />
      </Section>

      <Section label="Privacidad">
        <Row
          label="Guardar historial de chat"
          control={
            <Toggle
              value={saveHistory}
              onChange={value => persist({ guardar_historial_chat: value })}
            />
          }
        />
        <Row
          label="Borrar todo mi historial"
          danger
          onClick={() => setConfirmAction("history")}
          control={<ChevronRight size={16} color="#E24B4A" />}
        />
      </Section>

      <Section label="Cuenta">
        <Row
          label="Cerrar sesión"
          onClick={onLogout}
          control={<ChevronRight size={16} color="var(--app-text-muted)" />}
        />
        <Row
          label="Eliminar cuenta"
          danger
          onClick={() => setConfirmAction("account")}
          control={<ChevronRight size={16} color="#E24B4A" />}
        />
      </Section>
    </div>
  );
}
