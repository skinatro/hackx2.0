"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavCube = {
  label: string;
  shortLabel: string;
  href: string;
  accent: string;
};

const navCubes: NavCube[] = [
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
  { label: "F.A.Q", shortLabel: "FAQ", href: "/faq", accent: "#00f0ff" },
  { label: "Contact", shortLabel: "CT", href: "/contact", accent: "#c0ff00" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nvbar() {
  const pathname = usePathname();
  const { isLightMode, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Get current page accent color and short label for the NAV button
  const currentNav = navCubes.find((item) => isActivePath(pathname, item.href));
  const currentAccent = currentNav?.accent ?? "#ffd23f";
  const currentShortLabel = currentNav?.shortLabel ?? "NAV";

  const navButtonClassName = `flex h-14 w-14 items-center justify-center border-[3px] text-xs font-black uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:h-15 sm:w-15 ${
    isLightMode
      ? "border-black bg-white text-black shadow-[6px_6px_0_#000]"
      : "border-white/50 bg-black/80 text-white shadow-[6px_6px_0_rgba(255,255,255,0.15)] hover:border-white/70 hover:bg-black/90"
  }`;

  const mobileTriggerClassName = `nav-trigger-btn pointer-events-auto flex h-14 w-14 items-center justify-center text-[1px] font-black uppercase tracking-[0.22em] transition-all duration-200 sm:hidden`;

  const themeButtonClassName = `flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center border-[3px] text-xs font-black uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${
    isLightMode
      ? "border-black bg-white text-black shadow-[6px_6px_0_#000] hover:bg-slate-100"
      : "border-white/50 bg-black/80 text-white shadow-[6px_6px_0_rgba(255,255,255,0.15)] hover:border-white/70 hover:bg-black/90"
  }`;

  return (
    <aside className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2 xl:right-7">
      <div className="flex flex-col items-end gap-3 sm:hidden">
        <div
          className={`flex flex-col items-end gap-3 transition-all duration-300 ${isMobileOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
            }`}
          aria-hidden={!isMobileOpen}
        >
          <div className="group relative flex items-center justify-end">
            <div
              className="absolute right-full mr-3 whitespace-nowrap border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2"
              style={{
                backgroundColor: isLightMode ? "#27272a" : "#e2e8f0",
                color: isLightMode ? "#fff" : "#000",
                borderColor: isLightMode ? "#000" : "#fff",
                boxShadow: isLightMode ? "4px 4px 0 #000" : "4px 4px 0 #fff",
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
                <Moon className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Sun className="w-6 h-6" strokeWidth={2.5} />
              )}
            </button>
          </div>

          <nav className="pointer-events-auto flex flex-col items-end gap-3" aria-label="Primary">
            {navCubes.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <div
                  key={item.href}
                  className="group relative flex items-center justify-end"
                >
                  <div
                    className={`absolute right-full mr-3 whitespace-nowrap border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 ${isActive ? "translate-x-0" : "translate-x-2"
                      }`}
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
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={isMobileOpen}
          className={mobileTriggerClassName}
          style={
            {
              "--nav-accent": currentAccent,
              "--nav-accent-glow": `${currentAccent}b3`,
            } as React.CSSProperties
          }
        >
          {isMobileOpen ? "X" : currentShortLabel}
        </button>
      </div>

      <div className="hidden flex-col items-end gap-3 sm:flex">
        <nav className="pointer-events-auto flex flex-col gap-3" aria-label="Primary">
          {navCubes.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <div
                key={item.href}
                className="group relative flex items-center justify-end"
              >
                <div
                  className={`absolute right-full mr-3 whitespace-nowrap border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 ${
                    isActive ? "translate-x-0" : "translate-x-2"
                  }`}
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

          <div className="group relative mt-2 flex items-center justify-end">
            <div
              className="absolute right-full mr-3 whitespace-nowrap border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2"
              style={{
                backgroundColor: isLightMode ? "#27272a" : "#e2e8f0",
                color: isLightMode ? "#fff" : "#000",
                borderColor: isLightMode ? "#000" : "#fff",
                boxShadow: isLightMode ? "4px 4px 0 #000" : "4px 4px 0 #fff",
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
                <Moon className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Sun className="w-6 h-6" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
