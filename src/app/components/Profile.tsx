import { useEffect, useMemo, useState } from "react";
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
import { computeDiaryStats, fetchDiaryEntries } from "@/lib/diary";
import { emotionIcons } from "@/lib/emotionIcons";

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [emailField, setEmailField] = useState(email);

  const [stats, setStats] = useState({
    activeDays: 0,
    totalEntries: 0,
    currentStreak: 0,
  });
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

  useEffect(() => {
    setName(profile?.nombre?.trim() || userName);
    setApellidoPat(profile?.apellido_pat?.trim() || "");
    setApellidoMat(profile?.apellido_mat?.trim() || "");
    setGender(profile?.genero || "");
    setTone(profile?.tono_preferido || "");
    setConcerns(profile?.preocupaciones ?? []);
    setCycleTracking(profile?.seguimiento_ciclo_activo ?? false);
    setAvatarUrl(profile?.url_avatar?.trim() || "");
    setAvatarError(false);
    setEmailField(email);
  }, [profile, userName, email]);

  useEffect(() => {
    let active = true;

    async function loadRelatedData() {
      const [entriesResult, disabilityResult, authResult] =
        await Promise.allSettled([
          fetchDiaryEntries(userId),
          fetchProfileDisability(),
          supabase.auth.getUser(),
        ]);

      if (!active) return;

      if (entriesResult.status === "fulfilled") {
        setStats(computeDiaryStats(entriesResult.value));
      }

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
                {label === "Racha" && stats.currentStreak > 0 && (
                  <img src={emotionIcons.streak} alt="Racha activa" className="h-9 w-9 object-contain" />
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

              {gender === "Mujer" && (
                <label
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                  style={{
                    ...fieldStyle,
                    minHeight: 48,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cycleTracking}
                    onChange={(event) => setCycleTracking(event.target.checked)}
                    style={{ accentColor: "#5B88B2" }}
                  />
                  <span>Activar seguimiento del ciclo</span>
                </label>
              )}
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
          onClick={() =>
            toast.info("La exportación PDF estará disponible pronto")
          }
        >
          <Download size={16} /> Exportar reporte PDF semanal
        </button>
      </div>
    </div>
  );
}
