"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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
`;

type Track = {
  name: string;
  color: string;
  icon: React.ReactNode;
  desc: string;
  example: string;
  problem: string;
  context: string;
  solution: string;
  deliverables: string[];
};

const buildTracks = (): Track[] => [
  {
    name: "Cyber Defence & Digital Trust",
    color: "#ff00a0",
    icon: <ShieldIcon className="h-full w-full" />,
    desc: "Build systems that protect critical infrastructure and user data from evolving digital threats.",
    example:
      "Develop an AI-driven real-time threat detection system for identifying Zero-Day vulnerabilities.",
    problem:
      "As enterprise cloud environments scale, traditional rule-based security systems fail to detect sophisticated 'Zero-Day' exploits that have no known signatures. This leaves critical data exposed for hours or days before a patch is issued.",
    context:
      "Digital Bharat's rapid cloud adoption means that government and financial infrastructure are now prime targets for state-sponsored and independent cyber-terrorists using AI to generate novel attack vectors.",
    solution:
      "An autonomous security engine that uses behavioral heuristics and anomalous pattern recognition to flag suspicious activity in real-time, even if the attack type is completely new.",
    deliverables: [
      "Real-time Monitoring Dashboard",
      "AI Model Analysis Report",
      "Automated Response Protocol",
    ],
  },
  {
    name: "FinTech & Digital Economy",
    color: "#c0ff00",
    icon: <FinTechIcon className="h-full w-full" />,
    desc: "Innovate in the realm of digital payments, decentralized finance, and accessible banking solutions.",
    example:
      "Create a decentralized P2P lending platform with localized credit-scoring.",
    problem:
      "Millions of small business owners in rural India are excluded from the formal credit system because they lack traditional collateral or a standardized credit history, forcing them into high-interest predatory lending.",
    context:
      "While UPI has revolutionized payments, the credit side of FinTech remains centralized. There is a massive opportunity to use community-verified trust and transaction data for decentralized lending.",
    solution:
      "A blockchain-based P2P platform that leverages UPI transaction history and AI-driven social graph analysis to provide fair micro-loans with low interest rates.",
    deliverables: [
      "Transparent Smart Contracts",
      "Lending App Prototype",
      "Credit Scoring Algorithm Demo",
    ],
  },
  {
    name: "InfraTech",
    color: "#00f0ff",
    icon: <CityIcon className="h-full w-full" />,
    desc: "Create technology to optimize urban living, from waste management to smart lighting and energy.",
    example: "Design an IoT-based intelligent traffic management system.",
    problem:
      "Urban peak-hour congestion costs the Indian economy billions in lost productivity and fuel. Existing traffic light systems are static and do not adapt to real-time fluctuations in vehicle flow.",
    context:
      "Smart Cities require dynamic infrastructure. With the rollout of 5G and ubiquitous camera sensor networks, we now have the data to manage traffic fluidly rather than through fixed timers.",
    solution:
      "An IoT network that synchronizes traffic signals across a grid using real-time density mapping and predictive AI to minimize wait times and CO2 emissions.",
    deliverables: [
      "Mesh Sensor Network Simulation",
      "Optimization Dashboard",
      "Hardware Design Prototype",
    ],
  },
  {
    name: "Future of Mobility & Transportation",
    color: "#ff00a0",
    icon: <MobilityIcon className="h-full w-full" />,
    desc: "Design the next generation of transportation, focusing on efficiency, sustainability, and connectivity.",
    example:
      "Build an EV-fleet optimization engine that predicts charging demand.",
    problem:
      "The transition to Electric Vehicles is hampered by 'range anxiety' and inefficient charging infrastructure. Fleet operators struggle to balance route efficiency with the availability of rapid-charging points.",
    context:
      "India's EV goal for 2030 requires a paradigm shift in logistics. We need smart systems that can orchestrate vehicle movement around a limited but growing network of chargers.",
    solution:
      "A predictive routing engine that manages large EV fleets by forecasting charging station demand and dynamically assigning vehicles to chargers based on battery health and route priority.",
    deliverables: [
      "Route Prediction Model",
      "Fleet Management UI",
      "Charging Station Load Analysis",
    ],
  },
];

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

export default function PSPage() {
  const { isLightMode } = useTheme();
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const tracks = useMemo(() => buildTracks(), []);

  useEffect(() => {
    if (activeTrack) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeTrack]);

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation */}

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
          <div className="text-left w-full mx-auto relative z-20 pointer-events-auto pb-10">
            <h2
              className={`text-center font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 ${isLightMode ? "text-black" : "text-white"}`}
            >
              The Domains
            </h2>
            <p
              className={`text-center font-black uppercase tracking-widest text-sm mb-16 px-4 py-2 border-[3px] mx-auto w-fit ${isLightMode ? "border-black bg-[#c0ff00] text-black" : "border-[#c0ff00] bg-black text-[#c0ff00]"}`}
            >
              Open Track Hackathon: Solve any problem within these domains or
              pitch your own initiative.
            </p>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "1600px",
              }}
            >
              {tracks.map((track, i) => (
                <div
                  key={i}
                  className={`cursor-target group relative flex flex-col p-10 transition-transform duration-500 hover:-translate-y-2 ${isLightMode
                      ? "border-[3px] border-black bg-white shadow-[8px_8px_0_#000]"
                      : "border-[3px] border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
                    }`}
                >
                  <div
                    className="absolute inset-0 z-0 origin-right scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    style={{ backgroundColor: track.color }}
                  />
                  <div
                    className={`relative z-10 h-16 w-16 mb-6 flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:-translate-y-2 ${isLightMode ? "text-black" : "text-white"} group-hover:text-black`}
                  >
                    {track.icon}
                  </div>
                  <h3
                    className={`relative z-10 text-3xl font-black uppercase tracking-widest transition-colors duration-300 ${isLightMode ? "text-black" : "text-white"
                      } group-hover:text-black`}
                  >
                    {track.name}
                  </h3>
                  <p
                    className={`relative z-10 mt-4 font-bold leading-relaxed transition-colors duration-300 ${isLightMode ? "text-black/70" : "text-white/70"} group-hover:text-black`}
                  >
                    {track.desc}
                  </p>
                  <div
                    className={`relative z-10 mt-8 p-4 border-l-4 transition-colors duration-300 ${isLightMode ? "border-black/20 bg-black/5" : "border-white/20 bg-white/5"} group-hover:border-black/40 group-hover:bg-black/10`}
                  >
                    <span
                      className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isLightMode ? "text-black/40" : "text-white/40"} group-hover:text-black/60`}
                    >
                      Sample Challenge
                    </span>
                    <p
                      className={`text-xs font-black leading-relaxed ${isLightMode ? "text-black" : "text-white"} group-hover:text-black`}
                    >
                      {track.example}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTrack(track)}
                    className={`relative z-10 mt-6 w-full py-4 text-xs font-black uppercase tracking-widest border-[3px] transition-all duration-300 ${isLightMode ? "border-black bg-black text-white hover:bg-white hover:text-black" : "border-white bg-white text-black hover:bg-black hover:text-white"}`}
                  >
                    View Sample Case →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        <AnimatePresence>
          {activeTrack && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-10 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveTrack(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 p-8 sm:p-12 shadow-[16px_16px_0_rgba(0,0,0,0.5)] ${isLightMode ? "bg-white border-black text-black" : "bg-[#111] border-white text-white"}`}
              >
                <button
                  onClick={() => setActiveTrack(null)}
                  className={`absolute top-6 right-6 h-12 w-12 flex items-center justify-center border-[3px] text-2xl font-black transition-all ${isLightMode ? "border-black bg-[#ff00a0] text-white hover:bg-black" : "border-white bg-[#c0ff00] text-black hover:bg-white"}`}
                >
                  ✕
                </button>

                <div className="flex items-center gap-6 mb-8">
                  <div
                    className="h-16 w-16"
                    style={{ color: activeTrack.color }}
                  >
                    {activeTrack.icon}
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
                    {activeTrack.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-10">
                    <section>
                      <span
                        className={`block text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-50`}
                      >
                        Example Problem Case
                      </span>
                      <p
                        className="text-xl font-bold leading-relaxed italic border-l-4 pl-6"
                        style={{ borderColor: activeTrack.color }}
                      >
                        {activeTrack.problem}
                      </p>
                    </section>

                    <section>
                      <span
                        className={`block text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-50`}
                      >
                        Domain Context
                      </span>
                      <p className="text-base font-bold leading-relaxed opacity-90">
                        {activeTrack.context}
                      </p>
                    </section>
                  </div>

                  <div className="flex flex-col gap-10">
                    <section>
                      <span
                        className={`block text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-50`}
                      >
                        Potential Approach
                      </span>
                      <p
                        className="text-base font-black leading-relaxed border-[3px] p-6 bg-black/5"
                        style={{
                          borderColor: isLightMode
                            ? "rgba(0,0,0,0.1)"
                            : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {activeTrack.solution}
                      </p>
                    </section>
                  </div>
                </div>

                <div className="mt-7 pt-4 border-t-[3px] border-black/10 flex justify-center">
                  <button
                    onClick={() => setActiveTrack(null)}
                    className={`px-12 py-5 font-black uppercase tracking-widest border-4 shadow-[8px_8px_0_rgba(0,0,0,0.2)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${isLightMode ? "border-black bg-[#c0ff00] text-black hover:bg-black hover:text-white" : "border-white bg-[#ff00a0] text-white hover:bg-white hover:text-black"}`}
                  >
                    Close Challenge
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
