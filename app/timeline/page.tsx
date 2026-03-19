"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ─── Styles ─────────────────────────────────────────────── */
const STYLES = `
  @keyframes rotateCube {
    from { transform: rotateX(-28deg) rotateY(0deg); }
    to   { transform: rotateX(-28deg) rotateY(360deg); }
  }
  @keyframes pulseGlow {
    0%, 100% { filter: drop-shadow(0 0 10px #ff00a0); stroke-width: 14; }
    50% { filter: drop-shadow(0 0 30px #ff00a0) drop-shadow(0 0 15px #ff00a0); stroke-width: 16; }
  }

  /* Responsive serpentine ordering */
  @media (min-width: 1024px) {
    .timeline-item { order: var(--lg-order) !important; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .timeline-item { order: var(--md-order) !important; }
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
  // Round 1 - Online Phase
  { title: "Registration Opens", time: "12:00 PM", date: "March 18th", step: "01", accent: "#00f0ff", highlight: true },
  { title: "Round 1 Begins", sub: "Online submission phase starts", time: "12:00 PM", date: "March 18th", step: "02", accent: "#ff00a0", highlight: true },
  // { title: "Problem Statements Release", time: "06:00 PM", date: "March 20th", step: "03", accent: "#c0ff00" },
  // { title: "Team Formation Period", sub: "Find teammates and form teams of 3-4", time: "All Week", date: "March 20-27th", step: "04", accent: "#ffcf00" },
  { title: "Round 1 Submission Deadline", sub: "Final submissions for online round", time: "11:59 PM", date: "April 4th", step: "05", accent: "#ff5e00", highlight: true },
  { title: "Round 1 Results", sub: "Judging and shortlisting process", time: "All Week", date: "April 5-7th", step: "06", accent: "#a000ff" },
  // { title: "Shortlisted Teams Announced", sub: "Round 2 qualified teams revealed", time: "06:00 PM", date: "April 12th", step: "07", accent: "#00ff40", highlight: true },

  // Round 2 - Offline Hackathon
  { title: "Reporting & Check-in", sub: "Round 2 participants arrival", time: "08:00 AM", date: "April 17th", step: "08", accent: "#00f0ff" },
  { title: "Inauguration Ceremony", time: "09:00 AM", date: "April 17th", step: "09", accent: "#ffcf00" },
  { title: "Round 2 Hackathon Begins", sub: "24-hour offline hackathon starts", time: "10:00 AM", date: "April 17th", step: "10", accent: "#ff00a0", highlight: true },
  { title: "Idea Pitch & Validation", sub: "Present initial concepts to judges", time: "12:00 PM", date: "April 17th", step: "11", accent: "#c0ff00" },
  { title: "Mentoring Sessions", sub: "Expert guidance and technical support", time: "03:00 PM", date: "April 17th", step: "12", accent: "#a000ff" },
  { title: "Mid-Hackathon Check", sub: "Progress assessment and feedback", time: "07:00 PM", date: "April 17th", step: "13", accent: "#ff5e00" },

  // Final Day
  { title: "Final Development Sprint", time: "08:00 AM", date: "April 18th", step: "14", accent: "#00b8ff" },
  { title: "Code Freeze", sub: "Development ends, prepare presentations", time: "09:00 AM", date: "April 18th", step: "15", accent: "#ff3c00", highlight: true },
  { title: "Final Presentations", sub: "Teams pitch their solutions to judges", time: "09:30 AM", date: "April 18th", step: "16", accent: "#ff3c00" },
  { title: "Prize Distribution", time: "12:00 AM", date: "April 18th", step: "17", accent: "#00ff40", highlight: true },
  { title: "Round 2 Hackathon Ends", time: "02:00 PM", date: "April 18th", step: "18", accent: "#ff00a0", highlight: true },
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

      // Get all points with their positions
      const points = cubeRefs.current.map((el, index) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: +(r.left + r.width / 2 - ir.left).toFixed(2),
          y: +(r.top + r.height / 2 - ir.top).toFixed(2),
          index
        };
      }).filter((p): p is { x: number, y: number, index: number } => p !== null);

      if (points.length > 0) {
        // Determine grid columns based on viewport
        const gridCols = inner.offsetWidth >= 1024 ? 4 : inner.offsetWidth >= 768 ? 2 : 1;

        // Group points into rows based on grid layout
        const rows: Array<Array<{ x: number, y: number, index: number }>> = [];

        for (let i = 0; i < points.length; i += gridCols) {
          const rowPoints = points.slice(i, i + gridCols);
          rows.push(rowPoints);
        }

        // Create serpentine path: left-to-right, then right-to-left alternating
        const orderedPoints: Array<{ x: number, y: number, index: number }> = [];

        rows.forEach((row, rowIndex) => {
          // Sort by X position first
          row.sort((a, b) => a.x - b.x);

          // Alternate direction for serpentine pattern
          if (rowIndex % 2 === 0) {
            // Even rows (0, 2, 4...): left to right
            orderedPoints.push(...row);
          } else {
            // Odd rows (1, 3, 5...): right to left
            orderedPoints.push(...row.reverse());
          }
        });

        // Now create smooth path through ordered points
        const radius = 20;
        let path = `M ${orderedPoints[0].x},${orderedPoints[0].y}`;

        for (let i = 1; i < orderedPoints.length; i++) {
          const pPrev = orderedPoints[i - 1];
          const pCurr = orderedPoints[i];
          const pNext = i + 1 < orderedPoints.length ? orderedPoints[i + 1] : null;

          if (pNext) {
            // Calculate direction vectors
            const dx1 = pCurr.x - pPrev.x;
            const dy1 = pCurr.y - pPrev.y;
            const dx2 = pNext.x - pCurr.x;
            const dy2 = pNext.y - pCurr.y;

            const len1 = Math.hypot(dx1, dy1);
            const len2 = Math.hypot(dx2, dy2);

            if (len1 > 0 && len2 > 0) {
              const r1 = Math.min(radius, len1 / 3);
              const r2 = Math.min(radius, len2 / 3);

              // Points for smooth curve
              const cx1 = pCurr.x - (dx1 / len1) * r1;
              const cy1 = pCurr.y - (dy1 / len1) * r1;
              const cx2 = pCurr.x + (dx2 / len2) * r2;
              const cy2 = pCurr.y + (dy2 / len2) * r2;

              path += ` L ${cx1.toFixed(2)},${cy1.toFixed(2)}`;
              path += ` Q ${pCurr.x.toFixed(2)},${pCurr.y.toFixed(2)} ${cx2.toFixed(2)},${cy2.toFixed(2)}`;
            } else {
              path += ` L ${pCurr.x.toFixed(2)},${pCurr.y.toFixed(2)}`;
            }
          } else {
            // Last point
            path += ` L ${pCurr.x.toFixed(2)},${pCurr.y.toFixed(2)}`;
          }
        }

        setSvgPathD(path);
      }
    }

    updatePath();
    window.addEventListener("resize", updatePath);
    const timer = setTimeout(updatePath, 100);
    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timer);
    };
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll-based progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      // Map scroll progress to timeline progress
      // Start showing progress when timeline section is 20% visible
      // Complete it when section is 80% through the viewport
      const adjustedProgress = Math.max(0, Math.min(1, (latest - 0.2) * 1.25));
      setScrollProgress(adjustedProgress);
    });

    return unsubscribe;
  }, [scrollYProgress]);

  // Apply spring physics so drawing feels smooth and snappy
  const drawProgress = useSpring(scrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const light = isLightMode;
  const textColor = light ? "text-slate-900" : "text-white";
  const mutedColor = light ? "text-slate-600" : "text-zinc-400";

  // Solid colors for readability
  return (
    <div
      ref={containerRef}
      className={`relative font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 min-h-screen ${light ? "bg-slate-50" : "bg-[#050505]"
        }`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Heading ── */}
      <div className="relative z-10 pt-32 pb-8 text-center px-4">
        <h1
          className={`cursor-target font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl ${textColor}`}
        >
          TIMELINE
        </h1>

        <p
          className={`cursor-target text-center font-black uppercase tracking-widest text-sm mb-16 px-4 py-2 border-[3px] mx-auto w-fit ${isLightMode ? "border-black bg-[#c0ff00] text-black" : "border-[#c0ff00] bg-black text-[#c0ff00]"}`}
        >
          Round 1 Online • Round 2 Offline • HackX 2.0 • 2026
        </p>
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
            {/* Background solid path track */}
            <path
              d={svgPathD}
              fill="none"
              stroke={light ? "#000" : "#444"}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-none"
            />
            {/* Glowing active solid path trace mapped to scroll state via framer motion */}
            <motion.path
              d={svgPathD}
              fill="none"
              stroke="#ff00a0"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                pathLength: drawProgress,
                animation: "pulseGlow 2s infinite ease-in-out"
              }}
              className="drop-shadow-[0_0_15px_#ff00a0]"
            />
          </svg>

          {/* 4-column event grid with serpentine path */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 lg:gap-y-24">
            {EVENTS.map((e, i) => {
              // Calculate order for serpentine layout (4-column grid)
              const getFlexOrder = (index: number, cols: number) => {
                const row = Math.floor(index / cols);
                const col = index % cols;

                if (row % 2 === 1) {
                  // Odd rows: reverse order within the row
                  return row * cols + (cols - 1 - col);
                } else {
                  // Even rows: normal order
                  return index;
                }
              };

              const largeOrder = getFlexOrder(i, 4);  // For lg screens
              const mediumOrder = getFlexOrder(i, 2); // For md screens
              const solidShadow = `10px 10px 0 ${e.accent}`;

              const cardClasses = `cursor-target w-full h-full max-w-[280px] sm:max-w-sm border-[3px] p-6 md:p-8 flex flex-col items-center relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${light
                ? "border-black/85 bg-[#fafafa] text-black hover:bg-white"
                : "border-black bg-[#0a0a0a] text-white hover:bg-[#111]"
                }`;

              return (
                <div
                  key={i}
                  className="cursor-target flex flex-col items-center group h-full timeline-item"
                  style={{
                    '--lg-order': largeOrder,
                    '--md-order': mediumOrder
                  } as React.CSSProperties & { '--lg-order': number; '--md-order': number }}
                >
                  {/* Solid Non-Glass Card Wrapper */}
                  <div
                    ref={(el) => { cubeRefs.current[i] = el; }}
                    className={cardClasses}
                    style={{ boxShadow: solidShadow }}
                  >
                    {/* Cube Attachment Point (The SVG path connects to these) */}
                    <div className="cursor-target relative z-10 mb-8 p-3 bg-black/5 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                      <Cube3D
                        accent={e.accent}
                        isLight={light}
                        step={e.step}
                        className="group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Content Details: Stacked precisely Time -> Date -> Title -> Sub */}
                    <div className="cursor-target text-center flex flex-col items-center justify-start flex-1 w-full gap-1 mt-2">
                      {/* 1) Time */}
                      <span
                        className="cursor-target font-black text-2xl tracking-tighter tabular-nums"
                        style={{ color: e.accent }}
                      >
                        {e.time}
                      </span>
                      {/* 2) Date */}
                      <span className={`cursor-target text-xs md:text-sm font-bold tracking-widest uppercase mb-4 ${mutedColor}`}>
                        {e.date}
                      </span>
                      {/* 3) Title */}
                      <span
                        className="cursor-target font-black tracking-tight text-2xl md:text-4xl leading-tight mb-2"
                        style={{ color: e.accent }}
                      >
                        {e.title}
                      </span>
                      {/* 4) Sub */}
                      <span className={`cursor-target text-sm md:text-base font-semibold tracking-wide ${mutedColor}`}>
                        {e.sub || "Event Schedule"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
