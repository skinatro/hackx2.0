"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useTheme } from "@/app/providers/theme-provider";

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

export default function Home() {
  const { isLightMode, setWaveTilesOpacity } = useTheme();

  useEffect(() => setWaveTilesOpacity("opacity-75", "opacity-30"), [setWaveTilesOpacity]);

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${isLightMode ? "bg-[#f4f0ea]" : "bg-[#0a0a0a]"}`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        className={`fixed inset-0 z-0 opacity-50 ${isLightMode ? "bg-grid-light" : "bg-grid-dark"}`}
      />

      {/* Pop-art geometric background shapes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60">
        <div
          className={`absolute top-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full border-16 ${isLightMode ? "border-black opacity-10" : "border-[#ff00a0] opacity-20"} animate-[float_12s_ease-in-out_infinite]`}
        ></div>
        <div
          className={`absolute bottom-[5%] left-[-5%] w-[30vw] h-[30vw] border-16 ${isLightMode ? "border-black opacity-10" : "border-[#00f0ff] opacity-20"} rotate-12 animate-[float-reverse_15s_ease-in-out_infinite]`}
        ></div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20">
        <div className="absolute top-[25%] -left-[10vw] flex whitespace-nowrap animate-[marquee_40s_linear_infinite]">
          <span
            className={`text-[25vw] font-black uppercase tracking-tighter ${isLightMode ? "text-outline-light" : "text-outline-dark"}`}
          >
            HACKX 2.0 HACKX 2.0 HACKX 2.0 HACKX 2.0
          </span>
        </div>
        <div className="absolute bottom-[10%] -left-[20vw] flex whitespace-nowrap animate-[marquee_35s_linear_infinite_reverse]">
          <span
            className={`text-[15vw] font-black uppercase tracking-tighter `}
          >
            BUILD THE FUTURE BUILD THE FUTURE BUILD THE FUTURE
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col overflow-y-auto overflow-x-hidden">
        {/* Main Content */}
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative pt-12 sm:pt-16 flex flex-col items-center sm:items-start text-center sm:text-left z-20">
            {/* Floating glass elements */}
            <FloatingBadge
              isLightMode={isLightMode}
              styleName="pointer-events-none left-[2%] top-[-10%] hidden lg:flex"
              delay={0.5}
              floatRev
            >
              <div className="flex flex-col gap-1 text-[12px] font-mono font-bold leading-none">
                <span style={{ color: isLightMode ? "#ff00a0" : "#ff00a0" }}>
                  import
                </span>
                <span style={{ color: isLightMode ? "#000" : "#fff" }}>
                  {"{"} future {"}"}
                </span>
                <span style={{ color: isLightMode ? "#000" : "#fff" }}>
                  from <span style={{ color: "#c0ff00" }}>{"'now';"}</span>
                </span>
              </div>
            </FloatingBadge>

            <FloatingBadge
              isLightMode={isLightMode}
              styleName="pointer-events-none right-[2%] top-[5%] hidden lg:flex"
              delay={1.2}
            >
              <span
                className={`text-3xl font-black ${isLightMode ? "text-outline-light" : "text-outline-dark"}`}
                style={{
                  WebkitTextStroke: isLightMode ? "2px black" : "2px white",
                }}
              >
                {"< />"}
              </span>
            </FloatingBadge>

            <FloatingBadge
              isLightMode={isLightMode}
              styleName="pointer-events-none left-[35%] top-[50%] hidden lg:flex rounded-full"
              delay={0.8}
            >
              <span className="text-2xl drop-shadow-[2px_2px_0_#ff00a0]">
                ✨
              </span>
            </FloatingBadge>

            <FloatingBadge
              isLightMode={isLightMode}
              styleName="pointer-events-none right-[5%] top-[70%] hidden lg:flex"
              delay={1.5}
              floatRev
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#00f0ff] animate-pulse"></div>
                <span
                  className={`text-[10px] font-black tracking-[0.2em] ${isLightMode ? "text-black" : "text-white"}`}
                >
                  STATUS: LIVE
                </span>
              </div>
            </FloatingBadge>

            {/* Hero Text */}
            <div
              className={`relative z-10 lg:ml-8 inline-block border-[3px] px-6 py-2 text-xs font-black uppercase tracking-[0.3em] transition-transform hover:scale-105 ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[4px_4px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[4px_4px_0_#fff]"}`}
            >
              CSI & GDG SFIT PRESENTS
            </div>

            <h1 className="relative z-10 lg:ml-8 mt-6 font-black text-[18vw] sm:text-[100px] md:text-[140px] lg:text-[160px] uppercase leading-[0.8] tracking-tighter">
              <span
                className={`block ${isLightMode ? "text-black" : "text-white"}`}
              >
                HACKX
              </span>
              <span
                className={`block sm:ml-12 ${isLightMode ? "text-outline-light drop-shadow-[8px_8px_0_#c0ff00]" : "text-outline-dark drop-shadow-[8px_8px_0_#00f0ff]"}`}
              >
                <span
                  className="text-[#ff00a0]"
                  style={{ WebkitTextStroke: "0px" }}
                >
                  2.0
                </span>
              </span>
            </h1>

            <div
              className={`relative z-10 lg:ml-8 mt-10 inline-block font-black uppercase tracking-widest text-sm sm:text-xl lg:text-2xl whitespace-nowrap border-[3px] px-4 py-2 sm:px-6 sm:py-3 ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#c0ff00]"}`}
            >
              — CODE FOR BHARAT 5.0 —
            </div>

            <p
              className={`relative z-10 lg:ml-8 mt-8 max-w-2xl text-base sm:text-lg lg:text-xl font-bold leading-relaxed tracking-wide ${isLightMode ? "text-black/80" : "text-white/80"}`}
            >
              A national-level 24-hour student hackathon hosted at St. Francis
              Institute of Technology, Mumbai. Join 10,000+ top developers,
              designers, and innovators shaping the future of India&apos;s digital
              infrastructure.
            </p>

            {/* Action Buttons */}
            <div className="pointer-events-auto lg:ml-8 relative z-20 mt-12 flex flex-wrap items-center justify-center gap-6 sm:justify-start">
              <Link
                href="/register"
                className="cursor-target group relative inline-flex items-center justify-center px-10 py-5 font-black uppercase tracking-widest text-white transition-all hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 border-[3px] transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 ${isLightMode ? "bg-[#ff00a0] border-black" : "bg-[#c0ff00] border-white"}`}
                />
                <div
                  className={`absolute inset-0 border-[3px] -z-10 translate-x-2 translate-y-2 ${isLightMode ? "border-black bg-black" : "border-white bg-white"}`}
                />
                <span
                  className={`relative z-10 text-base sm:text-lg ${isLightMode ? "text-white" : "text-black group-hover:text-black"}`}
                >
                  Register Now
                </span>
              </Link>

              <Link
                href="/about"
                className={`cursor-target group flex items-center gap-4 border-[3px] px-8 py-5 text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-1 hover:bg-black hover:text-white ${isLightMode ? "border-black bg-white text-black shadow-[6px_6px_0_#000]" : "border-white bg-black text-white shadow-[6px_6px_0_#fff]"}`}
              >
                Learn More{" "}
                <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-40 text-center pb-20 relative z-20">
            <h2
              className={`font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
            >
              Event Highlights
            </h2>
            <p
              className={`mt-6 text-sm sm:text-base font-bold uppercase tracking-widest ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
            >
              Collaborate, code, and compete for amazing prizes.
            </p>

            <div className="pointer-events-auto mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <HighlightCard
                title="Scale"
                description="Connect with 10,000+ participants, builders, industry experts, and founders across India."
                icon="🌐"
                color="#c0ff00"
                isLightMode={isLightMode}
                delay={0}
              />
              <HighlightCard
                title="Mentorship"
                description="Gain insights directly from industry leaders and expert competitive selection panels."
                icon="⚡"
                color="#00f0ff"
                isLightMode={isLightMode}
                delay={0.2}
              />
              <HighlightCard
                title="Prizes"
                description="Compete for a massive ₹1.5 lakh prize pool, bounties, credits, and potential investments."
                icon="🏆"
                color="#ff00a0"
                isLightMode={isLightMode}
                delay={0.4}
              />
            </div>

            {/* ABOUT SECTION  */}
            <div className="mt-40 pt-10 pb-10 text-left w-full mx-auto relative z-20 pointer-events-auto cursor-target group">
              <div
                className={`p-10 sm:p-16 border-[3px] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[12px_12px_0_#00f0ff] ${
                  isLightMode
                    ? "border-black bg-white shadow-[12px_12px_0_#000]"
                    : "border-white/30 bg-[#111] shadow-[12px_12px_0_#fff]"
                }`}
              >
                <h2
                  className={`font-black uppercase tracking-tighter text-4xl sm:text-6xl ${
                    isLightMode ? "text-black" : "text-white"
                  }`}
                >
                  Driving Digital Bharat
                </h2>
                <div
                  className={`mt-2 h-2 w-24 ${
                    isLightMode ? "bg-[#ff00a0]" : "bg-[#c0ff00]"
                  }`}
                ></div>
                <p
                  className={`mt-8 text-lg sm:text-xl font-bold leading-relaxed tracking-wide ${
                    isLightMode ? "text-black/80" : "text-white/80"
                  }`}
                >
                  Over an intense 24-hour hacking experience, participants will
                  work in teams to develop impactful solutions that matter. With
                  a ₹1.5 lakh prize pool, mentorship from industry experts, and
                  a rigorous competitive selection process leading to the top
                  finalist teams, HackX 2.0 aims to become one of the largest
                  student-led hackathons in all of Maharashtra. Our goal?
                  Providing a platform for bold ideas, fearless innovation, and
                  collaboration—empowering the next generation of builders to
                  create technology that propels Digital Bharat forward.
                </p>
              </div>
            </div>

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
        </main>

      </div>
    </div>
  );
}
