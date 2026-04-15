"use client";

import { createClient } from "@/libs/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Profile = {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  team_name: string;
  role: "admin" | "leader" | "member";
  domain: string;
  avatar_gender?: "male" | "female";
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => { },
  refreshProfile: async () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      setProfile(data as Profile | null);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleUser = async (currentUser: User | null) => {
      setUser(currentUser);

      if (currentUser) {
        // Only fetch if we aren't already fetching THIS user and don't have a profile yet
        if (fetchingRef.current !== currentUser.id) {
          fetchingRef.current = currentUser.id;
          try {
            await fetchProfile(currentUser.id);
          } catch (err) {
            console.error("Error fetching profile:", err);
            fetchingRef.current = null;
          }
        }
      } else {
        fetchingRef.current = null;
        setProfile(null);
      }

      if (mounted) setIsLoading(false);
    };

    // Initial check
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (mounted) handleUser(currentUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) handleUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  }, [supabase, router]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin",
      isLoading,
      signOut,
      refreshProfile,
    }),
    [user, profile, isLoading, signOut, refreshProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
