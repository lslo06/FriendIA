import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profiles";
import {
  applySettings,
  fetchSettings,
  saveSettings,
  type SettingsUpdates,
} from "@/lib/settings";
import type { UserProfile, UserSettings } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateSettings: (updates: SettingsUpdates) => Promise<UserSettings>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (authUser: User) => {
    const metadataName =
      typeof authUser.user_metadata?.full_name === "string"
        ? authUser.user_metadata.full_name
        : typeof authUser.user_metadata?.name === "string"
          ? authUser.user_metadata.name
          : null;
    const metadataAvatar =
      typeof authUser.user_metadata?.avatar_url === "string"
        ? authUser.user_metadata.avatar_url
        : typeof authUser.user_metadata?.picture === "string"
          ? authUser.user_metadata.picture
          : null;

    try {
      const loadedProfile = await ensureProfile(authUser.id, {
        email: authUser.email,
        fullName: metadataName,
        avatarUrl: metadataAvatar,
      });
      setProfile(loadedProfile);
    } catch (error) {
      console.error("Error cargando el perfil:", error);
      setProfile(null);
      setSettings(null);
      return;
    }

    try {
      setSettings(await fetchSettings(authUser.id));
    } catch (error) {
      console.error("Error cargando la configuración:", error);
      setSettings(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadUserData(session.user);
  }, [session?.user, loadUserData]);

  const updateSettings = useCallback(async (updates: SettingsUpdates) => {
    const user = session?.user;
    if (!user) throw new Error("No hay una sesión activa");

    const previousSettings = settings;
    if (previousSettings) {
      setSettings({ ...previousSettings, ...updates });
    }

    try {
      const savedSettings = await saveSettings(user.id, updates);
      setSettings(savedSettings);
      return savedSettings;
    } catch (error) {
      setSettings(previousSettings);
      throw error;
    }
  }, [session?.user, settings]);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    let active = true;

    async function initSession() {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();

      if (!active) return;
      setSession(s);
      if (s?.user) {
        await loadUserData(s.user);
      } else {
        setProfile(null);
        setSettings(null);
      }
    }

    initSession().finally(() => {
      if (active) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!active) return;
        setSession(s);
        if (s?.user) await loadUserData(s.user);
        else {
          setProfile(null);
          setSettings(null);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setSettings(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        settings,
        loading,
        signOut,
        refreshProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
