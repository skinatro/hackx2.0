"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { WaveTiles } from "@/ui/components/basic/wave-tiles";
import Preloader from "@/ui/components/preloader";
import ScrollSequence from "@/ui/components/scroll-sequence";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Nvbar } from "./components/nvbar";

const STYLES = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(2deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes float-reverse {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(15px) rotate(-2deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .text-outline-light {
    -webkit-text-stroke: 2px black;
    color: transparent;
  }
  .text-outline-dark {
    -webkit-text-stroke: 2px white;
    color: transparent;
  }
  .bg-grid-light {
    background-size: 50px 50px;
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  }
  .bg-grid-dark {
    background-size: 50px 50px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
`;

function CountdownItem({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="relative flex w-20 flex-col items-center justify-center p-3 sm:w-32 sm:p-6 group overflow-hidden border-[3px] border-black bg-white shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_#000]">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: color, zIndex: 0 }}
      />
      <span className="relative z-10 navbar-font text-4xl font-black sm:text-6xl text-black">
        {value}
      </span>
      <span className="relative z-10 mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/70 group-hover:text-black">
        {label}
      </span>
    </div>
  );
}

function FloatingBadge({
  children,
  delay = 0,
  styleName,
  isLightMode,
  floatRev = false,
}: {
  children: React.ReactNode;
  delay?: number;
  styleName?: string;
  isLightMode: boolean;
  floatRev?: boolean;
}) {
  return (
    <div
      className={`absolute z-20 flex items-center justify-center p-3 transition-all duration-500 ${
        isLightMode
          ? "border-[3px] border-black bg-white/80 shadow-[6px_6px_0_#000]"
          : "border-[3px] border-white/50 bg-[#111]/80 shadow-[6px_6px_0_#c0ff00]"
      } ${styleName}`}
      style={{
        animation: `${floatRev ? "float-reverse" : "float"} 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function HighlightCard({
  title,
  description,
  icon,
  color,
  isLightMode,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isLightMode: boolean;
  delay: number;
}) {
  return (
    <div
      className={`cursor-target group relative flex flex-col p-6 sm:p-8 transition-transform duration-500 hover:-translate-y-2 ${
        isLightMode
          ? "border-[3px] border-black bg-white shadow-[8px_8px_0_#000]"
          : "border-[3px] border-white/30 bg-[#0a0a0a] shadow-[8px_8px_0_#fff]"
      }`}
      style={{
        animation: `float-reverse 8s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className={`absolute inset-0 z-0 origin-top scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100 border-[3px] border-transparent ${isLightMode ? "group-hover:border-black" : "group-hover:border-white"}`}
        style={{ backgroundColor: color }}
      />
      <div className="relative z-10">
        <div
          className={`mb-6 flex h-16 w-16 items-center justify-center border-[3px] text-3xl shadow-[4px_4px_0_#000] ${isLightMode ? "border-black bg-[#f4f0ea]" : "border-black bg-white"} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3
          className={`text-2xl font-black uppercase tracking-widest transition-colors duration-300 ${isLightMode ? "text-black" : "text-white"} group-hover:text-black`}
        >
          {title}
        </h3>
        <p
          className={`mt-4 text-sm font-semibold leading-relaxed transition-colors duration-300 ${isLightMode ? "text-black/70" : "text-white/70"} group-hover:text-black/90`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const FinTechIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CityIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M3 7v14" />
    <path d="M13 3v18" />
    <path d="M21 9v12" />
    <path d="M7 11h2" />
    <path d="M7 15h2" />
    <path d="M17 7h2" />
    <path d="M17 11h2" />
    <path d="M17 15h2" />
  </svg>
);

const MobilityIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.5-1 1-1" />
    <path d="M15 20v-5s-1 .5-1 1" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.23 18.81 14.23 18.81 15 17v-2.34" />
    <path d="M18 5V1c0-1-1-1-1-1H7s-1 0-1 1v4" />
    <path d="M18 5c0 4.5-2 9-6 9s-6-4.5-6-9" />
  </svg>
);

export default function Home() {
  const { isLightMode } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Phase 1: Intro (HACKX 2.0 reveal)
  const introOpacity = useTransform(smoothProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const introY = useTransform(smoothProgress, [0, 0.15], [0, -40]);

  // Phase 2: Mission (Driving Digital Bharat)
  const missionOpacity = useTransform(
    smoothProgress,
    [0.2, 0.25, 0.35, 0.4],
    [0, 1, 1, 0],
  );
  const missionY = useTransform(
    smoothProgress,
    [0.2, 0.25, 0.35, 0.4],
    [30, 0, 0, -30],
  );

  // Phase 3: The Loot (Prizes)
  const lootOpacity = useTransform(
    smoothProgress,
    [0.45, 0.5, 0.6, 0.65],
    [0, 1, 1, 0],
  );
  const lootY = useTransform(
    smoothProgress,
    [0.45, 0.5, 0.6, 0.65],
    [30, 0, 0, -30],
  );

  // Phase 4: The Domains (Tracks)
  const domainsPhaseOpacity = useTransform(
    smoothProgress,
    [0.7, 0.75, 0.85, 0.9],
    [0, 1, 1, 0],
  );
  const domainsPhaseY = useTransform(
    smoothProgress,
    [0.7, 0.75, 0.85, 0.9],
    [30, 0, 0, -30],
  );

  // Phase 5: Pillars (Highlights)
  const pillarsOpacity = useTransform(
    smoothProgress,
    [0.92, 0.96, 0.99, 1],
    [0, 1, 1, 1],
  );
  const pillarsY = useTransform(smoothProgress, [0.92, 0.96], [30, 0]);

  // Navbar Animation: Appears at the very end
  const navbarOpacity = useTransform(smoothProgress, [0.97, 0.99], [0, 1]);
  const navbarX = useTransform(smoothProgress, [0.97, 0.99], [60, 0]);

  // Background Dimming for mobile to improve readability
  const sequenceOpacity = useTransform(
    smoothProgress,
    [0.15, 0.2, 0.4, 0.45, 0.7, 0.75, 0.9, 0.95],
    [1, 0.5, 0.5, 0.4, 0.4, 0.4, 0.4, 1],
  );

  // Pointer Events Control: Disable interaction for sections that are invisible
  const introPointerEvents = useTransform(introOpacity, (v) =>
    v > 0.1 ? "auto" : ("none" as any),
  );
  const missionPointerEvents = useTransform(missionOpacity, (v) =>
    v > 0.1 ? "auto" : ("none" as any),
  );
  const lootPointerEvents = useTransform(lootOpacity, (v) =>
    v > 0.1 ? "auto" : ("none" as any),
  );
  const domainsPointerEvents = useTransform(domainsPhaseOpacity, (v) =>
    v > 0.1 ? "auto" : ("none" as any),
  );
  const pillarsPointerEvents = useTransform(pillarsOpacity, (v) =>
    v > 0.1 ? "auto" : ("none" as any),
  );
  const navbarPointerEvents = useTransform(navbarOpacity, (v) =>
    v > 0.1 ? "auto" : ("none" as any),
  );

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <Preloader
        onComplete={() => setPreloaderComplete(true)}
        optimizeForPerformance
      />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {/* Grid Pattern Background - Keeping this for texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Wave Tiles Background - Design Uniformity with Sponsors */}
      {!isMobile && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <WaveTiles
            className={isLightMode ? "opacity-40" : "opacity-30"}
            optimizeForPerformance
            onModeChange={() => {}}
          />
        </div>
      )}

      {/* Floating Canvas Sequence Layer */}
      <motion.div
        style={{ opacity: isMobile ? sequenceOpacity : 1 }}
        className="absolute top-0 left-0 w-full z-0"
      >
        <ScrollSequence
          frameCount={isMobile ? 48 : 192}
          totalFrames={192}
          padLength={3}
          fileExtension=".webp"
          filePrefix="frame-"
          isLightMode={isLightMode}
          height="h-[600vh]"
          optimizeForPerformance
        />
        {/* Soft bottom blend mask to merge video to solid body section smoothly */}
        <div
          className={`absolute bottom-0 left-0 w-full h-[50vh] bg-linear-to-t ${isLightMode ? "from-[#f5f5f5] to-transparent" : "from-black to-transparent"} z-10`}
        />
      </motion.div>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-10 sm:opacity-20">
        <div className="absolute top-[25%] -left-[10vw] flex whitespace-nowrap animate-[marquee_60s_linear_infinite] sm:animate-[marquee_40s_linear_infinite]">
          <span
            className={`text-[20vw] sm:text-[25vw] font-black uppercase tracking-tighter ${isLightMode ? "text-outline-2 text-outline-light" : "text-outline-dark"}`}
          >
            HACKX 2.0 HACKX 2.0 HACKX 2.0 HACKX 2.0
          </span>
        </div>
        <div className="absolute bottom-[10%] -left-[20vw] flex whitespace-nowrap animate-[marquee_50s_linear_infinite_reverse] sm:animate-[marquee_35s_linear_infinite_reverse]">
          <span
            className={`text-[12vw] sm:text-[15vw] font-black uppercase tracking-tighter`}
          >
            BUILD THE FUTURE BUILD THE FUTURE BUILD THE FUTURE
          </span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Main Content */}
        <main className="relative z-20 flex w-full flex-1 flex-col">
          {/* Height matched to the length of the sticky ScrollSequence to keep layout linear */}
          <div
            ref={scrollContainerRef}
            className="h-[600vh] w-full relative z-20 pointer-events-auto"
          >
            {/* Hacking Begins Counter - Minimal */}
            <motion.div
              style={{
                opacity: introOpacity,
                y: introY,
                pointerEvents: introPointerEvents,
              }}
              className="absolute top-3 left-3 sm:top-5 sm:left-5 px-3 py-1.5 sm:px-4 sm:py-2 mx-auto max-w-xs bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-lg cursor-target"
            >
              <span className="text-base sm:text-lg font-bold uppercase tracking-tight text-black dark:text-white opacity-80">
                Hacking Begins In
              </span>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 ">
                <span className="text-xl sm:text-2xl font-black text-[#ff00a0]">
                  32
                </span>
                <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                  Days
                </span>
                <span className="text-xl font-black text-black/40 dark:text-white/40">
                  :
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#00f0ff]">
                  10
                </span>
                <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                  Hours
                </span>
                <span className="text-xl font-black text-black/40 dark:text-white/40">
                  :
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#ff00a0]">
                  57
                </span>
                <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                  Minutes
                </span>
              </div>
            </motion.div>
            {/* Sticky pin wrap so text stays fixed while scrolling the background frames */}
            <div className="sticky  top-29 h-[calc(100vh-150px)] w-full flex flex-col overflow-hidden">
              <div className="relative w-full mx-auto flex-1 flex flex-col justify-between px-6 sm:px-12">
                {/* GIANT BACKGROUND TITLE + Hacking Begins Counter (Glassmorphism) */}
                <motion.div
                  style={{
                    opacity: introOpacity,
                    y: introY,
                    pointerEvents: introPointerEvents,
                  }}
                  className="absolute top-[35%] sm:top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center flex flex-col items-center justify-center z-50"
                >
                  <div className="flex font-black text-[clamp(3rem,12vw,200px)] sm:text-[clamp(4rem,16vw,200px)] leading-tight tracking-tighter mix-blend-overlay">
                    <h1 className={`text-[#ff00a0] cursor-target`}>HACKX</h1>
                    <h1
                      className="text-transparent ml-2 sm:ml-8 cursor-target"
                      style={{
                        WebkitTextStroke: isMobile ? "1px white" : "3px white",
                      }}
                    >
                      2.0
                    </h1>
                  </div>
                </motion.div>

                {/* Floating Badges */}
                <motion.div
                  style={{
                    opacity: introOpacity,
                    pointerEvents: introPointerEvents,
                  }}
                >
                  <FloatingBadge
                    isLightMode={isLightMode}
                    styleName="cursor-target absolute left-[2%] top-[45%] hidden md:flex"
                    delay={0.5}
                    floatRev
                  >
                    <div className="flex flex-col gap-1 text-[10px] sm:text-[12px] font-mono font-bold leading-none">
                      <span style={{ color: "#ff00a0" }}>import</span>
                      <span style={{ color: isLightMode ? "#000" : "#fff" }}>
                        {"{"} future {"}"}
                      </span>
                      <span style={{ color: isLightMode ? "#000" : "#fff" }}>
                        from{" "}
                        <span style={{ color: "#c0ff00" }}>{"'now';"}</span>
                      </span>
                    </div>
                  </FloatingBadge>

                  <FloatingBadge
                    isLightMode={isLightMode}
                    styleName="cursor-target absolute right-[10%] top-[10%] hidden md:flex"
                    delay={1.2}
                  >
                    <span
                      className="text-2xl sm:text-3xl font-black text-black"
                      style={{ WebkitTextStroke: "2px black" }}
                    >
                      {"< />"}
                    </span>
                  </FloatingBadge>

                  <FloatingBadge
                    isLightMode={isLightMode}
                    styleName="cursor-target absolute left-[10%] top-[10%] hidden lg:flex"
                    delay={0.8}
                  >
                    <span className="text-xl sm:text-2xl drop-shadow-[2px_2px_0_#ff00a0]">
                      ✨
                    </span>
                  </FloatingBadge>
                </motion.div>

                {/* NARRATIVE PHASE 1: BRAND INTRO */}
                <motion.div
                  style={{
                    opacity: introOpacity,
                    y: introY,
                    pointerEvents: introPointerEvents,
                  }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="relative z-10 w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-16 sm:pt-42">
                    <div
                      className={`inline-block border-[3px] px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-transform hover:scale-105 ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[4px_4px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[4px_4px_0_#fff]"}`}
                    >
                      CSI & GDG SFIT PRESENTS
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-18 sm:pt-60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-black text-white px-4 py-2 border-[3px] border-white/50 shadow-[4px_4px_0_#c0ff00]">
                        <div className="h-2 w-2 rounded-full bg-[#00f0ff] animate-pulse"></div>
                        <span className="text-[10px] font-black tracking-[0.2em]">
                          STATUS: LIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex flex-col items-center lg:flex-row lg:items-end justify-between text-center lg:text-left mt-auto pb-8">
                    <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-6 max-w-xl">
                      <div
                        className={`cursor-target inline-block w-max font-black uppercase tracking-widest text-xs sm:text-sm whitespace-nowrap border-[3px] px-4 py-2 ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#c0ff00]"}`}
                      >
                        — CODE FOR BHARAT 5.0 —
                      </div>
                      <p
                        className={`cursor-target text-xs sm:text-base font-bold leading-relaxed tracking-wide ${isLightMode ? "text-black p-3 sm:p-5 border-[3px] border-black bg-white/70 backdrop-blur-md shadow-[4px_4px_0_#000]" : "text-white p-3 sm:p-5 border-[3px] border-white/30 bg-black/50 backdrop-blur-md shadow-[4px_4px_0_#fff]"}`}
                      >
                        A national-level 24-hour student hackathon hosted at St.
                        Francis Institute of Technology, Mumbai. Join 10,000+
                        top developers, designers, and innovators shaping the
                        future of India&apos;s digital infrastructure.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pointer-events-auto">
                      <Link
                        href="https://unstop.com/" // Placeholder: User should provide the actual event link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-target group relative inline-flex items-center justify-center gap-3 px-6 py-3 sm:px-10 sm:py-5 font-black uppercase tracking-widest text-white transition-all hover:-translate-y-1 w-full sm:w-auto overflow-hidden border-[3px] border-black bg-[#1c4980] shadow-[6px_6px_0_#000] sm:shadow-[8px_8px_0_#000]"
                      >
                        <div className="absolute inset-0 z-0 bg-[#2c69d1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <svg
                          viewBox="0 0 200 200"
                          fill="currentColor"
                          className="relative z-10 h-6 w-6"
                        >
                          <path d="M100,1C45.5,1,1,45.5,1,100c0,54.5,44.5,99,99,99c54.5,0,99-44.5,99-99C199,45.5,154.5,1,100,1z M90.1,140.1 l-20.6,0v-9.3c-5.9,9-13.1,12.8-23.9,12.8c-17.2,0-26.8-9.9-26.8-27.5V60.8h20.7v51c0,9.6,4.4,14.2,13.2,14.2 c10.1,0,16.6-6.2,16.6-15.6V60.7h20.7V140.1z M160.5,140.1v-49c0-9.4-4.4-14.2-13.2-14.2c-10.1,0-16.6,6.2-16.6,15.6v47.6h-20.7 V60.7l20.6,0v0.1v11.4c5.9-9,13.1-12.8,23.9-12.8c17.2,0,26.8,9.9,26.8,27.5v53.2H160.5z" />
                        </svg>
                        <span className="relative z-10">
                          Register on Unstop
                        </span>
                      </Link>
                      <Link
                        href="about"
                        className="cursor-target group relative inline-flex items-center justify-center px-4 py-3 sm:px-8 sm:py-5 font-black uppercase tracking-widest transition-all hover:-translate-y-1 w-full sm:w-auto"
                      >
                        <div
                          className={`absolute inset-0 border-[3px] transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 ${isLightMode ? "bg-white border-black" : "bg-black border-white"}`}
                        />
                        <div
                          className={`absolute inset-0 border-[3px] -z-10 translate-x-2 translate-y-2 ${isLightMode ? "border-black bg-[#00f0ff]" : "border-white bg-[#ff00a0]"}`}
                        />
                        <span
                          className={`relative z-10 mix-blend-normal! flex items-center justify-center gap-2 ${isLightMode ? "text-black" : "text-white"}`}
                        >
                          LEARN MORE{" "}
                          <span className="group-hover:translate-y-1 transition-transform">
                            ↓
                          </span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* NARRATIVE PHASE 2: MISSION STATEMENT */}
                <motion.div
                  style={{
                    opacity: missionOpacity,
                    y: missionY,
                    pointerEvents: missionPointerEvents,
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="max-w-4xl text-center px-6">
                    <h2
                      className={`font-black uppercase tracking-tighter text-4xl sm:text-8xl mb-6 sm:mb-8 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] ${isLightMode ? "text-white" : "text-white"}`}
                    >
                      Driving Digital{" "}
                      <span className="text-[#ff00a0] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                        Bharat
                      </span>
                    </h2>
                    <div
                      className={`mx-auto h-2 w-32 mb-12 ${isLightMode ? "bg-black" : "bg-[#c0ff00]"}`}
                    />
                    <p
                      className={`text-lg sm:text-4xl font-black leading-tight tracking-tight uppercase p-4 sm:p-6 border-[3px] backdrop-blur-md ${isLightMode ? "text-white border-white/30 bg-black/40 shadow-[6px_6px_0_#000] sm:shadow-[8px_8px_0_#000]" : "text-white border-white/20 bg-black/60 shadow-[6px_6px_0_#fff]"}`}
                    >
                      Over an intense 24-hour experience, we build the bridges
                      between{" "}
                      <span className="underline decoration-[#00f0ff] decoration-4 underline-offset-4">
                        bold ideas
                      </span>{" "}
                      and{" "}
                      <span className="underline decoration-[#ff00a0] decoration-4 underline-offset-4">
                        impactful reality.
                      </span>
                    </p>
                  </div>
                </motion.div>

                {/* NARRATIVE PHASE 3: THE LOOT */}
                <motion.div
                  style={{
                    opacity: lootOpacity,
                    y: lootY,
                    pointerEvents: lootPointerEvents,
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none"
                >
                  <div className="text-center w-full max-w-5xl pointer-events-auto">
                    <h2
                      className={`font-black uppercase tracking-tighter text-4xl sm:text-7xl mb-8 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] text-zinc-100`}
                    >
                      The Loot
                    </h2>
                    <div className="mb-14 relative inline-block">
                      <div className="absolute -inset-2 bg-[#ff00a0] blur-xl opacity-20 animate-pulse" />
                      <div className="relative flex flex-col items-center">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#00f0ff] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                          Total Prize Pool
                        </span>
                        <div className="px-10 py-4 border-[4px] border-black bg-[#c0ff00] shadow-[12px_12px_12px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-transform duration-300">
                          <h3 className="text-5xl sm:text-7xl font-black text-black tracking-tighter leading-none">
                            ₹1.5 LAKH
                          </h3>
                        </div>
                        <div className="mt-4 flex gap-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">
                          <span>₹1L Domain Pool</span>
                          <span className="text-[#ff00a0]">•</span>
                          <span>₹50k Special Tracks</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
                      {[
                        {
                          domain: "Cyber Defence",
                          amount: "₹25k",
                          color: "#ff00a0",
                        },
                        {
                          domain: "FinTech & Finance",
                          amount: "₹25k",
                          color: "#c0ff00",
                        },
                        {
                          domain: "Smart Cities",
                          amount: "₹25k",
                          color: "#00f0ff",
                        },
                        {
                          domain: "Future Mobility",
                          amount: "₹25k",
                          color: "#ff00a0",
                        },
                      ].map((prize, idx) => (
                        <div
                          key={idx}
                          className={`cursor-target p-6 sm:p-8 flex flex-col items-center justify-center border-[3px] transition-transform hover:-translate-y-2 duration-300 ${
                            isLightMode
                              ? "border-black bg-white shadow-[8px_8px_0_#000]"
                              : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
                          }`}
                        >
                          <span className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-gray-500 mb-2 text-center leading-tight">
                            {prize.domain}
                          </span>
                          <span
                            className="text-3xl sm:text-5xl font-black tracking-tighter"
                            style={{ color: prize.color }}
                          >
                            {prize.amount}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 p-6 border-[3px] border-dashed border-[#c0ff00]/50 bg-black/40 backdrop-blur-sm max-w-2xl mx-auto">
                      <p className="text-white font-black uppercase tracking-widest text-base sm:text-lg mb-2">
                        + ₹50k Special Tracks Pool
                      </p>
                      <p className="text-zinc-400 text-sm sm:text-base font-bold leading-relaxed">
                        Additional prizes for{" "}
                        <span className="text-[#00f0ff]">Best UI/UX</span>,{" "}
                        <span className="text-[#ff00a0]">
                          Best Technical Implementation
                        </span>
                        , and other categories to be announced soon!
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* NARRATIVE PHASE 4: THE DOMAINS */}
                <motion.div
                  style={{
                    opacity: domainsPhaseOpacity,
                    y: domainsPhaseY,
                    pointerEvents: domainsPointerEvents,
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none"
                >
                  <div className="w-full max-w-6xl pointer-events-auto">
                    <h2
                      className={`font-black uppercase tracking-tighter text-center text-4xl sm:text-7xl mb-8 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] text-zinc-100`}
                    >
                      The Domains
                    </h2>
                    <p
                      className={`mb-12 text-base sm:text-xl font-bold uppercase tracking-widest text-center text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]`}
                    >
                      Choose a challenge or pitch your own initiative.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
                      {[
                        {
                          name: "Cyber Defence",
                          color: "#ff00a0",
                          icon: <ShieldIcon className="h-full w-full" />,
                        },
                        {
                          name: "FinTech & Digital Economy",
                          color: "#c0ff00",
                          icon: <FinTechIcon className="h-full w-full" />,
                        },
                        {
                          name: "Smart Cities",
                          color: "#00f0ff",
                          icon: <CityIcon className="h-full w-full" />,
                        },
                        {
                          name: "Future Mobility",
                          color: "#ff00a0",
                          icon: <MobilityIcon className="h-full w-full" />,
                        },
                      ].map((track, i) => (
                        <div
                          key={i}
                          className={`cursor-target group relative flex flex-col items-center justify-center p-6 sm:p-8 transition-transform duration-500 hover:-translate-y-2 ${
                            isLightMode
                              ? "border-[3px] border-black bg-white shadow-[6px_6px_0_#000]"
                              : "border-[3px] border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                          }`}
                        >
                          <div
                            className="absolute inset-0 z-0 origin-bottom scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100"
                            style={{ backgroundColor: track.color }}
                          />
                          <div
                            className={`relative z-10 h-10 w-10 mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-12 ${isLightMode ? "text-black" : "text-white"} group-hover:text-black`}
                          >
                            {track.icon}
                          </div>
                          <h3
                            className={`relative z-10 text-base sm:text-lg font-black uppercase tracking-widest text-center transition-colors duration-300 ${
                              isLightMode ? "text-black" : "text-white"
                            } group-hover:text-black`}
                          >
                            {track.name}
                          </h3>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  style={{
                    opacity: pillarsOpacity,
                    y: pillarsY,
                    pointerEvents: pillarsPointerEvents,
                  }}
                  className="absolute inset-0 flex flex-col justify-between pt-24 sm:pt-32 pb-32 sm:pb-48 px-4 sm:px-6 pointer-events-none"
                >
                  <div className="text-center">
                    <h2
                      className={`font-black uppercase tracking-tighter text-4xl sm:text-7xl mb-8 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] text-zinc-100`}
                    >
                      Event Highlights
                    </h2>
                    <p
                      className={`mt-4 text-sm sm:text-md font-bold uppercase tracking-widest ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
                    >
                      Scale • Mentorship • Prizes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pointer-events-auto max-w-7xl mx-auto w-full px-6 sm:px-4">
                    <HighlightCard
                      title="Scale"
                      description="Connect with 10,000+ participants and builders across India."
                      icon={<GlobeIcon className="h-2/3 w-2/3" />}
                      color="#c0ff00"
                      isLightMode={isLightMode}
                      delay={0}
                    />
                    <HighlightCard
                      title="Mentorship"
                      description="Gain insights directly from industry leaders and experts."
                      icon={<ZapIcon className="h-2/3 w-2/3" />}
                      color="#00f0ff"
                      isLightMode={isLightMode}
                      delay={0.2}
                    />
                    <HighlightCard
                      title="Prizes"
                      description="Compete for a massive ₹1.5 lakh prize pool and bounties."
                      icon={<TrophyIcon className="h-2/3 w-2/3" />}
                      color="#ff00a0"
                      isLightMode={isLightMode}
                      delay={0.4}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "1200px",
            }}
          >
            <div className="pb-10 relative z-20">
              {/* Countdown */}
              <div
                className={`pointer-events-auto relative px-8 py-10 sm:py-14 text-center mx-auto max-w-4xl mt-32 border-[3px] ${isLightMode ? "border-black bg-[#c0ff00] shadow-[12px_12px_0_#000]" : "border-white/30 bg-[#c0ff00] shadow-[12px_12px_0_#fff]"}`}
              >
                <h2 className="text-2xl sm:text-6xl font-black uppercase tracking-tighter text-black">
                  Hacking Begins In
                </h2>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 cursor-target">
                  <CountdownItem value="32" label="Days" color="#ff00a0" />
                  <div className="text-4xl font-black text-black hidden sm:block">
                    :
                  </div>
                  <CountdownItem value="10" label="Hours" color="#00f0ff" />
                  <div className="text-4xl font-black text-black hidden sm:block">
                    :
                  </div>
                  <CountdownItem value="57" label="Minutes" color="#ff00a0" />
                </div>
              </div>
              {/* RESOURCES & TEAM SECTION */}
              <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 w-full relative z-20 pointer-events-auto px-4 sm:px-0">
                <div
                  className={`p-6 sm:p-8 border-[3px] ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}
                >
                  <h3
                    className={`text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-8 ${isLightMode ? "text-black" : "text-white"}`}
                  >
                    Hacker Toolkit
                  </h3>
                  <div className="flex flex-col gap-4">
                    <a
                      href="#"
                      className={`cursor-target flex items-center justify-between p-4 border-[3px] text-lg font-black uppercase tracking-wider transition-colors ${isLightMode ? "border-black hover:bg-[#c0ff00]" : "border-white/30 hover:bg-[#c0ff00] hover:text-black hover:border-[#c0ff00] text-white"}`}
                    >
                      <span>Rules & Regulations</span>
                      <span>→</span>
                    </a>
                    <a
                      href="#"
                      className={`cursor-target flex items-center justify-between p-4 border-[3px] font-black uppercase tracking-wider transition-colors ${isLightMode ? "border-black hover:bg-[#00f0ff]" : "border-white/30 hover:bg-[#00f0ff] hover:text-black hover:border-[#00f0ff] text-white"}`}
                    >
                      <span>PPT Template</span>
                      <span>→</span>
                    </a>
                    <a
                      href="#"
                      className={`cursor-target flex items-center justify-between p-4 border-[3px] font-black uppercase tracking-wider transition-colors ${isLightMode ? "border-black hover:bg-[#ff00a0] hover:text-white" : "border-white/30 hover:bg-[#ff00a0] text-white"}`}
                    >
                      <span>API Guidelines</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>

                <div
                  className={`p-6 sm:p-8 border-[3px] ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[8px_8px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[8px_8px_0_#fff]"}`}
                >
                  <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
                    The Organizers
                  </h3>
                  <p className="font-bold mb-8 opacity-90">
                    Powered by CSI SFIT and GDG SFIT.
                  </p>
                  <div className="grid grid-cols-2 gap-4 px-2 sm:px-0">
                    {["Shahiil", "Roen", "Aryan"].map((name, i) => (
                      <div
                        key={i}
                        className="flex flex-col border-b-[3px] border-black/20 pb-2"
                      >
                        <span className="font-black uppercase tracking-wider">
                          {name}
                        </span>
                        <span className="text-xs font-bold opacity-75">
                          Core Member
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Animated Navbar Reveal */}
        <motion.div
          style={{
            opacity: navbarOpacity,
            x: navbarX,
            pointerEvents: navbarPointerEvents,
          }}
          className="fixed inset-y-0 right-0 z-50 pointer-events-none flex items-center"
        >
          <Nvbar />
        </motion.div>
      </div>
    </div>
  );
}
