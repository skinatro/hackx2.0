"use client";

import { WaveTiles } from "@/ui/components/basic/wave-tiles";
import ScrollSequence from "@/ui/components/scroll-sequence";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";

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
  icon: string;
  color: string;
  isLightMode: boolean;
  delay: number;
}) {
  return (
    <div
      className={`cursor-target group relative flex flex-col p-8 transition-transform duration-500 hover:-translate-y-2 ${
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
    <div className="relative flex w-24 flex-col items-center justify-center p-4 sm:w-32 sm:p-6 group overflow-hidden border-[3px] border-black bg-white shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_#000]">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: color, zIndex: 0 }}
      />
      <span className="relative z-10 navbar-font text-5xl font-black sm:text-6xl text-black">
        {value}
      </span>
      <span className="relative z-10 mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/70 group-hover:text-black">
        {label}
      </span>
    </div>
  );
}

const ThemeToggle = ({
  isLightMode,
  toggle,
}: {
  isLightMode: boolean;
  toggle: () => void;
}) => {
  return (
    <button
      onClick={toggle}
      className={`pointer-events-auto group relative flex h-14 w-14 items-center justify-center border-[3px] transition-all duration-300 hover:scale-105 active:scale-95 ${
        isLightMode
          ? "border-black bg-white shadow-[4px_4px_0_#000]"
          : "border-white bg-[#111] shadow-[4px_4px_0_#fff]"
      }`}
      aria-label="Toggle theme"
    >
      <div
        className={`relative h-8 w-8 transition-transform duration-500 ${isLightMode ? "rotate-0" : "rotate-[360deg]"}`}
      >
        {isLightMode ? (
          /* Sun Icon for Light Mode */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full text-[#ff00a0]"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* Moon Icon for Dark Mode */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full text-[#c0ff00]"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default function Home() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isModeAnimating, setIsModeAnimating] = useState(false);
  const hasMountedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Phase 1: Intro (HACKX 2.0 reveal)
  const introOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);

  // Phase 2: Mission (Driving Digital Bharat)
  const missionOpacity = useTransform(
    scrollYProgress,
    [0.25, 0.35, 0.55, 0.65],
    [0, 1, 1, 0],
  );
  const missionY = useTransform(
    scrollYProgress,
    [0.25, 0.35, 0.55, 0.65],
    [30, 0, 0, -30],
  );

  // Phase 3: Pillars (Highlights)
  const pillarsOpacity = useTransform(
    scrollYProgress,
    [0.75, 0.85, 0.95, 1],
    [0, 1, 1, 1],
  );
  const pillarsY = useTransform(scrollYProgress, [0.75, 0.85], [30, 0]);

  // The original useEffect for isModeAnimating is removed as per instructions.

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {/* Grid Pattern Background - Keeping this for texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Wave Tiles Background - Design Uniformity with Sponsors */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <WaveTiles
          className={isLightMode ? "opacity-40" : "opacity-30"}
          onModeChange={setIsLightMode}
          // optimizeForPerformance={true}
          // trackPointerGlobally={true}
        />
      </div>

      {/* Floating Canvas Sequence Layer */}
      <div className="absolute top-0 left-0 w-full z-0">
        <ScrollSequence
          frameCount={192}
          padLength={3}
          fileExtension=".png"
          filePrefix="frame-"
          isLightMode={isLightMode}
          height="h-[600vh]"
        />
        {/* Soft bottom blend mask to merge video to solid body section smoothly */}
        <div
          className={`absolute bottom-0 left-0 w-full h-[50vh] bg-linear-to-t ${isLightMode ? "from-[#f5f5f5] to-transparent" : "from-black to-transparent"} z-10`}
        />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20">
        <div className="absolute top-[25%] -left-[10vw] flex whitespace-nowrap animate-[marquee_40s_linear_infinite]">
          <span
            className={`text-[25vw] font-black uppercase tracking-tighter ${isLightMode ? "text-outline-2 text-outline-light" : "text-outline-dark"}`}
          >
            HACKX 2.0 HACKX 2.0 HACKX 2.0 HACKX 2.0
          </span>
        </div>
        <div className="absolute bottom-[10%] -left-[20vw] flex whitespace-nowrap animate-[marquee_35s_linear_infinite_reverse]">
          <span className={`text-[15vw] font-black uppercase tracking-tighter`}>
            BUILD THE FUTURE BUILD THE FUTURE BUILD THE FUTURE
          </span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="pointer-events-none relative z-50 flex w-full items-center justify-between px-6 py-6 sm:px-12 bg-transparent">
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className={`pointer-events-auto flex h-14 w-14 items-center justify-center border-[3px] text-2xl font-black uppercase tracking-tighter transition-colors duration-500 hover:rotate-12 hover:scale-110 ${isLightMode ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000]" : "border-white bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff]"}`}
            >
              HX
            </div>
            {/* Mobile Theme Toggle */}
            <div className="sm:hidden">
              <ThemeToggle
                isLightMode={isLightMode}
                toggle={() => setIsLightMode(!isLightMode)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div
              className={`pointer-events-auto hidden items-center border-[3px] px-8 py-3 text-sm font-bold uppercase tracking-widest sm:flex gap-8 transition-colors duration-500 ${isLightMode ? "border-black bg-white shadow-[6px_6px_0_#000] text-black" : "border-white/30 bg-black/60 shadow-[6px_6px_0_rgba(255,255,255,0.3)] text-white"}`}
            >
              <Link href="/" className="hover:text-[#ff00a0] transition-colors">
                Home
              </Link>
              <Link
                href="/about"
                className="hover:text-[#ff00a0] transition-colors"
              >
                About
              </Link>
              <Link
                href="/schedule"
                className="hover:text-[#ff00a0] transition-colors"
              >
                Schedule
              </Link>
              <Link
                href="/sponsors"
                className="hover:text-[#ff00a0] transition-colors"
              >
                Sponsors
              </Link>
              <Link
                href="/contact"
                className="hover:text-[#ff00a0] transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Desktop Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle
                isLightMode={isLightMode}
                toggle={() => setIsLightMode(!isLightMode)}
              />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-20 flex w-full flex-1 flex-col">
          {/* Height matched to the length of the sticky ScrollSequence to keep layout linear */}
          <div
            ref={scrollContainerRef}
            className="h-[600vh] w-full relative z-20 pointer-events-auto"
          >
            {/* Sticky pin wrap so text stays fixed while scrolling the background frames */}
            <div className="sticky top-0 h-[calc(100vh-150px)] w-full flex flex-col overflow-hidden">
              <div className="relative w-full mx-auto flex-1 flex flex-col justify-between px-6 sm:px-12 pointer-events-none">
                {/* GIANT BACKGROUND TITLE */}
                <motion.div
                  style={{ opacity: introOpacity, y: introY }}
                  className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center flex flex-col items-center justify-center pointer-events-none z-0"
                >
                  <h1 className="font-black text-[clamp(4rem,16vw,200px)] leading-[0.85] tracking-tighter opacity-90 mix-blend-overlay">
                    <span className={`text-[#ff00a0]`}>HACKX</span>
                    <span
                      className="text-transparent ml-4 sm:ml-8"
                      style={{ WebkitTextStroke: "3px white" }}
                    >
                      2.0
                    </span>
                  </h1>
                </motion.div>

                {/* Floating Badges */}
                <motion.div style={{ opacity: introOpacity }}>
                  <FloatingBadge
                    isLightMode={isLightMode}
                    styleName="pointer-events-none absolute left-[2%] top-[45%] hidden md:flex"
                    delay={0.5}
                    floatRev
                  >
                    <div className="flex flex-col gap-1 text-[10px] sm:text-[12px] font-mono font-bold leading-none">
                      <span style={{ color: "#ff00a0" }}>import</span>
                      <span style={{ color: isLightMode ? "#000" : "#fff" }}>
                        {"{"} future {"}"}
                      </span>
                      <span style={{ color: isLightMode ? "#000" : "#fff" }}>
                        from <span style={{ color: "#c0ff00" }}>'now';</span>
                      </span>
                    </div>
                  </FloatingBadge>

                  <FloatingBadge
                    isLightMode={isLightMode}
                    styleName="pointer-events-none absolute right-[2%] top-[35%] hidden md:flex"
                    delay={1.2}
                  >
                    <span
                      className="text-2xl sm:text-3xl font-black text-white"
                      style={{ WebkitTextStroke: "2px white" }}
                    >
                      {"< />"}
                    </span>
                  </FloatingBadge>

                  <FloatingBadge
                    isLightMode={isLightMode}
                    styleName="pointer-events-none absolute left-[10%] top-[10%] hidden lg:flex rounded-full"
                    delay={0.8}
                  >
                    <span className="text-xl sm:text-2xl drop-shadow-[2px_2px_0_#ff00a0]">
                      ✨
                    </span>
                  </FloatingBadge>
                </motion.div>

                {/* NARRATIVE PHASE 1: BRAND INTRO */}
                <motion.div
                  style={{ opacity: introOpacity, y: introY }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="relative z-10 w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-36">
                    <div
                      className={`inline-block border-[3px] px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-transform hover:scale-105 ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[4px_4px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[4px_4px_0_#fff]"}`}
                    >
                      CSI & GDG SFIT PRESENTS
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-60">
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
                        className={`inline-block w-max font-black uppercase tracking-widest text-xs sm:text-sm whitespace-nowrap border-[3px] px-4 py-2 ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#c0ff00]"}`}
                      >
                        — CODE FOR BHARAT 5.0 —
                      </div>
                      <p
                        className={`text-sm sm:text-base font-bold leading-relaxed tracking-wide ${isLightMode ? "text-black p-4 sm:p-5 border-[3px] border-black bg-white/70 backdrop-blur-md shadow-[4px_4px_0_#000]" : "text-white p-4 sm:p-5 border-[3px] border-white/30 bg-black/50 backdrop-blur-md shadow-[4px_4px_0_#fff]"}`}
                      >
                        A national-level 24-hour student hackathon hosted at St.
                        Francis Institute of Technology, Mumbai. Join 10,000+
                        top developers, designers, and innovators shaping the
                        future of India's digital infrastructure.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pointer-events-auto">
                      <Link
                        href="/register"
                        className="cursor-target group relative inline-flex items-center justify-center px-6 py-4 sm:px-8 sm:py-5 font-black uppercase tracking-widest text-white transition-all hover:-translate-y-1 w-full sm:w-auto"
                      >
                        <div
                          className={`absolute inset-0 border-[3px] transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 ${isLightMode ? "bg-[#ff00a0] border-black" : "bg-[#c0ff00] border-white"}`}
                        />
                        <div
                          className={`absolute inset-0 border-[3px] -z-10 translate-x-2 translate-y-2 ${isLightMode ? "border-black bg-black" : "border-white bg-white"}`}
                        />
                        <span className="relative z-10 mix-blend-normal!">
                          REGISTER NOW
                        </span>
                      </Link>
                      <Link
                        href="#about"
                        className="cursor-target group relative inline-flex items-center justify-center px-6 py-4 sm:px-8 sm:py-5 font-black uppercase tracking-widest transition-all hover:-translate-y-1 w-full sm:w-auto"
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
                  style={{ opacity: missionOpacity, y: missionY }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="max-w-4xl text-center px-6">
                    <h2
                      className={`font-black uppercase tracking-tighter text-4xl sm:text-7xl mb-8 ${isLightMode ? "text-black" : "text-white"}`}
                    >
                      Driving Digital{" "}
                      <span className="text-[#ff00a0]">Bharat</span>
                    </h2>
                    <div
                      className={`mx-auto h-2 w-32 mb-12 ${isLightMode ? "bg-black" : "bg-[#c0ff00]"}`}
                    />
                    <p
                      className={`text-xl sm:text-3xl font-black leading-tight tracking-tight uppercase ${isLightMode ? "text-black/80" : "text-white/90"}`}
                    >
                      Over an intense 24-hour experience, we build the bridges
                      between{" "}
                      <span className="underline decoration-[#00f0ff] decoration-4">
                        bold ideas
                      </span>{" "}
                      and{" "}
                      <span className="underline decoration-[#ff00a0] decoration-4">
                        impactful reality.
                      </span>
                    </p>
                  </div>
                </motion.div>

                {/* NARRATIVE PHASE 3: THE POWER (Highlights) */}
                <motion.div
                  style={{ opacity: pillarsOpacity, y: pillarsY }}
                  className="absolute inset-0 flex flex-col justify-between pt-32 pb-16 px-6 pointer-events-none"
                >
                  <div className="text-center mb-auto">
                    <h2
                      className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
                    >
                      Event Highlights
                    </h2>
                    <p
                      className={`mt-4 text-sm sm:text-base font-bold uppercase tracking-widest ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
                    >
                      Scale • Mentorship • Prizes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-auto pointer-events-auto max-w-7xl mx-auto w-full px-4">
                    <HighlightCard
                      title="Scale"
                      description="Connect with 10,000+ participants and builders across India."
                      icon="🌐"
                      color="#c0ff00"
                      isLightMode={isLightMode}
                      delay={0}
                    />
                    <HighlightCard
                      title="Mentorship"
                      description="Gain insights directly from industry leaders and experts."
                      icon="⚡"
                      color="#00f0ff"
                      isLightMode={isLightMode}
                      delay={0.2}
                    />
                    <HighlightCard
                      title="Prizes"
                      description="Compete for a massive ₹1.5 lakh prize pool and bounties."
                      icon="🏆"
                      color="#ff00a0"
                      isLightMode={isLightMode}
                      delay={0.4}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-20">
            <div className="pb-10 relative z-20">
              {/* Note: Event Highlights and About sections moved into Scrollytelling above */}

              {/* TRACKS/BIOMES SECTION */}
              <div className="mt-40 relative z-20 pointer-events-auto">
                <h2
                  className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
                >
                  The Domains
                </h2>
                <p
                  className={`mt-6 text-sm sm:text-base font-bold uppercase tracking-widest ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
                >
                  Explore critical pillars of the future and build your legacy.
                </p>

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { name: "Cyber Defence", color: "#ff00a0", icon: "🛡️" },
                    { name: "FinTech", color: "#c0ff00", icon: "💸" },
                    { name: "Smart Cities", color: "#00f0ff", icon: "🏙️" },
                    { name: "Future Mobility", color: "#ff00a0", icon: "🚀" },
                  ].map((track, i) => (
                    <div
                      key={i}
                      className={`cursor-target group relative flex flex-col items-center justify-center p-8 transition-transform duration-500 hover:-translate-y-2 ${
                        isLightMode
                          ? "border-[3px] border-black bg-white shadow-[6px_6px_0_#000]"
                          : "border-[3px] border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                      }`}
                    >
                      <div
                        className="absolute inset-0 z-0 origin-bottom scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100"
                        style={{ backgroundColor: track.color }}
                      />
                      <div className="relative z-10 text-4xl mb-4 transform transition-transform group-hover:scale-125 group-hover:rotate-12">
                        {track.icon}
                      </div>
                      <h3
                        className={`relative z-10 text-lg font-black uppercase tracking-widest transition-colors duration-300 ${
                          isLightMode ? "text-black" : "text-white"
                        } group-hover:text-black`}
                      >
                        {track.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIMELINE SECTION */}
              <div className="mt-40 text-left w-full mx-auto relative z-20 pointer-events-auto pb-10">
                <h2
                  className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl text-center ${isLightMode ? "text-black" : "text-white"}`}
                >
                  Timeline
                </h2>

                <div className="mt-16 flex flex-col gap-8 max-w-4xl mx-auto">
                  {[
                    {
                      date: "March 2026",
                      title: "Registrations Open",
                      desc: "Form your team and secure your spot.",
                    },
                    {
                      date: "18th Apr 2026",
                      title: "Hacking Begins",
                      desc: "Check-in, opening ceremony, and the 24-hr countdown starts.",
                    },
                    {
                      date: "18th Apr 2026",
                      title: "Midnight Mentorship",
                      desc: "Expert round-tables and technical workshops.",
                    },
                    {
                      date: "19th Apr 2026",
                      title: "Hacking Concludes",
                      desc: "Final submissions and code freeze.",
                    },
                    {
                      date: "19th Apr 2026",
                      title: "Closing Ceremony",
                      desc: "Judging, top finalist pitches, and the ₹1.5 Lakh prize distribution.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`cursor-target flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 border-[3px] transition-transform duration-300 hover:-translate-y-1 ${
                        isLightMode
                          ? "border-black bg-white shadow-[4px_4px_0_#000] hover:shadow-[8px_8px_0_#000]"
                          : "border-white/30 bg-[#111] shadow-[4px_4px_0_#fff] hover:shadow-[8px_8px_0_#ff00a0]"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 font-black uppercase tracking-wider whitespace-nowrap text-sm border-[3px] ${
                          isLightMode
                            ? "border-black bg-[#ff00a0] text-white"
                            : "border-white bg-[#ff00a0] text-white"
                        }`}
                      >
                        {item.date}
                      </div>
                      <div>
                        <h4
                          className={`text-xl font-black uppercase tracking-wide ${isLightMode ? "text-black" : "text-white"}`}
                        >
                          {item.title}
                        </h4>
                        <p
                          className={`mt-1 font-bold ${isLightMode ? "text-black/60" : "text-white/60"}`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRIZES SECTION */}
              <div className="mt-40 text-center w-full mx-auto relative z-20 pointer-events-auto">
                <h2
                  className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
                >
                  The Loot
                </h2>
                <p
                  className={`mt-6 text-sm sm:text-base font-bold uppercase tracking-widest ${isLightMode ? "text-[#00f0ff]" : "text-[#00f0ff]"}`}
                >
                  ₹1.5 LAKH PRIZE POOL
                </p>

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    {
                      place: "2nd Runner Up",
                      amount: "₹25,000",
                      color: "#c0ff00",
                    },
                    { place: "Winner", amount: "₹75,000", color: "#ff00a0" },
                    {
                      place: "1st Runner Up",
                      amount: "₹50,000",
                      color: "#00f0ff",
                    },
                  ].map((prize, idx) => (
                    <div
                      key={idx}
                      className={`cursor-target p-8 sm:p-12 flex flex-col items-center justify-center border-[3px] transition-transform hover:-translate-y-2 duration-300 ${
                        idx === 1 ? "sm:-mt-8 mb-8 sm:mb-0 scale-105" : "" // Push the winner up slightly
                      } ${
                        isLightMode
                          ? "border-black bg-white shadow-[8px_8px_0_#000]"
                          : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
                      }`}
                    >
                      <span className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
                        {prize.place}
                      </span>
                      <span
                        className="text-4xl sm:text-5xl font-black tracking-tighter"
                        style={{ color: prize.color }}
                      >
                        {prize.amount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Additional track prizes */}
                <div
                  className={`mt-8 p-6 border-[3px] flex flex-col sm:flex-row items-center justify-between gap-4 font-bold ${isLightMode ? "border-black bg-black text-[#c0ff00]" : "border-white bg-[#c0ff00] text-black"}`}
                >
                  <span>
                    + EXCLUSIVE TRACK PRIZES, SWAGS, & GOODIES FOR ALL
                  </span>
                  <span className="text-2xl font-black">🎁</span>
                </div>
              </div>

              {/* RESOURCES & TEAM SECTION */}
              <div className="mt-40 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full relative z-20 pointer-events-auto">
                <div
                  className={`p-8 border-[3px] ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}
                >
                  <h3
                    className={`text-3xl font-black uppercase tracking-tighter mb-8 ${isLightMode ? "text-black" : "text-white"}`}
                  >
                    Hacker Toolkit
                  </h3>
                  <div className="flex flex-col gap-4">
                    <a
                      href="#"
                      className={`cursor-target flex items-center justify-between p-4 border-[3px] font-black uppercase tracking-wider transition-colors ${isLightMode ? "border-black hover:bg-[#c0ff00]" : "border-white/30 hover:bg-[#c0ff00] hover:text-black hover:border-[#c0ff00] text-white"}`}
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
                  className={`p-8 border-[3px] ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[8px_8px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[8px_8px_0_#fff]"}`}
                >
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">
                    The Organizers
                  </h3>
                  <p className="font-bold mb-8 opacity-90">
                    Powered by CSI SFIT and GDG SFIT.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "Ananya",
                      "Brijesh",
                      "Shobhit",
                      "Harsh",
                      "Rushit",
                      "Pallavi",
                    ].map((name, i) => (
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

              {/* SPONSORS SECTION */}
              <div className="mt-40 text-center w-full mx-auto relative z-20 pointer-events-auto">
                <h2
                  className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
                >
                  Our Partners
                </h2>
                <p
                  className={`mt-6 text-sm sm:text-base font-bold uppercase tracking-widest ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
                >
                  Supported by the best in the industry.
                </p>

                <div className="mt-16 flex flex-wrap justify-center gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`cursor-target w-40 h-24 sm:w-56 sm:h-32 flex items-center justify-center border-[3px] transition-transform hover:scale-105 duration-300 ${
                        isLightMode
                          ? "border-black bg-white shadow-[6px_6px_0_#000]"
                          : "border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                      }`}
                    >
                      <span
                        className={`font-black text-xl tracking-widest opacity-50 ${isLightMode ? "text-black" : "text-white"}`}
                      >
                        SPONSOR {i}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ SECTION */}
              <div className="mt-40 text-left w-full mx-auto max-w-4xl relative z-20 pointer-events-auto pb-10">
                <h2
                  className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl text-center mb-16 ${isLightMode ? "text-black" : "text-white"}`}
                >
                  FAQ
                </h2>

                <div className="flex flex-col gap-6">
                  {[
                    {
                      q: "What is HackX 2.0?",
                      a: "HackX 2.0 is a 24-hour national-level hackathon aimed at solving real-world challenges to shape the future of Digital Bharat. It brings together over 10,000 developers, designers, and innovators.",
                    },
                    {
                      q: "Who can participate?",
                      a: "Any student enrolled in a recognized university or college can participate. Whether you are a first-year student or a final-year expert, you are welcome to build with us!",
                    },
                    {
                      q: "What is the team size?",
                      a: "Teams can have 2 to 4 members. You can either form a team beforehand or find teammates during the registration phase.",
                    },
                    {
                      q: "Is there a registration fee?",
                      a: "Details regarding the registration fee and process are updated on the registration portal. Check out the portal for the most recent timeline and fees!",
                    },
                    {
                      q: "Will the problem statements be given in advance?",
                      a: "The broad domains (Cyber Defence, FinTech, Smart Cities, Future Mobility) are known, but the exact problem statements are revealed during the opening ceremony to maintain equal footing.",
                    },
                  ].map((faq, i) => (
                    <details
                      key={i}
                      className={`cursor-target group border-[3px] [&_summary::-webkit-details-marker]:hidden ${
                        isLightMode
                          ? "border-black bg-white shadow-[4px_4px_0_#000]"
                          : "border-white/30 bg-[#111] shadow-[4px_4px_0_#fff]"
                      }`}
                    >
                      <summary
                        className={`flex cursor-pointer items-center justify-between p-6 font-black uppercase tracking-wide text-lg sm:text-xl focus:outline-none ${isLightMode ? "text-black" : "text-white"}`}
                      >
                        {faq.q}
                        <span
                          className={`ml-4 text-2xl transition-transform duration-300 group-open:rotate-45 ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
                        >
                          +
                        </span>
                      </summary>
                      <div
                        className={`px-6 pb-6 font-bold leading-relaxed border-t-[3px] mt-2 pt-4 ${isLightMode ? "text-black/80 border-black/10" : "text-white/80 border-white/10"}`}
                      >
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Countdown */}
              <div
                className={`pointer-events-auto relative px-8 py-10 sm:py-14 text-center mx-auto max-w-4xl mt-32 border-[3px] ${isLightMode ? "border-black bg-[#c0ff00] shadow-[12px_12px_0_#000]" : "border-white/30 bg-[#c0ff00] shadow-[12px_12px_0_#fff]"}`}
              >
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-black">
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
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="relative z-50 pointer-events-auto w-full border-t-[3px] py-12 px-6 sm:px-12 mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-500 border-black/20 bg-black/5 backdrop-blur-sm">
          <div
            className={`text-2xl font-black uppercase tracking-tighter ${isLightMode ? "text-black" : "text-white"}`}
          >
            HACKX <span className="text-[#ff00a0]">2.0</span>
          </div>
          <div
            className={`text-sm font-bold uppercase tracking-widest ${isLightMode ? "text-black/60" : "text-white/60"}`}
          >
            By CSI and GDG at SFIT • 2026
          </div>
        </footer>
      </div>
    </div>
  );
}
