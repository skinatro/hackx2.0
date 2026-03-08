"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavCube = {
  label: string;
  shortLabel: string;
  href: string;
  accent: string;
};

const navCubes: NavCube[] = [
  { label: "Home", shortLabel: "HM", href: "/", accent: "#ff6b6b" },
  { label: "About", shortLabel: "AB", href: "/about", accent: "#ffd23f" },
  {
    label: "Problem Statement",
    shortLabel: "PS",
    href: "/ps",
    accent: "#5ce1e6",
  },
  { label: "Timeline", shortLabel: "TL", href: "/timeline", accent: "#5ce1e6" },
  { label: "Sponsors", shortLabel: "SP", href: "/sponsors", accent: "#ffd23f" },
  { label: "F.A.Q", shortLabel: "FAQ", href: "/faq", accent: "#5ce1e6" },
  { label: "Contact", shortLabel: "CT", href: "/contact", accent: "#5ce1e6" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nvbar() {
  const pathname = usePathname();

  return (
    <aside className="pointer-events-none fixed right-3 top-1/2 z-20 -translate-y-1/2 sm:right-5 xl:right-7">
      <nav
        className="pointer-events-auto flex flex-col gap-3"
        aria-label="Primary"
      >
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
                className={`flex h-14 w-14 items-center justify-center border-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:h-15 sm:w-15 ${
                  isActive
                    ? "border-black bg-white text-black shadow-[6px_6px_0_#000]"
                    : "border-white/20 bg-black/45 text-white shadow-[6px_6px_0_rgba(0,0,0,0.35)] hover:border-white/45 hover:bg-black/65"
                }`}
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
    </aside>
  );
}
