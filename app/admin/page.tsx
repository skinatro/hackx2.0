"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { createClient } from "@/libs/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { isLightMode } = useTheme();
  const supabase = useMemo(() => createClient(), []);

  const [submissionsEnabled, setSubmissionsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current submission setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("config")
          .select("value")
          .eq("key", "submissions_enabled")
          .limit(1);

        if (error) {
          console.error("Error fetching config:", error.message || error);
          // If table doesn't exist or row doesn't exist, that's ok - use default
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          setSubmissionsEnabled(data[0].value === "true");
        } else {
          // No data found, keep default (true)
          console.warn("No submissions_enabled config found, using default");
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin && !authLoading) {
      fetchSettings();
    }
  }, [isAdmin, authLoading, supabase]);

  const handleToggleSubmissions = async () => {
    setIsSaving(true);
    try {
      const newValue = !submissionsEnabled;
      console.log("[AdminPage] Updating submissions_enabled to:", newValue ? "true" : "false");
      
      const { data, error } = await supabase
        .from("config")
        .update({
          value: newValue ? "true" : "false",
        })
        .eq("key", "submissions_enabled");

      console.log("[AdminPage] Update response:", { data, error });

      if (error) {
        console.error("[AdminPage] Update error:", error);
        toast.error("Failed to update settings: " + error.message);
        return;
      }

      setSubmissionsEnabled(newValue);
      console.log("[AdminPage] Toggle successful!");
      toast.success(
        newValue
          ? "✅ Project submissions are now OPEN"
          : "🔒 Project submissions are now CLOSED"
      );
    } catch (err) {
      console.error("[AdminPage] Exception:", err);
      toast.error("Error updating settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div
        className={`relative min-h-screen font-sans transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
      >
        <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p
                className={`text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/40"}`}
              >
                Loading...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className={`relative min-h-screen font-sans transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
      >
        <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
          <div className="flex flex-col items-center justify-center py-20 border-[3px] border-dashed border-white/20">
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest">
              Admin access required
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 mb-12 lg:mb-0 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/55" : "text-white/50"}`}
          >
            Admin Panel
          </p>
          <h1
            className={`mt-3 font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
          >
            Settings
          </h1>
        </div>

        {/* Submissions Toggle Card */}
        <div
          className={`border-[3px] p-8 ${isLightMode
            ? "border-black bg-white shadow-[8px_8px_0_#000]"
            : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
            }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p
                className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isLightMode ? "text-black/50" : "text-white/40"}`}
              >
                Project Submissions
              </p>
              <h3
                className={`text-2xl font-black uppercase tracking-tight ${isLightMode ? "text-black" : "text-white"}`}
              >
                Accept Submissions
              </h3>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center border-[3px] ${isLightMode ? "border-black bg-[#c0ff00]" : "border-white bg-[#c0ff00]"} shadow-[4px_4px_0_#000]`}
            >
              <span className="text-xl">{submissionsEnabled ? "✓" : "✗"}</span>
            </div>
          </div>

          <p
            className={`mb-6 text-sm ${isLightMode ? "text-black/70" : "text-white/70"}`}
          >
            Control whether teams can submit their projects. When disabled,
            users will see that submissions are closed.
          </p>

          <div className="flex items-center gap-4">
            <div
              className={`flex-1 border-[3px] p-6 ${submissionsEnabled
                ? isLightMode
                  ? "border-black bg-[#c0ff00]/20"
                  : "border-[#c0ff00] bg-[#c0ff00]/10"
                : isLightMode
                  ? "border-black/20 bg-black/5"
                  : "border-white/20 bg-white/5"
                }`}
            >
              <p
                className={`text-sm font-black uppercase tracking-wide ${submissionsEnabled
                  ? isLightMode
                    ? "text-black"
                    : "text-[#c0ff00]"
                  : isLightMode
                    ? "text-black/50"
                    : "text-white/50"
                  }`}
              >
                {submissionsEnabled ? "OPEN" : "CLOSED"}
              </p>
              <p
                className={`text-[10px] mt-2 ${submissionsEnabled
                  ? isLightMode
                    ? "text-black/60"
                    : "text-white/60"
                  : isLightMode
                    ? "text-black/40"
                    : "text-white/40"
                  }`}
              >
                {submissionsEnabled
                  ? "Teams can submit projects"
                  : "Submissions are closed"}
              </p>
            </div>

            <button
              onClick={handleToggleSubmissions}
              disabled={isSaving}
              className={`border-[3px] px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${isLightMode
                ? "border-black bg-black text-white shadow-[6px_6px_0_#ff00a0] hover:bg-zinc-800 disabled:opacity-50"
                : "border-white bg-white text-black shadow-[6px_6px_0_#ff00a0] hover:bg-zinc-200 disabled:opacity-50"
                }`}
            >
              {isSaving ? "Saving..." : "Toggle"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
