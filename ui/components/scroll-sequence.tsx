"use client";

import { useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ScrollSequenceProps {
  frameCount: number; // How many frames are in the sequence?
  folderPath?: string; // Default: "/hero-frames"
  filePrefix?: string; // Default: ""
  fileExtension?: string; // Default: ".webp"
  padLength?: number; // Default: 4 (e.g., 0001)
  className?: string;
  isLightMode?: boolean;
  height?: string;
  optimizeForPerformance?: boolean;
}

export default function ScrollSequence({
  frameCount,
  folderPath = "/hero-frames",
  filePrefix = "",
  fileExtension = ".webp",
  padLength = 4,
  className = "",
  isLightMode = true,
  height = "h-[300vh]",
  optimizeForPerformance = false,
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const renderRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const renderedFrameRef = useRef(-1);
  const latestFrameIndexRef = useRef(0);
  const isLightModeRef = useRef(isLightMode);

  const [hasLoadedFirst, setHasLoadedFirst] = useState(false);

  // We track the scroll progress of the specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: optimizeForPerformance ? 250 : 100,
    damping: optimizeForPerformance ? 50 : 30,
    restDelta: optimizeForPerformance ? 0.01 : 0.001,
  });

  // Map scroll progress (0 to 1) to a frame index (1 to frameCount)
  // useTransform produces a floating point number, we round it down later
  const frameIndex = useTransform(smoothProgress, [0, 1], [0, frameCount - 1]);

  useEffect(() => {
    isLightModeRef.current = isLightMode;
  }, [isLightMode]);

  useEffect(() => {
    let cancelled = false;
    let idleHandle: number | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    imagesRef.current = new Array(frameCount);
    renderedFrameRef.current = -1;

    const buildSrc = (index: number) => {
      const fileNumber = index + 1;
      const id = fileNumber.toString().padStart(padLength, "0");

      return `${folderPath}/${filePrefix}${id}${fileExtension}`;
    };

    const loadFrame = (index: number) => {
      if (cancelled || imagesRef.current[index]) {
        return;
      }

      const img = new Image();
      img.decoding = "async";
      img.src = buildSrc(index);
      img.onload = () => {
        if (cancelled) {
          return;
        }

        imagesRef.current[index] = img;

        if (index === 0) {
          setHasLoadedFirst(true);
        }

        if (index === latestFrameIndexRef.current && canvasRef.current) {
          renderedFrameRef.current = -1;
          renderRafRef.current = window.requestAnimationFrame(() => {
            renderRafRef.current = null;
            const currentFrame = latestFrameIndexRef.current;
            const currentImage = imagesRef.current[currentFrame];
            if (!currentImage || !currentImage.complete) {
              return;
            }

            const canvas = canvasRef.current;
            if (!canvas) {
              return;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              return;
            }

            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;
            const hRatio = displayWidth / currentImage.width;
            const vRatio = displayHeight / currentImage.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShiftX =
              (displayWidth - currentImage.width * ratio) / 2;
            const centerShiftY =
              (displayHeight - currentImage.height * ratio) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = isLightModeRef.current ? "#ffffff" : "#000000";
            ctx.fillRect(0, 0, displayWidth, displayHeight);
            ctx.drawImage(
              currentImage,
              0,
              0,
              currentImage.width,
              currentImage.height,
              centerShiftX,
              centerShiftY,
              currentImage.width * ratio,
              currentImage.height * ratio,
            );
            renderedFrameRef.current = currentFrame;
          });
        }
      };
    };

    loadFrame(0);

    let nextFrameToLoad = 1;
    const scheduleRemainingFrames = () => {
      if (cancelled || nextFrameToLoad >= frameCount) {
        return;
      }

      const loadBatch = (budget = 8) => {
        let processed = 0;
        while (nextFrameToLoad < frameCount && processed < budget) {
          loadFrame(nextFrameToLoad);
          nextFrameToLoad += 1;
          processed += 1;
        }

        if (nextFrameToLoad >= frameCount || cancelled) {
          return;
        }

        if ("requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(
            () => {
              loadBatch();
            },
            { timeout: 300 },
          );
          return;
        }

        fallbackTimer = globalThis.setTimeout(() => {
          loadBatch(4);
        }, 32);
      };

      loadBatch();
    };

    scheduleRemainingFrames();

    return () => {
      cancelled = true;
      imagesRef.current = [];
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
      if (renderRafRef.current !== null) {
        window.cancelAnimationFrame(renderRafRef.current);
        renderRafRef.current = null;
      }
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, [fileExtension, filePrefix, folderPath, frameCount, padLength]);

  // Handle Canvas Drawing when the scroll/frame changes
  useEffect(() => {
    // If the canvas or first frame isn't loaded yet, skip
    if (!canvasRef.current || !hasLoadedFirst) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const canvas = canvasRef.current;

    const renderFrame = (index: number) => {
      const img = imagesRef.current[index];

      // Only attempt to draw if the image is actually fully downloaded by browser
      if (!img || !img.complete) return;
      if (renderedFrameRef.current === index) return;

      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      // Handle the resize logic perfectly cover the canvas (like object-fit: cover)
      const hRatio = displayWidth / img.width;
      const vRatio = displayHeight / img.height;
      const ratio = Math.max(hRatio, vRatio);

      const centerShiftX = (displayWidth - img.width * ratio) / 2;
      const centerShiftY = (displayHeight - img.height * ratio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Optional: fill background color depending on light/dark mode for the edges before the cover calculates
      ctx.fillStyle = isLightMode ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShiftX,
        centerShiftY,
        img.width * ratio,
        img.height * ratio,
      );

      renderedFrameRef.current = index;
    };

    let lastRenderTime = 0;
    const renderFrameThrottled = (index: number) => {
      if (renderRafRef.current !== null) return;

      const now = performance.now();
      const interval = optimizeForPerformance ? 33 : 16; // ~30fps vs ~60fps
      if (now - lastRenderTime < interval) return;

      renderRafRef.current = window.requestAnimationFrame(() => {
        renderFrame(index);
        lastRenderTime = performance.now();
        renderRafRef.current = null;
      });
    };

    // Initialize Canvas width/height properly based on DPI boundaries
    const handleResize = () => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      const targetDpr = window.devicePixelRatio || 1;
      const dpr = optimizeForPerformance
        ? Math.min(targetDpr, 1.0)
        : Math.min(targetDpr, 1.5);

      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderedFrameRef.current = -1;
      const currentIdx = Math.floor(frameIndex.get());
      renderFrame(currentIdx);
    };

    handleResize(); // trigger immediately on mount
    const onResize = () => {
      if (resizeRafRef.current !== null) {
        return;
      }

      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        handleResize();
      });
    };

    window.addEventListener("resize", onResize, { passive: true });

    // Subscribe to framer motion changes
    const unsubscribe = frameIndex.on("change", (latestIdx: number) => {
      const nextIndex = Math.floor(latestIdx);
      latestFrameIndexRef.current = nextIndex;
      renderFrameThrottled(nextIndex);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      unsubscribe();
      if (renderRafRef.current !== null)
        window.cancelAnimationFrame(renderRafRef.current);
      if (resizeRafRef.current !== null)
        window.cancelAnimationFrame(resizeRafRef.current);
    };
  }, [frameIndex, hasLoadedFirst, isLightMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} ${className}`}
    >
      {/* sticky container to hold the canvas in place while we scroll */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        {/* We use a fallback if the first image isn't loaded */}
        {!hasLoadedFirst && (
          <div
            className={`absolute inset-0 flex items-center justify-center font-black uppercase tracking-widest ${isLightMode ? "bg-white text-black" : "bg-black text-[#c0ff00]"}`}
          >
            Initializing Sequence...
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* 
          Overlays / Gradients / Grid to blend the harsh 3D render down to the UI 
        */}
        <div className="absolute inset-0 pointer-events-none" />
      </div>
    </div>
  );
}
