"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WaveTiles } from "./basic/wave-tiles";

export default function Preloader({
  onComplete,
  optimizeForPerformance = false,
}: {
  onComplete: () => void;
  optimizeForPerformance?: boolean;
}) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const visited = localStorage.getItem("hackx_visited");

    if (!visited) {
      setIsFirstLoad(true);
      setIsVisible(true);

      // Play animation for a fixed duration then complete
      const timer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem("hackx_visited", "true");
        setTimeout(onComplete, 1000); // Wait for exit animation
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [onComplete]);

  if (!hasMounted || !isFirstLoad) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Black fade cover — stays behind and fades out after slide */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.4 } }}
            className="fixed inset-0 z-9998 bg-black"
          />
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.8, ease: "easeInOut" },
            }}
            className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden"
          >
            <WaveTiles
              forceTheme={true}
              optimizeForPerformance
              className="absolute! overflow-hidden!"
            />

            {/* Grain Overlay - CPU intensive on some browsers */}
            {!optimizeForPerformance && (
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] " />
            )}

            <div className="relative z-10 flex flex-col justify-center items-center bg-black/90 w-full h-full">
              {/* Main Logo Reveal */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.5, delay: 0.2 },
                }}
                className="relative"
              >
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic">
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="inline-block"
                  >
                    Hack
                  </motion.span>
                  <motion.span
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="inline-block text-[#ff00a0]"
                  >
                    X
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 1.2,
                    }}
                    className="absolute -top-4 -right-12 text-2xl md:text-3xl font-black text-[#c0ff00] not-italic"
                  >
                    2.0
                  </motion.span>
                </h1>

                {/* Glitch Slices - CPU intensive mix-blend-mode */}
                {!optimizeForPerformance && (
                  <motion.div
                    animate={{
                      x: [0, -5, 5, -5, 0],
                      opacity: [0, 1, 0, 1, 0],
                    }}
                    transition={{
                      duration: 0.2,
                      repeat: Infinity,
                      repeatType: "mirror",
                      repeatDelay: 2,
                    }}
                    className="absolute inset-0 text-6xl md:text-8xl font-black tracking-tighter text-[#00f0ff] uppercase italic mix-blend-screen"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 30%)",
                    }}
                  >
                    HackX
                  </motion.div>
                )}
              </motion.div>

              {/* Status Bar */}
              <div className="mt-12 w-64 h-1 bg-white/10 relative overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-0 bg-linear-to-r from-[#ff00a0] via-[#c0ff00] to-[#00f0ff]"
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40"
              >
                Initializing Digital Bharat...
              </motion.p>
            </div>

            {/* Decorative Elements - Limit to one in performance mode */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none"
            />
            {!optimizeForPerformance && (
              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-1/2 left-1/2 h-75 w-75 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 pointer-events-none"
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
