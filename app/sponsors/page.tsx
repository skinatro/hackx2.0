"use client";

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
      className={`cursor-target pointer-events-auto group flex h-full flex-col gap-4 border-2 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 xl:gap-5 xl:p-7 ${
        isLightMode
          ? "border-black/15 bg-white/72 text-black shadow-[8px_8px_0_rgba(255,255,255,0.15)] hover:border-black/35 hover:bg-white/85"
          : "border-white/20 bg-black/55 text-white shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:border-white/50 hover:bg-black/70"
      }`}
    >
      <div
        className={`cursor-target flex h-20 items-center justify-center border-2 text-sm font-bold uppercase tracking-widest xl:h-24 xl:text-base ${
          isLightMode ? "border-black/10 bg-black/5 text-black/35" : "border-white/10 bg-white/5 text-white/30"
        }`}
        style={{ borderTopColor: accent }}
      >
        {logo ?? name}
      </div>
      <div>
        <p className={`cursor-target text-base font-black uppercase tracking-widest xl:text-lg ${isLightMode ? "text-black" : "text-white"}`}>{name}</p>
        <p className={`cursor-target mt-2 text-sm leading-6 xl:text-base xl:leading-7 ${isLightMode ? "text-black/65" : "text-white/65"}`}>{description}</p>
      </div>
      <span className="cursor-target mt-auto text-[11px] font-black uppercase tracking-widest xl:text-xs" style={{ color: accent }}>
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
      className={`cursor-target pointer-events-auto border-2 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all duration-300 sm:text-sm xl:px-5 xl:py-3.5 xl:text-base ${
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
  const { isLightMode } = useTheme();
  const switchTimerRef = useRef<number | null>(null);

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

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
        <div className="text-left w-full mx-auto relative z-20 pointer-events-auto pb-10">
        <header className="text-center">
          <p className={`cursor-target text-[10px] font-black uppercase tracking-[0.4em] xl:text-xs ${isLightMode ? "text-black/55" : "text-white/50"}`}>Hack X 2.0</p>
          <h1
            className={`cursor-target text-center font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 ${isLightMode ? "text-black" : "text-white"}`}
          >
            Our Sponsors
          </h1>
          <p className={`cursor-target text-center font-black uppercase tracking-widest text-sm mb-16 px-4 py-2 border-[3px] mx-auto w-fit ${isLightMode ? "border-black bg-[#ffd23f] text-black" : "border-[#ffd23f] bg-black text-[#ffd23f]"}`}>
            Presenting • Powered By • Community Partners
          </p>
        </header>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
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

        <section className="w-full">
          <div className={`cursor-target mb-10 border-[3px] p-6 sm:p-8 ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={`cursor-target text-[10px] font-black uppercase tracking-[0.34em] ${isLightMode ? "text-black/50" : "text-white/55"}`}>Sponsor tier</p>
                <h2 className={`cursor-target mt-3 font-black uppercase tracking-tighter text-4xl sm:text-5xl ${isLightMode ? "text-black" : "text-white"}`}>
                  {displayTierMeta.label}
                </h2>
              </div>
              <span
                className="cursor-target inline-flex w-fit border-[3px] border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-black"
                style={{ backgroundColor: displayTierMeta.accent }}
              >
                {String(displaySponsors.length).padStart(2, "0")} sponsors
              </span>
            </div>
          </div>

          <div
            className={`grid auto-rows-fr gap-6 ${displayTierMeta.colClass} ${
              isTierVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-300`}
          >
            {displaySponsors.map((sponsor, index) => (
              <div
                key={`${displayTierMeta.key}-${index}`}
                className={`cursor-target transition-all duration-500 ${
                  isTierVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${isTierVisible ? 80 + index * 70 : 0}ms` }}
              >
                <SponsorCard {...sponsor} accent={displayTierMeta.accent} isLightMode={isLightMode} />
              </div>
            ))}
          </div>
        </section>

        </div>
      </main>
    </div>
  );
}