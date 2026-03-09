"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { useTheme } from "@/app/providers/theme-provider";

const sponsors = {
  presenting: [
    {
      name: "Sponsor Name",
      logo: null as React.ReactNode, // replace with <img src="..." /> or your logo component
      description: "Short description of what this sponsor does and why they're here.",
      website: "https://example.com",
    },
  ],
  poweredBy: [
    {
      name: "Sponsor Name",
      logo: null as React.ReactNode,
      description: "Short description of what this sponsor does.",
      website: "https://example.com",
    },
    {
      name: "Sponsor Name",
      logo: null as React.ReactNode,
      description: "Short description of what this sponsor does.",
      website: "https://example.com",
    },
  ],
  community: [
    {
      name: "Sponsor Name",
      logo: null as React.ReactNode,
      description: "Short description.",
      website: "https://example.com",
    },
    {
      name: "Sponsor Name",
      logo: null as React.ReactNode,
      description: "Short description.",
      website: "https://example.com",
    },
    {
      name: "Sponsor Name",
      logo: null as React.ReactNode,
      description: "Short description.",
      website: "https://example.com",
    },
  ],
};

const tiers = [
  { key: "presenting" as const, label: "Presenting Sponsor", accent: "#ffd23f", colClass: "grid-cols-1 max-w-lg mx-auto w-full" },
  { key: "poweredBy" as const, label: "Powered By", accent: "#1fe0ff", colClass: "sm:grid-cols-2" },
  { key: "community" as const, label: "Community Partners", accent: "#ff3b6b", colClass: "sm:grid-cols-2 lg:grid-cols-3" },
];

type TierKey = (typeof tiers)[number]["key"];

type SponsorCardProps = {
  name: string;
  logo: React.ReactNode;
  description: string;
  website: string;
  accent: string;
  isLightMode: boolean;
};

function SponsorCard({ name, logo, description, website, accent, isLightMode }: SponsorCardProps) {
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className={`pointer-events-auto group flex h-full flex-col gap-4 border-2 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 xl:gap-5 xl:p-7 ${
        isLightMode
          ? "border-black/15 bg-white/72 text-black shadow-[8px_8px_0_rgba(255,255,255,0.15)] hover:border-black/35 hover:bg-white/85"
          : "border-white/20 bg-black/55 text-white shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:border-white/50 hover:bg-black/70"
      }`}
    >
      <div
        className={`flex h-20 items-center justify-center border-2 text-sm font-bold uppercase tracking-widest xl:h-24 xl:text-base ${
          isLightMode ? "border-black/10 bg-black/5 text-black/35" : "border-white/10 bg-white/5 text-white/30"
        }`}
        style={{ borderTopColor: accent }}
      >
        {logo ?? name}
      </div>
      <div>
        <p className={`text-base font-black uppercase tracking-widest xl:text-lg ${isLightMode ? "text-black" : "text-white"}`}>{name}</p>
        <p className={`mt-2 text-sm leading-6 xl:text-base xl:leading-7 ${isLightMode ? "text-black/65" : "text-white/65"}`}>{description}</p>
      </div>
      <span className="mt-auto text-[11px] font-black uppercase tracking-widest xl:text-xs" style={{ color: accent }}>
        Visit →
      </span>
    </a>
  );
}

function TierButton({
  active,
  label,
  accent,
  isLightMode,
  onClick,
}: {
  active: boolean;
  label: string;
  accent: string;
  isLightMode: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto border-2 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all duration-300 sm:text-sm xl:px-5 xl:py-3.5 xl:text-base ${
        active
          ? isLightMode
            ? "border-black bg-[#fff7d6] text-black shadow-[5px_5px_0_#000]"
            : "border-black bg-white text-black shadow-[5px_5px_0_#000]"
          : isLightMode
            ? "border-black/15 bg-white/55 text-black/70 hover:border-black/40 hover:text-black"
            : "border-white/20 bg-black/45 text-white/72 hover:border-white/45 hover:text-white"
      }`}
      style={active ? { boxShadow: `5px 5px 0 ${accent}` } : undefined}
    >
      {label}
    </button>
  );
}

export default function Page() {
  const [activeTier, setActiveTier] = useState<TierKey>("presenting");
  const [displayTier, setDisplayTier] = useState<TierKey>("presenting");
  const [isTierVisible, setIsTierVisible] = useState(true);
  const { isLightMode, setWaveTilesOpacity } = useTheme();
  const switchTimerRef = useRef<number | null>(null);

  useEffect(() => setWaveTilesOpacity("opacity-95", "opacity-60"), [setWaveTilesOpacity]);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current !== null) {
        window.clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  const handleTierChange = (nextTier: TierKey) => {
    if (nextTier === activeTier) {
      return;
    }

    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current);
    }

    setActiveTier(nextTier);
    setIsTierVisible(false);
    switchTimerRef.current = window.setTimeout(() => {
      setDisplayTier(nextTier);
      setIsTierVisible(true);
      switchTimerRef.current = null;
    }, 180);
  };

  const activeTierMeta = tiers.find((tier) => tier.key === activeTier) ?? tiers[0];
  const displayTierMeta = tiers.find((tier) => tier.key === displayTier) ?? tiers[0];
  const displaySponsors = sponsors[displayTierMeta.key];
  const rootTone = isLightMode ? "text-black" : "text-white";

  return (
    <div className={`relative h-screen overflow-hidden bg-black transition-colors duration-500 ${rootTone}`}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute left-[6%] top-[8%] h-44 w-44 rounded-full blur-3xl transition-all duration-700 ${
            isLightMode ? "bg-[#ffd23f]/45 opacity-100 scale-110" : "bg-[#ffd23f]/18 opacity-50 scale-100"
          }`}
        />
        <div
          className={`absolute bottom-[12%] right-[8%] h-56 w-56 rounded-full blur-3xl transition-all duration-700 ${
            isLightMode ? "bg-[#1fe0ff]/28 opacity-80 scale-110" : "bg-[#1fe0ff]/16 opacity-45 scale-100"
          }`}
        />
        <div
          className={`absolute right-[18%] top-[14%] h-28 w-28 rounded-full blur-2xl transition-all duration-700 ${
            isLightMode ? "bg-white/40 opacity-90" : "bg-white/8 opacity-20"
          }`}
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: isLightMode
            ? "linear-gradient(135deg, rgba(255,251,236,0.92) 0%, rgba(255,243,196,0.62) 26%, rgba(255,255,255,0.44) 100%), radial-gradient(circle at 18% 20%, rgba(255,210,63,0.62), transparent 26%), radial-gradient(circle at 82% 14%, rgba(31,224,255,0.32), transparent 24%), radial-gradient(circle at 50% 78%, rgba(255,255,255,0.24), transparent 24%)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.42) 40%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      <main className="pointer-events-none relative z-10 mx-auto flex h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:max-w-360 xl:px-10 xl:py-8">
        <header className="shrink-0 text-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] xl:text-xs ${isLightMode ? "text-black/55" : "text-white/50"}`}>Hack X 2.0</p>
          <h1
            className="navbar-font mt-3 text-4xl uppercase leading-none transition-all duration-500 sm:text-6xl xl:text-7xl 2xl:text-[5.5rem] scale-100"
            style={{ textShadow: `4px 4px 0 ${activeTierMeta.accent}` }}
          >
            Our Sponsors
          </h1>
          <p className={`mx-auto mt-4 max-w-2xl text-sm leading-6 sm:text-base xl:max-w-3xl xl:text-lg xl:leading-7 ${isLightMode ? "text-black/65" : "text-white/65"}`}>
            brands and communities supporting Hack X 2.0.
          </p>
        </header>

        <div className="pointer-events-none mt-6 flex flex-wrap items-center justify-center gap-3 xl:mt-7 xl:gap-4">
          {tiers.map((tier) => (
            <TierButton
              key={tier.key}
              active={tier.key === activeTier}
              label={tier.label}
              accent={tier.accent}
              isLightMode={isLightMode}
              onClick={() => handleTierChange(tier.key)}
            />
          ))}
        </div>

        <section
          className={`mt-6 min-h-0 flex-1 overflow-hidden border-[3px] transition-all duration-500 backdrop-blur-md ${
            isLightMode
              ? "border-black/85 bg-[#fff9e8]/72 shadow-[14px_14px_0_rgba(255,210,63,0.28)]"
              : "border-black bg-black/38 shadow-[10px_10px_0_rgba(0,0,0,0.9)]"
          } scale-100`}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className={`shrink-0 border-b px-5 py-4 sm:px-6 xl:px-7 xl:py-5 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.34em] xl:text-xs ${isLightMode ? "text-black/50" : "text-white/55"}`}>Sponsor tier</p>
                  <h2 className={`navbar-font mt-2 text-3xl uppercase leading-none transition-all duration-300 sm:text-4xl xl:text-5xl ${isLightMode ? "text-black" : "text-white"}`} style={{ textShadow: `3px 3px 0 ${displayTierMeta.accent}` }}>
                    {displayTierMeta.label}
                  </h2>
                </div>
                <span
                  className="pointer-events-auto inline-flex border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-black sm:px-4 xl:px-5 xl:py-2.5 xl:text-xs"
                  style={{ backgroundColor: displayTierMeta.accent }}
                >
                  {String(displaySponsors.length).padStart(2, "0")} sponsors
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 px-5 py-5 sm:px-6 sm:py-6 xl:px-7 xl:py-7">
              <div
                className={`grid h-full auto-rows-fr gap-4 transition-all duration-300 xl:gap-5 ${displayTierMeta.colClass} ${
                  isTierVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                {displaySponsors.map((sponsor, index) => (
                  <div
                    key={`${displayTierMeta.key}-${index}`}
                    className={`transition-all duration-500 ${
                      isTierVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    } scale-100`}
                    style={{ transitionDelay: `${isTierVisible ? 80 + index * 70 : 0}ms` }}
                  >
                    <SponsorCard {...sponsor} accent={displayTierMeta.accent} isLightMode={isLightMode} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-5 flex shrink-0 flex-col items-center justify-between gap-3 sm:flex-row xl:mt-6">
          <p className={`text-center text-sm sm:text-left xl:text-base ${isLightMode ? "text-black/55" : "text-white/50"}`}>Click the tier buttons to reveal sponsors. The background cubes stay interactive.</p>
          <Link
            href="/contact"
            className="pointer-events-auto inline-flex items-center gap-2 border-2 border-black bg-[#ffd23f] px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-black shadow-[5px_5px_0_#000] transition-transform hover:-translate-y-0.5 xl:px-6 xl:py-3.5 xl:text-base"
          >
            Get in touch →
          </Link>
        </footer>
      </main>
    </div>
  );
}