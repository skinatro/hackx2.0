"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/providers/theme-provider";
import { motion, useScroll, useSpring } from "framer-motion";

/* ─── Styles ─────────────────────────────────────────────── */
const STYLES = `
  @keyframes rotateCube {
    from { transform: rotateX(-28deg) rotateY(0deg); }
    to   { transform: rotateX(-28deg) rotateY(360deg); }
  }
`;

type EventItem = {
  title: string;
  time: string;
  date: string;
  step: string;
  accent: string;
  sub?: string;
  highlight?: boolean;
};

const EVENTS: EventItem[] = [
  // Day 1
  { title: "Reporting", time: "08:00 AM", date: "April 18th", step: "01", accent: "#00f0ff" }, 
  { title: "Inauguration Ceremony", time: "09:00 AM", date: "April 18th", step: "02", accent: "#ffcf00" }, 
  { title: "Hackathon Begins", time: "10:00 AM", date: "April 18th", step: "03", accent: "#ff00a0", highlight: true },
  { title: "Round 1 {Idea Pitch}", sub: "Judges visit your table to validate your idea", time: "12:00 PM", date: "April 18th", step: "04", accent: "#c0ff00" },
  { title: "Mentoring Round", time: "03:00 PM", date: "April 18th", step: "05", accent: "#a000ff" }, 
  { title: "Round 2 {Mid Project Eval}", sub: "Progress assess issuing points", time: "07:00 PM", date: "April 18th", step: "06", accent: "#ff5e00" },
  // Day 2
  { title: "Reporting", time: "08:00 AM", date: "April 19th", step: "07", accent: "#00b8ff" }, 
  { title: "Round 3 Final Judging", sub: "Final presentation", time: "09:00 AM", date: "April 19th", step: "08", accent: "#ff3c00" }, 
  { title: "Prize Distribution", time: "10:00 AM", date: "April 19th", step: "09", accent: "#00ff40", highlight: true },
];

/* ─── 3-D Cube ────────────────────────────────────────────── */
const SZ = 48; // crisp size
const HALF = SZ / 2;

function Cube3D({
  accent,
  isLight,
  step,
  className
}: {
  accent: string;
  isLight: boolean;
  step: string;
  className?: string;
}) {
  const b = `2px solid ${isLight ? "#000" : "rgba(255,255,255,0.7)"}`;

  const face = (
    t: string,
    bg: string,
    extra?: React.CSSProperties
  ): React.CSSProperties => ({
    position: "absolute",
    width: SZ,
    height: SZ,
    transform: t,
    backfaceVisibility: "hidden",
    background: bg,
    border: b,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...extra,
  });

  return (
    <div className={className} style={{ width: SZ, height: SZ, perspective: 600 }}>
      <div
        style={{
          width: SZ,
          height: SZ,
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "rotateCube 10s linear infinite",
          boxShadow: `0 0 20px ${accent}80`,
        }}
      >
        <div
          style={face(`translateZ(${HALF}px)`, accent, {
            color: "#000",
            fontWeight: 900,
            fontSize: 16,
          })}
        >
          {step}
        </div>
        <div
          style={face(
            `rotateY(180deg) translateZ(${HALF}px)`,
            isLight ? "#fff" : "#222"
          )}
        />
        <div
          style={face(
            `rotateY(-90deg) translateZ(${HALF}px)`,
            accent
          )}
        />
        <div
          style={face(
            `rotateY(90deg) translateZ(${HALF}px)`,
            accent
          )}
        />
        <div
          style={face(
            `rotateX(90deg) translateZ(${HALF}px)`,
            accent
          )}
        />
        <div
          style={face(
            `rotateX(-90deg) translateZ(${HALF}px)`,
            isLight ? "#eee" : "#111"
          )}
        />
      </div>
    </div>
  );
}


export default function TimelinePage() {
  const { isLightMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridInnerRef = useRef<HTMLDivElement>(null);

  // Used to map cube centers
  const cubeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [svgPathD, setSvgPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updatePath() {
      const inner = gridInnerRef.current;
      if (!inner) return;

      const ir = inner.getBoundingClientRect();
      setSvgDimensions({ width: ir.width, height: ir.height });

      const pts = cubeRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: +(r.left + r.width / 2 - ir.left).toFixed(2),
          y: +(r.top + r.height / 2 - ir.top).toFixed(2),
        };
      }).filter((p): p is {x: number, y: number} => p !== null);

      if (pts.length > 0) {
        // Group points into rows based on vertical proximity
        let ptsByRow: {x: number, y: number}[][] = [];
        let currentRow: {x: number, y: number}[] = [];
        let lastY: number | null = null;

        pts.forEach((p) => {
          if (lastY === null || Math.abs(p.y - lastY) > 50) {
            if (currentRow.length > 0) ptsByRow.push(currentRow);
            currentRow = [p];
            lastY = p.y;
          } else {
            currentRow.push(p);
          }
        });
        if (currentRow.length > 0) ptsByRow.push(currentRow);

        let finalOrderPts: {x: number, y: number}[] = [];
        ptsByRow.forEach((row, rowIndex) => {
          row.sort((a, b) => a.x - b.x); // sort left-to-right
          if (rowIndex % 2 !== 0) {
            row.reverse(); // serpentine: odd rows go right-to-left
          }
          finalOrderPts.push(...row);
        });

        const radius = 30; // pixel radius for corners
        let path = `M ${finalOrderPts[0].x},${finalOrderPts[0].y}`;
        
        for (let i = 1; i < finalOrderPts.length; i++) {
          const pPrev = finalOrderPts[i - 1];
          const pCurr = finalOrderPts[i];
          const pNext = i + 1 < finalOrderPts.length ? finalOrderPts[i + 1] : null;

          if (pNext) {
              const dx1 = pCurr.x - pPrev.x;
              const dy1 = pCurr.y - pPrev.y;
              const dx2 = pNext.x - pCurr.x;
              const dy2 = pNext.y - pCurr.y;
              
              const isHorizontal1 = Math.abs(dx1) > Math.abs(dy1);
              const isHorizontal2 = Math.abs(dx2) > Math.abs(dy2);
              
              if (isHorizontal1 !== isHorizontal2) {
                  const len1 = Math.hypot(dx1, dy1);
                  const len2 = Math.hypot(dx2, dy2);
                  const r1 = Math.min(radius, len1 / 2.1);
                  const r2 = Math.min(radius, len2 / 2.1);
                  
                  const cx1 = pCurr.x - (dx1 / len1) * r1;
                  const cy1 = pCurr.y - (dy1 / len1) * r1;
                  const cx2 = pCurr.x + (dx2 / len2) * r2;
                  const cy2 = pCurr.y + (dy2 / len2) * r2;
                  
                  path += ` L ${cx1.toFixed(2)},${cy1.toFixed(2)}`;
                  path += ` Q ${pCurr.x.toFixed(2)},${pCurr.y.toFixed(2)} ${cx2.toFixed(2)},${cy2.toFixed(2)}`;
                  continue;
              }
          }
          path += ` L ${pCurr.x.toFixed(2)},${pCurr.y.toFixed(2)}`;
        }

        setSvgPathD(path);
      }
    }

    updatePath();
    window.addEventListener("resize", updatePath);
    // Extra timeout for rendering stability
    const timer = setTimeout(updatePath, 100);
    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timer);
    };
  }, []);

  // Framer motion scroll progress over the entire page block
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply spring physics so drawing feels smooth and snappy
  const drawProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const light = isLightMode;
  const textColor = light ? "text-slate-900" : "text-white";
  const mutedColor = light ? "text-slate-600" : "text-zinc-400";

  // Solid colors for readability
  const cardBg = light ? "bg-white" : "bg-black/95";
  const cardBorder = light ? "border-slate-200" : "border-zinc-800";


  return (
    <div
      ref={containerRef}
      className={`relative font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 min-h-screen ${light ? "bg-slate-50" : "bg-[#050505]"
        }`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Heading ── */}
      <div className="relative z-10 pt-32 pb-8 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl ${textColor}`}
        >
          TIMELINE
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="flex items-center justify-center gap-4 mt-8 mb-6"
        >
          <div
            className={`h-1 w-16 md:w-32 rounded-full ${light ? "bg-slate-300" : "bg-zinc-800"
              }`}
          />
          <div
            className="h-4 w-4 md:h-5 md:w-5 rotate-45 shrink-0"
            style={{
              background: "#ff00a0",
              boxShadow: "0 0 30px #ff00a0, 0 0 10px #ff00a0 inset",
            }}
          />
          <div
            className={`h-1 w-16 md:w-32 rounded-full ${light ? "bg-slate-300" : "bg-zinc-800"
              }`}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`font-bold uppercase tracking-[0.2em] text-xs md:text-sm ${mutedColor}`}
        >
          Key Milestones · HackX 2.0 · 2026
        </motion.p>
      </div>

      {/* ── Timeline Grid ── */}
      <div className="relative w-full max-w-[90rem] mx-auto px-4 md:px-12 py-16 pb-32 z-10">
        <div ref={gridInnerRef} className="relative">

          {/* Large decorative background element behind the timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] rounded-[100px] -z-20 blur-[100px] pointer-events-none ${light ? 'bg-gradient-to-br from-slate-200/50 to-slate-300/50' : 'bg-gradient-to-br from-zinc-900/40 to-black/60'
              }`}
            style={{
              boxShadow: light
                ? 'inset 0 0 100px rgba(255,255,255,0.5)'
                : 'inset 0 0 100px rgba(0,0,0,0.8), 0 0 150px rgba(255,0,160,0.05)',
              transformStyle: 'preserve-3d'
            }}
          />

          {/* Animated serpentine line (SVG stroke-dashoffset driven by framer-motion scroll) */}
          <svg
            className="absolute top-0 left-0 pointer-events-none drop-shadow-[0_0_15px_rgba(255,0,160,0.4)]"
            style={{
              width: svgDimensions.width,
              height: svgDimensions.height,
              overflow: "visible",
              zIndex: -1
            }}
          >
            {/* Background solid path track - NO GRADIENTS */}
            <path
              d={svgPathD}
              fill="none"
              stroke={light ? "#e2e8f0" : "#27272a"}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing active solid path trace mapped to scroll state via framer motion */}
            <motion.path
              d={svgPathD}
              fill="none"
              stroke="#ff00a0"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: drawProgress }}
            />
          </svg>

          {/* 4-column event grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 lg:gap-y-24">
            {EVENTS.map((e, i) => {
              const glowingShadow = e.highlight
                ? `0 0 40px ${e.accent}40, inset 0 0 20px ${e.accent}15`
                : light
                  ? `0 10px 40px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.05)`
                  : `0 10px 40px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)`;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ margin: "-50px", once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col items-center group"
                >
                  {/* Solid Non-Glass Card Wrapper */}
                  <div
                    className={`w-full max-w-sm rounded-[2rem] border ${cardBorder} ${cardBg} p-8 flex flex-col items-center relative overflow-hidden transition-transform duration-500 hover:-translate-y-2`}
                    style={{ boxShadow: glowingShadow }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: e.accent }} />

                    {/* Cube Attachment Point (The SVG path connects to these) */}
                    <div ref={(el) => { cubeRefs.current[i] = el; }} className="relative z-10 mb-8 p-3 bg-black/5 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                      <Cube3D accent={e.accent} isLight={light} step={e.step} className="group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Content Details: Stacked precisely Time -> Date -> Title -> Sub */}
                    <div className="text-center flex flex-col items-center justify-start flex-1 w-full gap-1 mt-2">
                      {/* 1) Time */}
                      <span
                        className="font-black text-2xl tracking-tighter tabular-nums"
                        style={{ color: e.accent }}
                      >
                        {e.time}
                      </span>
                      {/* 2) Date */}
                      <span className={`text-xs md:text-sm font-bold tracking-widest uppercase mb-4 ${mutedColor}`}>
                        {e.date}
                      </span>
                      {/* 3) Title */}
                      <span
                        className="font-black tracking-tight text-3xl md:text-4xl leading-tight mb-2"
                        style={{ color: e.highlight ? e.accent : textColor }}
                      >
                        {e.title}
                      </span>
                      {/* 4) Sub */}
                      <span className={`text-sm md:text-base font-semibold tracking-wide ${mutedColor}`}>
                        {e.sub || "Event Schedule"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
