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
import { fetchSettings } from "@/lib/settings";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (authUser: User) => {
    const metadataName =
      typeof authUser.user_metadata?.full_name === "string"
        ? authUser.user_metadata.full_name
        : typeof authUser.user_metadata?.name === "string"
          ? authUser.user_metadata.name
          : null;

    const [profileResult] = await Promise.allSettled([
      ensureProfile(authUser.id, {
        email: authUser.email,
        fullName: metadataName,
      }),
      fetchSettings(authUser.id),
    ] as const);

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value);
    } else {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadUserData(session.user);
  }, [session?.user, loadUserData]);

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
        else setProfile(null);
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
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
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
