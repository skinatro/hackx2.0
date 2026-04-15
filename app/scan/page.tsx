"use client";

import {
  LoadingSpinner
} from "@/app/components/ui/loading-spinner";
import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { createClient } from "@/libs/supabase/client";
import { MEAL_LABELS } from "@/libs/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type ScanLog = {
  id: string;
  user_id: string;
  meal: string;
  scanned_at: string;
  participant_name?: string;
  participant_team?: string;
};

export default function ScanPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { isLightMode } = useTheme();
  const supabase = useMemo(() => createClient(), []);

  const [scanMode, setScanMode] = useState<"food" | "registration">("registration");
  const [selectedMeal, setSelectedMeal] = useState("day1_lunch");
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<import("html5-qrcode").Html5Qrcode | null>(
    null,
  );
  const processingRef = useRef(false);

  // Load recent scans
  const loadRecentScans = useCallback(async () => {
    if (scanMode === "registration") {
      // Load registration check-ins
      const { data } = await supabase
        .from("registration_logs")
        .select("*")
        .order("checked_in_at", { ascending: false })
        .limit(20);

      if (data) {
        // Enrich with user names
        const userIds = [...new Set(data.map((d) => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, team_name")
          .in("user_id", userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

        const enriched = data.map((d) => ({
          ...d,
          meal: "registration",
          scanned_at: d.checked_in_at,
          participant_name: profileMap.get(d.user_id)?.name || "Unknown",
          participant_team: profileMap.get(d.user_id)?.team_name || "Unknown",
        }));
        setRecentScans(enriched);
      }
    } else {
      // Load food logs
      const { data } = await supabase
        .from("food_logs")
        .select("*")
        .order("scanned_at", { ascending: false })
        .limit(20);

      if (data) {
        // Enrich with user names
        const userIds = [...new Set(data.map((d) => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, team_name")
          .in("user_id", userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

        const enriched = data.map((d) => ({
          ...d,
          participant_name: profileMap.get(d.user_id)?.name || "Unknown",
          participant_team: profileMap.get(d.user_id)?.team_name || "Unknown",
        }));
        setRecentScans(enriched);
      }
    }
  }, [supabase, scanMode]);

  useEffect(() => {
    if (isAdmin) loadRecentScans();
  }, [isAdmin, loadRecentScans]);

  // Setup realtime subscription
  useEffect(() => {
    if (!isAdmin) return;
    const tableName = scanMode === "registration" ? "registration_logs" : "food_logs";
    const channel = supabase
      .channel(`${tableName}_realtime`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: tableName },
        () => {
          loadRecentScans();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, supabase, loadRecentScans, scanMode]);

  const handleScan = useCallback(
    async (scannedUserId: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        // Get participant info
        const { data: participant } = await supabase
          .from("profiles")
          .select("name, team_name")
          .eq("user_id", scannedUserId)
          .single();

        if (!participant) {
          toast.error("User not found in system");
          return;
        }

        if (scanMode === "registration") {
          // Handle registration check-in
          const { data, error } = await supabase
            .from("registration_logs")
            .upsert(
              {
                user_id: scannedUserId,
                checked_in_at: new Date().toISOString(),
                scanned_by: user?.id,
              },
              {
                onConflict: "user_id",
                ignoreDuplicates: true,
              },
            )
            .select();

          if (error) {
            toast.error("Check-in failed: " + error.message);
            return;
          }

          if (!data || data.length === 0) {
            toast.warning(
              `⚠️ Already checked in! ${participant.name} (${participant.team_name}) is already registered.`,
              { duration: 5000 },
            );
          } else {
            toast.success(
              `✅ ${participant.name} (${participant.team_name}) — Checked in at registration!`,
              { duration: 3000 },
            );
            loadRecentScans();
          }
        } else {
          // Handle food log (existing functionality)
          const { data, error } = await supabase
            .from("food_logs")
            .upsert(
              {
                user_id: scannedUserId,
                meal: selectedMeal,
                scanned_at: new Date().toISOString(),
                scanned_by: user?.id,
              },
              {
                onConflict: "user_id,meal",
                ignoreDuplicates: true,
              },
            )
            .select();

          if (error) {
            toast.error("Scan failed: " + error.message);
            return;
          }

          if (!data || data.length === 0) {
            // Duplicate — unique constraint prevented insert
            toast.warning(
              `⚠️ Already scanned! ${participant.name} (${participant.team_name}) already collected ${MEAL_LABELS[selectedMeal]}`,
              { duration: 5000 },
            );
          } else {
            toast.success(
              `✅ ${participant.name} (${participant.team_name}) — ${MEAL_LABELS[selectedMeal]} recorded!`,
              { duration: 3000 },
            );
            loadRecentScans();
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Scan error. Please try again.");
      } finally {
        setTimeout(() => {
          processingRef.current = false;
        }, 1500);
      }
    },
    [scanMode, selectedMeal, user, supabase, loadRecentScans],
  );

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      toast.error(
        "Scanner requires HTTPS (Secure Context) to work on mobile devices.",
        {
          duration: 8000,
        },
      );
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // ignore errors (no QR found in frame)
        },
      );

      setScannerReady(true);
      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Camera access denied or not available");
    }
  }, [handleScan]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch {
        // ignore
      }
    }
    setIsScanning(false);
    setScannerReady(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => { });
      }
    };
  }, []);

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-20 sm:px-6 lg:px-8 lg:pb-48 relative z-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/55" : "text-white/50"}`}
          >
            Admin Panel
          </p>
          <h1
            className={`mt-3 font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
          >
            Scan
          </h1>
        </div>

        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p
              className={`mt-4 text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/40"}`}
            >
              Verifying admin credentials...
            </p>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-20 border-[3px] border-dashed border-white/20">
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest">
              Admin access required
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 mb-12 lg:mb-0">
            {/* Header */}
            <div className="text-center mb-10 pb-6 border-b-[3px] border-black/10">
              <h2
                className={`font-black uppercase tracking-tighter text-2xl sm:text-3xl mb-2 ${isLightMode ? "text-black" : "text-white"}`}
              >
                {scanMode === "registration" ? "Registration Check-In" : "Food Service"}
              </h2>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/40"}`}
              >
                {scanMode === "registration"
                  ? "Scan users at the registration desk ✓"
                  : "Scan users for meal distribution 🍱"}
              </p>
            </div>
            {/* Mode Selector */}
            <div
              className={`mb-8 border-[3px] p-6 ${isLightMode
                ? "border-black bg-white shadow-[6px_6px_0_#000]"
                : "border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                }`}
            >
              <label
                className={`block text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${isLightMode ? "text-black/70" : "text-white/50"}`}
              >
                Scan Mode
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setScanMode("registration");
                    if (isScanning) {
                      stopScanner();
                    }
                    toast.info("Switched to Registration Check-In mode");
                  }}
                  className={`flex-1 border-[3px] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${scanMode === "registration"
                    ? isLightMode
                      ? "border-black bg-[#00f0ff] text-black shadow-[4px_4px_0_#000]"
                      : "border-white bg-[#00f0ff] text-black shadow-[4px_4px_0_#fff]"
                    : isLightMode
                      ? "border-black/20 bg-white text-black/50 hover:border-black/50"
                      : "border-white/20 bg-black text-white/50 hover:border-white/40"
                    }`}
                >
                  Registration ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanMode("food");
                    if (isScanning) {
                      stopScanner();
                    }
                    toast.info("Switched to Food Log mode");
                  }}
                  className={`flex-1 border-[3px] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${scanMode === "food"
                    ? isLightMode
                      ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000]"
                      : "border-white bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff]"
                    : isLightMode
                      ? "border-black/20 bg-white text-black/50 hover:border-black/50"
                      : "border-white/20 bg-black text-white/50 hover:border-white/40"
                    }`}
                >
                  Food 🍱
                </button>
              </div>
            </div>

            {/* Meal Selector - Only show in food mode */}
            {scanMode === "food" && (
              <div
                className={`mb-8 border-[3px] p-6 ${isLightMode
                  ? "border-black bg-white shadow-[6px_6px_0_#000]"
                  : "border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                  }`}
              >
                <label
                  className={`block text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${isLightMode ? "text-black/70" : "text-white/50"}`}
                >
                  Select Meal
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(MEAL_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedMeal(key);
                        if (isScanning) {
                          toast.info(`Switched to ${label}`);
                        }
                      }}
                      className={`border-[3px] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${selectedMeal === key
                        ? isLightMode
                          ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000]"
                          : "border-white bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff]"
                        : isLightMode
                          ? "border-black/20 bg-white text-black/50 hover:border-black/50"
                          : "border-white/20 bg-black text-white/50 hover:border-white/40"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scanner */}
            <div
              className={`mb-8 border-[3px] p-6 ${isLightMode
                ? "border-black bg-white shadow-[6px_6px_0_#000]"
                : "border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLightMode ? "text-black/70" : "text-white/50"}`}
                >
                  QR Scanner
                </p>
                {scannerReady && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#c0ff00] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#c0ff00]">
                      LIVE
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`relative overflow-hidden ${!isScanning ? "hidden" : ""}`}
                style={{ width: "100%" }}
              >
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  style={{ width: "100%" }}
                />

                {/* Custom Finder Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/20 relative">
                    {/* Brutalist Corners */}
                    <div className="absolute top-[-4px] left-[-4px] w-6 h-6 border-t-4 border-l-4 border-[#c0ff00]" />
                    <div className="absolute top-[-4px] right-[-4px] w-6 h-6 border-t-4 border-r-4 border-[#c0ff00]" />
                    <div className="absolute bottom-[-4px] left-[-4px] w-6 h-6 border-b-4 border-l-4 border-[#c0ff00]" />
                    <div className="absolute bottom-[-4px] right-[-4px] w-6 h-6 border-b-4 border-r-4 border-[#c0ff00]" />

                    {/* Scanning Animation Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#c0ff00]/30 animate-scan-line shadow-[0_0_15px_#c0ff00]" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {!isScanning ? (
                  <button
                    type="button"
                    onClick={startScanner}
                    className={`flex-1 flex items-center justify-center gap-2 border-[3px] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${isLightMode
                      ? "border-black bg-[#c0ff00] text-black shadow-[6px_6px_0_#000]"
                      : "border-white bg-[#c0ff00] text-black shadow-[6px_6px_0_#fff]"
                      }`}
                  >
                    📷 Start Scanner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className={`flex-1 flex items-center justify-center gap-2 border-[3px] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${isLightMode
                      ? "border-black bg-[#ff00a0] text-white shadow-[6px_6px_0_#000]"
                      : "border-white bg-[#ff00a0] text-white shadow-[6px_6px_0_#fff]"
                      }`}
                  >
                    ⏹ Stop Scanner
                  </button>
                )}
              </div>
            </div>

            {/* Recent Scans */}
            <div
              className={`border-[3px] p-6 ${isLightMode
                ? "border-black bg-white shadow-[6px_6px_0_#000]"
                : "border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLightMode ? "text-black/70" : "text-white/50"}`}
                >
                  Recent Scans
                </p>
                <button
                  type="button"
                  onClick={loadRecentScans}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLightMode ? "text-black/40 hover:text-black" : "text-white/30 hover:text-white"}`}
                >
                  Refresh ↻
                </button>
              </div>

              {recentScans.length === 0 ? (
                <p
                  className={`text-center py-8 text-sm font-bold ${isLightMode ? "text-black/30" : "text-white/20"}`}
                >
                  No scans yet
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto no-scrollbar">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className={`flex items-center justify-between border-[2px] px-4 py-3 ${isLightMode
                        ? "border-black/10 bg-black/5"
                        : "border-white/10 bg-white/5"
                        }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-black ${isLightMode ? "text-black" : "text-white"}`}
                        >
                          {scan.participant_name}
                        </p>
                        <p
                          className={`text-[10px] font-bold ${isLightMode ? "text-black/50" : "text-white/40"}`}
                        >
                          {scan.participant_team}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex border-[2px] border-black bg-[#c0ff00] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-black">
                          {MEAL_LABELS[scan.meal] || scan.meal}
                        </span>
                        <p
                          className={`mt-1 text-[9px] font-bold ${isLightMode ? "text-black/30" : "text-white/20"}`}
                        >
                          {new Date(scan.scanned_at).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
