import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  fetchProfileDisability,
  saveProfileDisability,
  updateProfile,
} from "@/lib/profiles";
import type { UserProfile } from "@/lib/types";
import { fetchDiaryEntries } from "@/lib/diary";
import {
  computeDashboardStats,
  fetchEmotionRecords,
  hasActivityToday,
} from "@/lib/emotions";
import { listChatSessions } from "@/lib/chat";
import { StreakIcon } from "@/app/components/StreakIcon";
import { CycleTracker } from "@/app/components/CycleTracker";
import { CYCLE_CONSENT_VERSION } from "@/lib/cycleConsent";
import { buildFriendiaReportHtml, filterReportPeriod, writeAndPrintReport } from "@/lib/pdfReport";
import logoImg from "@/assets/logo.png";

interface ProfileProps {
  userId: string;
  userName: string;
  email: string;
  profile: UserProfile | null;
  onProfileUpdate: () => Promise<void>;
}

const CONCERNS = [
  "Estrés laboral",
  "Relaciones",
  "Ansiedad",
  "Tristeza",
  "Autoestima",
  "Sueño",
  "Identidad",
  "Otro",
];

const GENDERS = [
  "Mujer",
  "Hombre",
  "No binario o género diverso",
  "Prefiero no decir",
];

const DISABILITIES = [
  "Visual",
  "Auditiva",
  "Motriz",
  "Ninguna",
  "Prefiero no decir",
];

const TONES = ["Cálido y amistoso", "Calmado y neutro", "Motivador"];

const fieldStyle = {
  background: "var(--app-surface-alt)",
  border: "1px solid var(--app-border-medium)",
  color: "var(--app-text)",
  fontSize: "calc(14px * var(--app-font-scale))",
};

const labelStyle = {
  fontSize: "calc(13px * var(--app-font-scale))",
  color: "var(--app-text-muted)",
  display: "block",
  marginBottom: 6,
};

function friendlyAuthError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  if (error.message.toLowerCase().includes("invalid login credentials")) {
    return "La contraseña actual no es correcta";
  }

  if (error.message.toLowerCase().includes("same password")) {
    return "La nueva contraseña debe ser diferente a la actual";
  }

  return error.message || fallback;
}

export function Profile({
  userId,
  userName,
  email,
  profile,
  onProfileUpdate,
}: ProfileProps) {
  const [name, setName] = useState(userName);
  const [apellidoPat, setApellidoPat] = useState("");
  const [apellidoMat, setApellidoMat] = useState("");
  const [gender, setGender] = useState("");
  const [disability, setDisability] = useState("");
  const [tone, setTone] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [cycleTracking, setCycleTracking] = useState(false);
  const [savingCyclePreference, setSavingCyclePreference] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [emailField, setEmailField] = useState(email);

  const [stats, setStats] = useState({
    activeDays: 0,
    totalEntries: 0,
    currentStreak: 0,
  });
  const [isStreakLit, setIsStreakLit] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [lastSignIn, setLastSignIn] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<7 | 30 | 90>(30);
  const [includeDiaryText, setIncludeDiaryText] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);
  const preserveProfileDraftRef = useRef(false);

  useEffect(() => {
    if (preserveProfileDraftRef.current) {
      preserveProfileDraftRef.current = false;
      setCycleTracking(
        Boolean(
          profile?.seguimiento_ciclo_activo &&
            profile.consentimiento_ciclo_version === CYCLE_CONSENT_VERSION
        )
      );
      return;
    }

    setName(profile?.nombre?.trim() || userName);
    setApellidoPat(profile?.apellido_pat?.trim() || "");
    setApellidoMat(profile?.apellido_mat?.trim() || "");
    setGender(profile?.genero || "");
    setTone(profile?.tono_preferido || "");
    setConcerns(profile?.preocupaciones ?? []);
    setCycleTracking(
      Boolean(
        profile?.seguimiento_ciclo_activo &&
          profile.consentimiento_ciclo_version === CYCLE_CONSENT_VERSION
      )
    );
    setAvatarUrl(profile?.url_avatar?.trim() || "");
    setAvatarError(false);
    setEmailField(email);
  }, [profile, userName, email]);

  useEffect(() => {
    let active = true;

    async function loadRelatedData() {
      const [entriesResult, emotionsResult, disabilityResult, authResult] =
        await Promise.allSettled([
          fetchDiaryEntries(userId),
          fetchEmotionRecords(userId),
          fetchProfileDisability(),
          supabase.auth.getUser(),
        ]);

      if (!active) return;

      const entries =
        entriesResult.status === "fulfilled" ? entriesResult.value : [];
      const emotions =
        emotionsResult.status === "fulfilled" ? emotionsResult.value : [];
      setStats(computeDashboardStats(entries, emotions));
      setIsStreakLit(hasActivityToday(entries, emotions));

      if (disabilityResult.status === "fulfilled") {
        setDisability(disabilityResult.value);
      }

      if (authResult.status === "fulfilled" && authResult.value.data.user) {
        const authUser = authResult.value.data.user;
        const authProviders = Array.isArray(authUser.app_metadata?.providers)
          ? authUser.app_metadata.providers
          : [];
        setProviders(
          authUser.user_metadata?.password_enabled &&
            !authProviders.includes("email")
            ? [...authProviders, "email"]
            : authProviders
        );
        setLastSignIn(authUser.last_sign_in_at ?? "");
      }

      if (
        entriesResult.status === "rejected" ||
        emotionsResult.status === "rejected" ||
        disabilityResult.status === "rejected" ||
        authResult.status === "rejected"
      ) {
        toast.error("Algunos datos relacionados con el perfil no se pudieron cargar");
      }

      setLoading(false);
    }

    loadRelatedData();
    return () => {
      active = false;
    };
  }, [userId]);

  const memberSince = useMemo(() => {
    if (!profile?.creado_en) return "";
    try {
      return format(new Date(profile.creado_en), "MMMM yyyy", { locale: es });
    } catch {
      return "";
    }
  }, [profile?.creado_en]);

  const lastAccess = useMemo(() => {
    if (!lastSignIn) return "";
    try {
      return format(new Date(lastSignIn), "d 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return "";
    }
  }, [lastSignIn]);

  const fullName = [name, apellidoPat, apellidoMat]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  const requiresCurrentPassword = providers.includes("email");

  function toggleConcern(concern: string) {
    setConcerns((current) =>
      current.includes(concern)
        ? current.filter((item) => item !== concern)
        : [...current, concern]
    );
  }

  async function handleCycleTrackingChange(active: boolean) {
    if (active && gender !== "Mujer") {
      toast.error("Selecciona Mujer en el campo Género para activar el seguimiento");
      return;
    }

    const previous = cycleTracking;
    setCycleTracking(active);
    setSavingCyclePreference(true);

    try {
      await updateProfile(userId, {
        genero: gender || null,
        seguimiento_ciclo_activo: active,
        consentimiento_ciclo_version: active
          ? CYCLE_CONSENT_VERSION
          : null,
      });
      preserveProfileDraftRef.current = true;
      await onProfileUpdate();
      toast.success(
        active
          ? "Seguimiento del ciclo activado"
          : "Seguimiento del ciclo desactivado"
      );
    } catch (error) {
      preserveProfileDraftRef.current = false;
      setCycleTracking(previous);
      const message = friendlyAuthError(
        error,
        "No se pudo cambiar el seguimiento del ciclo"
      );
      toast.error(message);
    } finally {
      setSavingCyclePreference(false);
    }
  }

  async function handleExportReport() {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      toast.error("Permite las ventanas emergentes para generar el PDF");
      return;
    }

    reportWindow.document.write("<p style='font-family:Arial;padding:32px'>Preparando tu reporte de FriendIA...</p>");
    setExportingReport(true);
    try {
      const [entriesResult, emotionsResult, chatsResult] = await Promise.allSettled([
        fetchDiaryEntries(userId),
        fetchEmotionRecords(userId),
        listChatSessions(),
      ]);
      const entries = entriesResult.status === "fulfilled" ? entriesResult.value : [];
      const emotions = emotionsResult.status === "fulfilled" ? emotionsResult.value : [];
      const chatSessions = chatsResult.status === "fulfilled" ? chatsResult.value.length : null;
      const html = buildFriendiaReportHtml({
        userName: fullName || userName,
        email: emailField || email,
        periodDays: reportPeriod,
        generatedAt: new Date(),
        diaryEntries: filterReportPeriod(entries, entry => entry.created_at, reportPeriod),
        emotionRecords: filterReportPeriod(emotions, record => record.date, reportPeriod),
        chatSessions,
        includeDiaryText,
        logoUrl: new URL(logoImg, window.location.href).href,
      });
      writeAndPrintReport(reportWindow, html);
      setShowReportOptions(false);
      toast.success("Reporte preparado. Selecciona ‘Guardar como PDF’");
    } catch (error) {
      reportWindow.close();
      console.error("Error generando el reporte:", error);
      toast.error("No se pudo generar el reporte");
    } finally {
      setExportingReport(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError("");
    setSaving(true);

    try {
      if (!name.trim() || !apellidoPat.trim() || !apellidoMat.trim()) {
        throw new Error("El nombre y los dos apellidos son obligatorios");
      }

      const normalizedEmail = emailField.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        throw new Error("Ingresa un correo electrónico válido");
      }

      if (avatarUrl.trim()) {
        let avatar: URL;
        try {
          avatar = new URL(avatarUrl.trim());
        } catch {
          throw new Error("Ingresa una URL válida para la foto de perfil");
        }

        if (!["http:", "https:"].includes(avatar.protocol)) {
          throw new Error("La foto de perfil debe usar una dirección http o https");
        }
      }

      await updateProfile(userId, {
        nombre: name,
        apellido_pat: apellidoPat,
        apellido_mat: apellidoMat,
        genero: gender || null,
        tono_preferido: tone || null,
        seguimiento_ciclo_activo:
          gender === "Mujer" ? cycleTracking : false,
        consentimiento_ciclo_version:
          gender === "Mujer" && cycleTracking
            ? CYCLE_CONSENT_VERSION
            : null,
        preocupaciones: concerns,
        url_avatar: avatarUrl || null,
      });
      await saveProfileDisability(disability);

      const authChanges: {
        email?: string;
        data: Record<string, string>;
      } = {
        data: {
          nombre: name.trim(),
          apellido_pat: apellidoPat.trim(),
          apellido_mat: apellidoMat.trim(),
          full_name: fullName,
        },
      };

      if (normalizedEmail !== email.trim().toLowerCase()) {
        authChanges.email = normalizedEmail;
      }

      const { error: authError } = await supabase.auth.updateUser(authChanges);
      if (authError) throw authError;

      await onProfileUpdate();
      if (authChanges.email) {
        toast.info("Revisa ambos correos para confirmar el cambio");
      } else {
        toast.success("Perfil actualizado correctamente");
      }
    } catch (error) {
      const message = friendlyAuthError(error, "No se pudo guardar el perfil");
      setProfileError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setSavingPassword(true);

    try {
      if (requiresCurrentPassword && !currentPassword) {
        throw new Error("Ingresa tu contraseña actual");
      }

      if (newPassword.length < 8) {
        throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Las contraseñas nuevas no coinciden");
      }

      if (requiresCurrentPassword) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (loginError) throw loginError;
      }

      const { error: passwordUpdateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          password_enabled: true,
        },
      });
      if (passwordUpdateError) throw passwordUpdateError;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProviders((current) =>
        current.includes("email") ? current : [...current, "email"]
      );
      toast.success("Contraseña actualizada correctamente");
    } catch (error) {
      const message = friendlyAuthError(
        error,
        "No se pudo actualizar la contraseña"
      );
      setPasswordError(message);
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "var(--app-bg)" }}
      >
        <Loader2 size={28} color="#5B88B2" className="animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-8"
      style={{ background: "var(--app-bg)" }}
    >
      {showReportOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,9,15,.78)", backdropFilter: "blur(7px)" }} onClick={() => !exportingReport && setShowReportOptions(false)}>
          <div className="w-full max-w-lg rounded-3xl p-6" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-medium)", boxShadow: "0 24px 80px rgba(0,0,0,.4)" }} onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="report-options-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="report-options-title" style={{ color: "var(--app-text)", fontSize: 20, fontWeight: 700 }}>Exportar reporte PDF</h2>
                <p className="mt-1" style={{ color: "var(--app-text-muted)", fontSize: 13, lineHeight: 1.55 }}>Elige qué información deseas incluir en tu reporte de FriendIA.</p>
              </div>
              <button onClick={() => setShowReportOptions(false)} disabled={exportingReport} aria-label="Cerrar" className="p-2 rounded-xl" style={{ background: "var(--app-surface-alt)", border: 0, color: "var(--app-text-muted)" }}><EyeOff size={18} /></button>
            </div>
            <div className="mt-6">
              <p style={{ color: "var(--app-text)", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Periodo del reporte</p>
              <div className="grid grid-cols-3 gap-2">
                {([7, 30, 90] as const).map(days => <button key={days} onClick={() => setReportPeriod(days)} className="py-2.5 rounded-xl" style={{ background: reportPeriod === days ? "rgba(91,136,178,.2)" : "var(--app-surface-alt)", border: `1px solid ${reportPeriod === days ? "#5B88B2" : "var(--app-border)"}`, color: reportPeriod === days ? "#78A6D1" : "var(--app-text-muted)", fontWeight: 700 }}>{days} días</button>)}
              </div>
            </div>
            <label className="flex items-start gap-3 mt-5 p-4 rounded-xl cursor-pointer" style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border)" }}>
              <input type="checkbox" checked={includeDiaryText} onChange={event => setIncludeDiaryText(event.target.checked)} style={{ marginTop: 3 }} />
              <span><strong style={{ display: "block", color: "var(--app-text)", fontSize: 13 }}>Incluir texto completo del diario</strong><span style={{ color: "var(--app-text-muted)", fontSize: 12 }}>Desactivado por defecto para proteger tu privacidad.</span></span>
            </label>
            <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(245,166,35,.08)", border: "1px solid rgba(245,166,35,.25)", color: "var(--app-text-muted)", fontSize: 12, lineHeight: 1.5 }}>El PDF incluye métricas, evolución emocional, patrones, check-ins, diario y número de conversaciones. No exporta el contenido de tus chats.</div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button onClick={() => setShowReportOptions(false)} disabled={exportingReport} className="px-4 py-2.5 rounded-xl" style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}>Cancelar</button>
              <button onClick={() => void handleExportReport()} disabled={exportingReport} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: "#5B88B2", border: 0, color: "#fff", fontWeight: 700, opacity: exportingReport ? .65 : 1 }}>{exportingReport ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}Generar PDF</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <h1
          style={{
            fontSize: "calc(24px * var(--app-font-scale))",
            fontWeight: 700,
            color: "var(--app-text)",
            marginBottom: 24,
          }}
        >
          Mi perfil
        </h1>

        <div
          className="p-6 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: "rgba(91,136,178,0.2)" }}
          >
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span
                style={{
                  fontSize: "calc(28px * var(--app-font-scale))",
                  fontWeight: 700,
                  color: "#5B88B2",
                }}
              >
                {(name || userName).charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              style={{
                fontSize: "calc(19px * var(--app-font-scale))",
                fontWeight: 700,
                color: "var(--app-text)",
              }}
            >
              {fullName || userName}
            </p>
            <p
              className="truncate"
              style={{
                fontSize: "calc(13px * var(--app-font-scale))",
                color: "var(--app-text-muted)",
                marginTop: 2,
              }}
            >
              {email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {providers.includes("google") && (
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontSize: 11,
                    background: "rgba(91,136,178,0.14)",
                    color: "#7FB3E1",
                  }}
                >
                  Acceso con Google
                </span>
              )}
              {providers.includes("email") && (
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontSize: 11,
                    background: "rgba(76,217,100,0.12)",
                    color: "#4CD964",
                  }}
                >
                  Acceso con correo
                </span>
              )}
              {memberSince && (
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontSize: 11,
                    background: "var(--app-surface-alt)",
                    color: "var(--app-text-muted)",
                  }}
                >
                  Miembro desde {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            ["Días activos", String(stats.activeDays), "#5B88B2"],
            ["Entradas", String(stats.totalEntries), "#4CD964"],
            [
              "Racha",
              String(stats.currentStreak),
              "#F5A623",
            ],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="p-4 rounded-2xl"
              style={{
                background: "var(--app-surface)",
                border: "1px solid var(--app-border)",
              }}
            >
              <p
                style={{
                  fontSize: "calc(12px * var(--app-font-scale))",
                  color: "var(--app-text-muted)",
                  marginBottom: 4,
                }}
              >
                {label}
              </p>
              <div
                className="flex items-center gap-2"
                style={{
                  fontSize: "calc(24px * var(--app-font-scale))",
                  fontWeight: 700,
                  color,
                }}
              >
                {value}
                {label === "Racha" && (
                  <StreakIcon active={isStreakLit} />
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <section
            className="p-6 rounded-2xl mb-6"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
            }}
          >
            <h2
              style={{
                fontSize: "calc(16px * var(--app-font-scale))",
                fontWeight: 700,
                color: "var(--app-text)",
                marginBottom: 18,
              }}
            >
              Información personal
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoComplete="given-name"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Apellido paterno</label>
                <input
                  value={apellidoPat}
                  onChange={(event) => setApellidoPat(event.target.value)}
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Apellido materno</label>
                <input
                  value={apellidoMat}
                  onChange={(event) => setApellidoMat(event.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Género</label>
                <select
                  value={gender}
                  onChange={(event) => {
                    setGender(event.target.value);
                    if (event.target.value !== "Mujer") {
                      setCycleTracking(false);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                >
                  <option value="">No especificado</option>
                  {GENDERS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Discapacidad</label>
                <select
                  value={disability}
                  onChange={(event) => setDisability(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                >
                  <option value="">No especificada</option>
                  {DISABILITIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  value={emailField}
                  onChange={(event) => setEmailField(event.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label style={labelStyle}>URL de foto de perfil (opcional)</label>
                <input
                  value={avatarUrl}
                  onChange={(event) => {
                    setAvatarUrl(event.target.value);
                    setAvatarError(false);
                  }}
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
            </div>
          </section>

          <section
            className="p-6 rounded-2xl mb-6"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
            }}
          >
            <h2
              style={{
                fontSize: "calc(16px * var(--app-font-scale))",
                fontWeight: 700,
                color: "var(--app-text)",
                marginBottom: 18,
              }}
            >
              Preferencias de acompañamiento
            </h2>

            <div className="mb-5">
              <label style={labelStyle}>Temas que te preocupan</label>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map((concern) => {
                  const selected = concerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                      className="px-3 py-2 rounded-full transition-colors"
                      style={{
                        background: selected
                          ? "#5B88B2"
                          : "var(--app-surface-alt)",
                        border: `1px solid ${
                          selected ? "#5B88B2" : "var(--app-border-medium)"
                        }`,
                        color: selected ? "#fff" : "var(--app-text-muted)",
                        fontSize: "calc(12px * var(--app-font-scale))",
                      }}
                      aria-pressed={selected}
                    >
                      {concern}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label style={labelStyle}>Tono preferido</label>
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                >
                  <option value="">No especificado</option>
                  {TONES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {profileError && (
              <p style={{ color: "#E24B4A", fontSize: 13, marginTop: 16 }}>
                {profileError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2"
              style={{
                background: "#5B88B2",
                color: "#fff",
                fontWeight: 600,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar información del perfil
            </button>
          </section>
        </form>

        {profile?.id_perfil && (
          <CycleTracker
            profileId={profile.id_perfil}
            active={cycleTracking}
            canActivate={gender === "Mujer"}
            savingPreference={savingCyclePreference}
            onActiveChange={handleCycleTrackingChange}
          />
        )}

        <form onSubmit={handlePasswordChange}>
          <section
            className="p-6 rounded-2xl mb-6"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
            }}
          >
            <div className="flex items-start gap-3 mb-5">
              <div
                className="p-2 rounded-xl"
                style={{ background: "rgba(91,136,178,0.15)", color: "#7FB3E1" }}
              >
                <LockKeyhole size={20} />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "calc(16px * var(--app-font-scale))",
                    fontWeight: 700,
                    color: "var(--app-text)",
                  }}
                >
                  {requiresCurrentPassword
                    ? "Cambiar contraseña"
                    : "Crear o cambiar contraseña"}
                </h2>
                <p
                  style={{
                    color: "var(--app-text-muted)",
                    fontSize: "calc(12px * var(--app-font-scale))",
                    marginTop: 3,
                  }}
                >
                  Usa al menos 8 caracteres. La contraseña se guarda de forma
                  segura en Supabase Auth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requiresCurrentPassword && (
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Contraseña actual</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={fieldStyle}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={fieldStyle}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords((current) => !current)}
              className="mt-3 flex items-center gap-2"
              style={{
                background: "none",
                border: "none",
                color: "var(--app-text-muted)",
                fontSize: 12,
              }}
            >
              {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
              {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
            </button>

            {passwordError && (
              <p style={{ color: "#E24B4A", fontSize: 13, marginTop: 14 }}>
                {passwordError}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full mt-5 py-3 rounded-xl flex items-center justify-center gap-2"
              style={{
                background: "var(--app-surface-alt)",
                border: "1px solid rgba(91,136,178,0.45)",
                color: "#7FB3E1",
                fontWeight: 600,
                opacity: savingPassword ? 0.7 : 1,
              }}
            >
              {savingPassword ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              Actualizar contraseña
            </button>
          </section>
        </form>

        <section
          className="p-5 rounded-2xl mb-6"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2
            style={{
              fontSize: "calc(15px * var(--app-font-scale))",
              fontWeight: 700,
              color: "var(--app-text)",
              marginBottom: 10,
            }}
          >
            Información de la cuenta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p style={{ color: "var(--app-text-muted)", fontSize: 12 }}>
                Identificador del perfil
              </p>
              <p
                className="truncate"
                title={profile?.id_perfil || userId}
                style={{ color: "var(--app-text)", fontSize: 13, marginTop: 3 }}
              >
                {profile?.id_perfil || userId}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--app-text-muted)", fontSize: 12 }}>
                Último acceso
              </p>
              <p style={{ color: "var(--app-text)", fontSize: 13, marginTop: 3 }}>
                {lastAccess || "No disponible"}
              </p>
            </div>
          </div>
        </section>

        <button
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all"
          style={{
            border: "1px solid rgba(91,136,178,0.4)",
            color: "#5B88B2",
            background: "transparent",
            fontWeight: 600,
            fontSize: "calc(14px * var(--app-font-scale))",
          }}
          onClick={() => setShowReportOptions(true)}
        >
          <Download size={16} /> Exportar reporte PDF
        </button>
      </div>
    </div>
  );
}
