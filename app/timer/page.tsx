"use client";

import Image from "next/image";
import { createClient } from "@/libs/supabase/client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  WaveTiles,
  type WaveTilesHandle,
} from "@/ui/components/basic/wave-tiles";
import { useTheme } from "@/app/providers/theme-provider";

const BACKGROUND_TYPE: "waves" | "video" = "video"; // Toggle this if you want a video background instead
const VIDEO_PATH = "/timer-bg.mp4"; // Path to your background video

const TIMER_STYLES = `
  @keyframes glow-pulse {
    0%, 100% {
      text-shadow:
        0 0 20px rgba(192, 255, 0, 0.5),
        0 0 40px rgba(192, 255, 0, 0.3),
        0 0 80px rgba(192, 255, 0, 0.15);
    }
    50% {
      text-shadow:
        0 0 30px rgba(192, 255, 0, 0.7),
        0 0 60px rgba(192, 255, 0, 0.5),
        0 0 120px rgba(192, 255, 0, 0.25),
        0 0 200px rgba(192, 255, 0, 0.1);
    }
  }

  @keyframes colon-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  @keyframes subtle-drift {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes scanline {
    0% { top: -10%; }
    100% { top: 110%; }
  }

  .timer-digit {
    font-family: 'Geist Mono', 'SF Mono', 'Fira Code', monospace;
    animation: glow-pulse 3s ease-in-out infinite, subtle-drift 6s ease-in-out infinite;
  }

  .timer-colon {
    animation: colon-blink 1s ease-in-out infinite;
  }

  .scanline {
    position: fixed;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(192, 255, 0, 0.15), transparent);
    animation: scanline 8s linear infinite;
    pointer-events: none;
  }
`;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function TimerPage() {
  const { isLightMode } = useTheme();
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const waveTilesRef = useRef<WaveTilesHandle>(null);
  const [markerPos, setMarkerPos] = useState({ x: 0, y: 0 });

  // Fetch from config
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("config")
      .select("key, value")
      .in("key", ["hackathon_start_time", "hackathon_end_time"])
      .then(({ data }) => {
        let end = new Date("2026-04-18T10:00:00+05:30"); // Fallback
        let start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // Default to 24h before
        if (data) {
          const endConfig = data.find((c) => c.key === "hackathon_end_time");
          const startConfig = data.find(
            (c) => c.key === "hackathon_start_time",
          );
          if (endConfig?.value) end = new Date(endConfig.value);
          if (startConfig?.value) start = new Date(startConfig.value);
        }
        setEndTime(end);
        setStartTime(start);
      });
  }, []);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
      // Directly trigger pulse on wave-tiles for better updation
      if (waveTilesRef.current) {
        waveTilesRef.current.triggerPulse();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = useMemo(() => {
    if (!endTime || !now || !startTime)
      return { hours: 0, minutes: 0, seconds: 0, finished: true, progress: 0 };
    const diff = endTime.getTime() - now.getTime();
    const total = endTime.getTime() - startTime.getTime();

    // If it hasn't started yet, show 00:00:00
    if (now.getTime() < startTime.getTime()) {
      return { hours: 0, minutes: 0, seconds: 0, finished: false, progress: 0 };
    }

    if (diff <= 0)
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        finished: true,
        progress: 100,
      };

    const elapsed = now.getTime() - startTime.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { hours, minutes, seconds, finished: false, progress };
  }, [endTime, startTime, now]);

  useEffect(() => {
    if (!rectRef.current) return;
    const updatePos = () => {
      if (!rectRef.current) return;
      const len = rectRef.current.getTotalLength();
      if (len === 0) return;
      const pos = (remaining.progress / 100) * len;
      const pt = rectRef.current.getPointAtLength(pos);
      setMarkerPos({ x: pt.x || 0, y: pt.y || 0 });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    const interval = setInterval(updatePos, 100);
    return () => {
      window.removeEventListener("resize", updatePos);
      clearInterval(interval);
    };
  }, [remaining.progress]);

  const currentTimeStr = now
    ? now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      })
    : "";

  return (
    <>
      {/* Background Layer */}
      {BACKGROUND_TYPE === "waves" ? (
        <WaveTiles
          ref={waveTilesRef}
          isTimerMode
          globalColor="neon"
          forceTheme={isLightMode}
          className="fixed inset-0 opacity-[0.2] pointer-events-none"
          optimizeForPerformance
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover opacity-[0.5] pointer-events-none"
        >
          <source src={VIDEO_PATH} type="video/mp4" />
        </video>
      )}
      <div className="disable-pointer-events fixed inset-0 flex flex-col items-center justify-center bg-transparent overflow-hidden select-none">
        <style dangerouslySetInnerHTML={{ __html: TIMER_STYLES }} />

        {/* Scanline effect */}
        <div className="scanline" />

        {/* Vignette overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <div className="relative z-20 flex flex-col items-center">
          {/* HackX Logo */}
          <div className="opacity-80 pointer-events-none">
            <Image
              src="/hackx logo.png"
              alt="HackX 2.0 Logo"
              width={640}
              height={100}
              className="object-contain"
            />
          </div>

          {/* Label */}
          {/* <div className="border-[3px] border-[#c0ff00]/30 bg-[#c0ff00]/5 px-6 py-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c0ff00]/60">
            {remaining.finished ? "Time's Up" : "Time Remaining"}
          </p>
        </div> */}

          {/* Countdown */}

          <div className="relative p-8 sm:p-12 mb-8 mt-8 sm:mt-12 bg-black/40 backdrop-blur-xl w-[95vw] md:w-[85vw] lg:w-[80vw] max-w-7xl rounded-[40px] border border-white/5 overflow-visible">
            {/* SVG Progress Border - Pixel Perfect matching rounded-[40px] */}
            <svg className="absolute inset-0 z-20 w-full h-full pointer-events-none overflow-visible">
              <rect
                x="2"
                y="2"
                width="calc(100% - 4px)"
                height="calc(100% - 4px)"
                rx="40"
                ry="40"
                fill="none"
                stroke="#c0ff00"
                strokeOpacity="0.1"
                strokeWidth="4"
              />
              <rect
                ref={rectRef}
                x="2"
                y="2"
                width="calc(100% - 4px)"
                height="calc(100% - 4px)"
                rx="40"
                ry="40"
                fill="none"
                stroke="#c0ff00"
                strokeWidth="4"
                strokeDasharray="100 100"
                strokeDashoffset={-remaining.progress}
                pathLength="100"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Marker positioned independently to avoid stretching */}
            <div
              className="absolute z-50 pointer-events-none transition-all duration-1000 ease-linear"
              style={{
                left: markerPos.x,
                top: markerPos.y,
                transform: "translate(-50%, -35%)",
                width: "64px",
                height: "64px",
              }}
            >
              <Image
                src="/marker.png"
                alt="progress-marker"
                width={64}
                height={64}
                className="drop-shadow-[0_0_15px_rgba(192,255,0,0.8)]"
              />
            </div>

            <div className="flex justify-center items-center gap-2 sm:gap-6 relative z-10 w-full">
              {/* Unit Box: Hours */}
              <div className="flex flex-col items-center w-1/3 bg-white/5 backdrop-blur-md rounded-[24px] py-6 sm:py-10 border border-white/10 shadow-2xl">
                <span
                  className="timer-digit text-[18vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] font-black leading-none text-[#c0ff00]"
                  style={{ animationDelay: "0s" }}
                >
                  {pad(remaining.hours)}
                </span>
                <span className="mt-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-white/40">
                  Hours
                </span>
              </div>

              <span className="text-[10vw] sm:text-[8vw] md:text-[6vw] font-black text-[#c0ff00]/20 timer-colon">
                :
              </span>

              {/* Unit Box: Minutes */}
              <div className="flex flex-col items-center w-1/3 bg-white/5 backdrop-blur-md rounded-[24px] py-6 sm:py-10 border border-white/10 shadow-2xl">
                <span
                  className="timer-digit text-[18vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] font-black leading-none text-[#c0ff00]"
                  style={{ animationDelay: "0.5s" }}
                >
                  {pad(remaining.minutes)}
                </span>
                <span className="mt-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-white/40">
                  Minutes
                </span>
              </div>

              <span className="text-[10vw] sm:text-[8vw] md:text-[6vw] font-black text-[#c0ff00]/20 timer-colon">
                :
              </span>

              {/* Unit Box: Seconds */}
              <div className="flex flex-col items-center w-1/3 bg-white/5 backdrop-blur-md rounded-[24px] py-6 sm:py-10 border border-white/10 shadow-2xl">
                <span
                  className="timer-digit text-[18vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] font-black leading-none text-[#c0ff00]"
                  style={{ animationDelay: "1s" }}
                >
                  {pad(remaining.seconds)}
                </span>
                <span className="mt-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-white/40">
                  Seconds
                </span>
              </div>
            </div>
          </div>

          {remaining.finished && (
            <div className="mt-4 border-[3px] border-[#ff00a0] bg-[#ff00a0] px-8 py-3">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-white">
                🎉 Hacking Time is Over! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Current time — bottom right */}
        <div className="fixed bottom-6 right-6 z-20">
          <p className="text-[14px] font-bold tracking-[0.2em] text-white/50 font-mono">
            {currentTimeStr}
          </p>
        </div>
      </div>
    </>
  );
}
