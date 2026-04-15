"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { createClient } from "@/libs/supabase/client";
import { AlertTriangle, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavCube = {
  label: string;
  shortLabel: string;
  href: string;
  accent: string;
};

const baseNavCubes: NavCube[] = [
  { label: "Home", shortLabel: "HM", href: "/", accent: "#ff00a0" },
  { label: "About", shortLabel: "AB", href: "/about", accent: "#ffd23f" },
  {
    label: "Problem Statement",
    shortLabel: "PS",
    href: "/ps",
    accent: "#00f0ff",
  },
  { label: "Timeline", shortLabel: "TL", href: "/timeline", accent: "#c0ff00" },
  { label: "Sponsors", shortLabel: "SP", href: "/sponsors", accent: "#ffd23f" },
  {
    label: "Judges & Mentors",
    shortLabel: "JM",
    href: "/judges",
    accent: "#ff6b35",
  },
  { label: "F.A.Q", shortLabel: "FAQ", href: "/faq", accent: "#00f0ff" },
  { label: "Contact", shortLabel: "CT", href: "/contact", accent: "#c0ff00" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(href + "/");
}

export function Nvbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLightMode, toggleTheme } = useTheme();
  const { user, profile, isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [submissionsEnabled, setSubmissionsEnabled] = useState(true);

  // Fetch hackathon config
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("config")
      .select("key, value")
      .in("key", ["hackathon_end_time", "submissions_enabled"])
      .then(({ data }) => {
        if (data) {
          data.forEach((row) => {
            if (row.key === "hackathon_end_time" && row.value) {
              setEndTime(new Date(row.value));
            }
            if (row.key === "submissions_enabled") {
              const isEnabled = row.value === "true" || row.value === true;
              setSubmissionsEnabled(isEnabled);
            }
          });
        }
      });

    // Poll for changes every 2 seconds
    const interval = setInterval(() => {
      supabase
        .from("config")
        .select("key, value")
        .eq("key", "submissions_enabled")
        .then(({ data }) => {
          if (data && data.length > 0) {
            const isEnabled = data[0].value === "true" || data[0].value === true;
            setSubmissionsEnabled(isEnabled);
          }
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const isFinalHour = useMemo(() => {
    if (!endTime) return false;
    const now = new Date();
    const finalHourStart = new Date(endTime.getTime() - 60 * 60 * 1000);
    return now >= finalHourStart && now <= endTime;
  }, [endTime]);

  // Dynamic navigation items based on auth state
  const navCubes = useMemo(() => {
    const portalPaths = ["/profile", "/scan", "/submit", "/admin"];
    const isPortal = portalPaths.some((path) => pathname.startsWith(path));

    if (isPortal && user) {
      const isLeader = profile?.role === "leader";
      const isMember = profile?.role === "member";

      const cubes: NavCube[] = [
        {
          label: "Profile",
          shortLabel: "PR",
          href: "/profile",
          accent: "#c0ff00",
        },
      ];

      // Scan page: Only for Admin
      if (isAdmin) {
        cubes.push({
          label: "Scan & Check-In",
          shortLabel: "SC",
          href: "/scan",
          accent: "#ff00a0",
        });
      }

      if (isAdmin) {
        cubes.push({
          label: "Submissions",
          shortLabel: "DB",
          href: "/submit",
          accent: "#00f0ff",
        });
        cubes.push({
          label: "User Management",
          shortLabel: "US",
          href: "/admin/users",
          accent: "#ffd23f",
        });
        cubes.push({
          label: "Settings",
          shortLabel: "ST",
          href: "/admin",
          accent: "#ff6b35",
        });
      } else if (isLeader || isMember) {
        cubes.push({
          label: "Submit Project",
          shortLabel: "SB",
          href: "/submit",
          accent: "#00f0ff",
        });
      }

      cubes.push({
        label: "Home",
        shortLabel: "HM",
        href: "/",
        accent: "#ffd23f",
      });
      return cubes;
    }

    const cubes = [...baseNavCubes];

    if (!user) {
      cubes.push({
        label: "Login",
        shortLabel: "LI",
        href: "/login",
        accent: "#ff00a0",
      });
    } else {
      // Just add Profile as the single entry point to the portal
      cubes.push({
        label: "Profile",
        shortLabel: "PR",
        href: "/profile",
        accent: "#c0ff00",
      });
    }

    return cubes;
  }, [user, isAdmin, pathname, profile]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Get current page accent color and short label for the NAV button
  const currentNav = navCubes.find((item) => isActivePath(pathname, item.href));
  const currentAccent = currentNav?.accent ?? "#ffd23f";
  const currentShortLabel = currentNav?.shortLabel ?? "NAV";

  const navButtonClassName = `flex h-14 w-14 items-center justify-center border-[3px] text-xs font-black uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:h-15 sm:w-15 ${isLightMode
      ? "border-black bg-white text-black shadow-[6px_6px_0_#000]"
      : "border-white/50 bg-black/80 text-white shadow-[6px_6px_0_rgba(255,255,255,0.15)] hover:border-white/70 hover:bg-black/90"
    }`;

  const mobileTriggerClassName = `nav-trigger-btn pointer-events-auto flex h-14 w-14 items-center justify-center border-[3px] text-xs font-black uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:hidden ${isLightMode
      ? "border-black bg-white text-black shadow-[6px_6px_0_#000]"
      : "border-white/50 bg-black/80 text-white shadow-[6px_6px_0_rgba(255,255,255,0.15)] hover:border-white/70 hover:bg-black/90"
    }`;

  const themeButtonClassName = `flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center border-[3px] text-xs font-black uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${isLightMode
      ? "border-black bg-white text-black shadow-[6px_6px_0_#000] hover:bg-slate-100"
      : "border-white/50 bg-black/80 text-white shadow-[6px_6px_0_rgba(255,255,255,0.15)] hover:border-white/70 hover:bg-black/90"
    }`;

  // Determine if we should show the simplified portal layout
  const portalPaths = ["/profile", "/scan", "/submit", "/admin"];
  const isPortal = portalPaths.some((path) => pathname.startsWith(path));

  const wrapperClass = isPortal
    ? `flex-row backdrop-blur-3xl p-1 sm:p-2.5 border-[2.5px] sm:border-[3.5px] transition-all duration-500 rounded-lg sm:rounded-none ${isLightMode
      ? "bg-white/95 border-black shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:shadow-[12px_12px_0_rgba(0,0,0,0.2)]"
      : "bg-black/95 border-white/40 shadow-[6px_6px_0_rgba(0,0,0,0.45)] sm:shadow-[12px_12px_0_rgba(0,0,0,0.6)]"
    }`
    : "flex-col items-end";

  return (
    <>
      <aside
        className={`fixed z-50 transition-all duration-500 ${isPortal
            ? "bottom-8 left-1/2 -translate-x-1/2 w-auto"
            : "bottom-4 right-4 sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2 xl:right-7"
          }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingRight: !isPortal ? "env(safe-area-inset-right)" : undefined,
        }}
      >
        <div className={`flex items-center gap-4 ${wrapperClass}`}>
          {isPortal ? (
            <nav
              className="flex items-center gap-1 sm:gap-3 px-1.5 sm:px-3 py-2 sm:py-3 max-w-[calc(100vw-30px)] overflow-x-auto no-scrollbar"
              aria-label="Portal Navigation"
            >
              {navCubes.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                const isSubmitLink = item.href === "/submit" && !isAdmin;

                const handleClick = (e: React.MouseEvent) => {
                  if (isSubmitLink && !submissionsEnabled) {
                    e.preventDefault();
                    setShowLockModal(true);
                  }
                };

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    onClick={handleClick}
                    className={`group relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center border-2 sm:border-[3px] transition-all duration-300 hover:-translate-y-1 rounded-sm sm:rounded-none ${isActive
                        ? isLightMode
                          ? "border-black scale-105 sm:scale-110 z-10"
                          : "border-white scale-105 sm:scale-110 z-10"
                        : isLightMode
                          ? "border-black/10 bg-black/5 hover:border-black/30"
                          : "border-white/20 bg-white/10 hover:border-white/40"
                      }`}
                    style={
                      isActive
                        ? {
                          backgroundColor: item.accent,
                          opacity: 1,
                          boxShadow: `0 0 20px ${item.accent}66`,
                        }
                        : {}
                    }
                  >
                    <span
                      className={`navbar-font text-sm leading-none font-black ${isActive
                          ? "text-black"
                          : isLightMode
                            ? "text-black/60"
                            : "text-white/80"
                        }`}
                    >
                      {item.shortLabel}
                    </span>

                    {/* Corner Indicators for Active State */}
                    {isActive && (
                      <>
                        <div
                          className={`absolute -top-[5px] -left-[5px] w-2.5 h-2.5 border-t-[2.5px] border-l-[2.5px] transition-all duration-300 ${isLightMode ? "border-black" : "border-white"
                            }`}
                        />
                        <div
                          className={`absolute -top-[5px] -right-[5px] w-2.5 h-2.5 border-t-[2.5px] border-r-[2.5px] transition-all duration-300 ${isLightMode ? "border-black" : "border-white"
                            }`}
                        />
                        <div
                          className={`absolute -bottom-[5px] -left-[5px] w-2.5 h-2.5 border-b-[2.5px] border-l-[2.5px] transition-all duration-300 ${isLightMode ? "border-black" : "border-white"
                            }`}
                        />
                        <div
                          className={`absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 border-b-[2.5px] border-r-[2.5px] transition-all duration-300 ${isLightMode ? "border-black" : "border-white"
                            }`}
                        />
                      </>
                    )}

                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap border-2 bg-black px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white/80 transition-all duration-200 opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
                      {item.label}
                    </div>
                  </Link>
                );
              })}
              <div
                className={`mx-1 h-6 w-[2px] ${isLightMode ? "bg-black/10" : "bg-white/20"}`}
              />
              <button
                onClick={toggleTheme}
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-2 sm:border-[3px] transition-all active:scale-95 hover:-translate-y-1 rounded-sm sm:rounded-none ${isLightMode
                    ? "border-black bg-black text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] hover:bg-slate-900"
                    : "border-white bg-white text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] hover:bg-slate-100"
                  }`}
              >
                {isLightMode ? (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </nav>
          ) : (
            <>
              <nav
                className="hidden sm:flex flex-col gap-4"
                aria-label="Desktop Navigation"
              >
                {navCubes.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  const isSubmitLink = item.href === "/submit" && !isAdmin;

                  const handleClick = (e: React.MouseEvent) => {
                    if (isSubmitLink && !submissionsEnabled) {
                      e.preventDefault();
                      setShowLockModal(true);
                    }
                  };

                  return (
                    <div
                      key={item.href}
                      className="group relative flex items-center justify-end"
                    >
                      <div
                        className={`absolute right-full mr-4 whitespace-nowrap border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 ${isActive ? "translate-x-0 opacity-100" : "translate-x-2"}`}
                        style={{
                          backgroundColor: item.accent,
                          boxShadow: "4px 4px 0 #000",
                        }}
                      >
                        {item.label}
                      </div>
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        onClick={handleClick}
                        className={navButtonClassName}
                        style={
                          isActive
                            ? { boxShadow: `6px 6px 0 ${item.accent}` }
                            : undefined
                        }
                      >
                        <span className="navbar-font text-lg leading-none sm:text-xl">
                          {item.shortLabel}
                        </span>
                      </Link>
                    </div>
                  );
                })}

                <div className="group relative flex items-center justify-end">
                  <div
                    className="absolute right-full mr-4 whitespace-nowrap border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2"
                    style={{
                      backgroundColor: isLightMode ? "#27272a" : "#e2e8f0",
                      color: isLightMode ? "#fff" : "#000",
                      borderColor: "#000",
                      boxShadow: "4px 4px 0 #000",
                    }}
                  >
                    {isLightMode ? "Dark Mode" : "Light Mode"}
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className={themeButtonClassName}
                  >
                    {isLightMode ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </nav>

              <div className="flex flex-col items-end gap-3 sm:hidden">
                <div
                  className={`flex flex-col items-end gap-3 transition-all duration-300 ${isMobileOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
                  aria-hidden={!isMobileOpen}
                >
                  <div
                    className={`group relative flex items-center justify-end ${isMobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                  >
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={themeButtonClassName}
                    >
                      {isLightMode ? (
                        <Moon className="w-6 h-6" />
                      ) : (
                        <Sun className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  <nav
                    className={`flex flex-col items-end gap-3 ${isMobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                  >
                    {navCubes.map((item) => {
                      const isActive = isActivePath(pathname, item.href);
                      const isSubmitLink = item.href === "/submit" && !isAdmin;

                      const handleClick = (e: React.MouseEvent) => {
                        if (isSubmitLink && !submissionsEnabled) {
                          e.preventDefault();
                          setShowLockModal(true);
                        }
                      };

                      return (
                        <div
                          key={item.href}
                          className="group relative flex items-center justify-end"
                        >
                          <Link
                            href={item.href}
                            onClick={handleClick}
                            className={navButtonClassName}
                            style={
                              isActive
                                ? { boxShadow: `6px 6px 0 ${item.accent}` }
                                : undefined
                            }
                          >
                            <span className="navbar-font text-lg leading-none">
                              {item.shortLabel}
                            </span>
                          </Link>
                        </div>
                      );
                    })}
                  </nav>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileOpen(!isMobileOpen)}
                  className={mobileTriggerClassName}
                  style={{
                    boxShadow: isMobileOpen
                      ? `6px 6px 0 ${currentAccent}`
                      : isLightMode
                        ? "6px 6px 0 #000"
                        : "6px 6px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <span className="navbar-font text-lg leading-none">
                    {isMobileOpen ? "✕" : currentShortLabel}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Brutalist Submission Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div
            className={`relative w-full max-w-md border-[4px] p-8 shadow-[12px_12px_0_#000] sm:p-10 ${isLightMode
                ? "bg-white border-black"
                : "bg-zinc-900 border-white text-white"
              }`}
          >
            <button
              onClick={() => setShowLockModal(false)}
              className="absolute right-4 top-4 transition-transform hover:rotate-90"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center border-[4px] border-black bg-[#c0ff00] shadow-[6px_6px_0_#000]">
                <AlertTriangle className="h-10 w-10 text-black" />
              </div>

              <h2 className="navbar-font mb-4 text-3xl font-black uppercase tracking-tighter sm:text-4xl">
                Submission Locked
              </h2>

              <p className="mb-8 text-lg font-bold leading-relaxed opacity-80">
                Project submissions are currently closed. Please check back later when submissions are enabled.
              </p>

              <button
                onClick={() => setShowLockModal(false)}
                className={`w-full border-[4px] py-4 text-xl font-black uppercase tracking-widest transition-all active:translate-y-1 active:shadow-none ${isLightMode
                    ? "border-black bg-black text-white shadow-[8px_8px_0_#c0ff00] hover:bg-zinc-800"
                    : "border-white bg-white text-black shadow-[8px_8px_0_#c0ff00] hover:bg-zinc-200"
                  }`}
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
