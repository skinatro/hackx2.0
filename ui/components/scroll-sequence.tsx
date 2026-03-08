"use client";

import { useScroll, useTransform } from "framer-motion";
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
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create an array to hold all the Image objects in memory
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [hasLoadedFirst, setHasLoadedFirst] = useState(false);

  // We track the scroll progress of the specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress (0 to 1) to a frame index (1 to frameCount)
  // useTransform produces a floating point number, we round it down later
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();

      // The frames are 1-indexed (frame-001.jpg), not 0-indexed
      const fileNumber = i + 1;
      const id = fileNumber.toString().padStart(padLength, "0");
      const src = `${folderPath}/${filePrefix}${id}${fileExtension}`;

      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (fileNumber === 1) {
          setHasLoadedFirst(true);
        }
      };

      loadedImages.push(img);
    }

    setImages(loadedImages);
  }, [frameCount, folderPath, filePrefix, fileExtension, padLength]);

  const renderRafRef = useRef<number>(0);

  // Handle Canvas Drawing when the scroll/frame changes
  useEffect(() => {
    // If the canvas or first frame isn't loaded yet, skip
    if (!canvasRef.current || images.length === 0 || !images[0].complete)
      return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const canvas = canvasRef.current;

    const renderFrame = (index: number) => {
      const img = images[index];

      // Only attempt to draw if the image is actually fully downloaded by browser
      if (!img || !img.complete) return;

      // Handle the resize logic perfectly cover the canvas (like object-fit: cover)
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);

      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Optional: fill background color depending on light/dark mode for the edges before the cover calculates
      ctx.fillStyle = isLightMode ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio,
      );
    };

    const renderFrameThrottled = (index: number) => {
      if (renderRafRef.current) return;
      renderRafRef.current = window.requestAnimationFrame(() => {
        renderFrame(index);
        renderRafRef.current = 0;
      });
    };

    // Initialize Canvas width/height properly based on DPI boundaries
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const currentIdx = Math.floor(frameIndex.get());
      renderFrame(currentIdx);
    };

    handleResize(); // trigger immediately on mount
    window.addEventListener("resize", handleResize);

    // Subscribe to framer motion changes
    const unsubscribe = frameIndex.on("change", (latestIdx: number) => {
      renderFrameThrottled(Math.floor(latestIdx));
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
      if (renderRafRef.current)
        window.cancelAnimationFrame(renderRafRef.current);
    };
  }, [images, frameIndex, isLightMode, hasLoadedFirst]);

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
