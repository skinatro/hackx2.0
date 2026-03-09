"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Keep all animation state in refs so we don't trigger React renders
  const mouse = useRef({ x: -100, y: -100 });
  const trailing = useRef({ x: -100, y: -100 });
  const currentSize = useRef({ width: 32, height: 32 });
  const rotation = useRef(0);
  const hoveredElement = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );

    const updateEnabledState = () => {
      setIsEnabled(mediaQuery.matches);
    };

    updateEnabledState();
    mediaQuery.addEventListener("change", updateEnabledState);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabledState);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    // Hide default cursor globally
    document.documentElement.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
    };

    const updateCursor = () => {
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;
      let targetWidth = 32;
      let targetHeight = 32;
      let isHoveringElement = false;

      if (hoveredElement.current) {
        // Fetch fresh rect every frame to handle scrolling smoothly
        const rect = hoveredElement.current.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        targetWidth = rect.width + 24; // 12px padding on all sides
        targetHeight = rect.height + 24;
        isHoveringElement = true;
      }

      // Smooth trailing interpolation for position
      const dx = targetX - trailing.current.x;
      const dy = targetY - trailing.current.y;
      trailing.current.x += dx * 0.2;
      trailing.current.y += dy * 0.2;

      // Smooth interpolation for frame size
      const dw = targetWidth - currentSize.current.width;
      const dh = targetHeight - currentSize.current.height;
      currentSize.current.width += dw * 0.2;
      currentSize.current.height += dh * 0.2;

      // Rotation logic
      if (isHoveringElement) {
        // Snap directly to nearest multiple of 180 so the brackets form a straight border
        const nearest180 = Math.round(rotation.current / 180) * 180;
        rotation.current += (nearest180 - rotation.current) * 0.3;
      } else {
        // Continuous slow spin when wandering
        rotation.current += 1.5;
      }

      if (cursorRef.current) {
        // Position and rotation applied to outer zero-size anchor
        cursorRef.current.style.transform = `translate3d(${trailing.current.x}px, ${trailing.current.y}px, 0) rotate(${rotation.current}deg)`;
      }

      if (innerRef.current) {
        // Size applied to inner framing container
        innerRef.current.style.width = `${currentSize.current.width}px`;
        innerRef.current.style.height = `${currentSize.current.height}px`;
      }

      requestRef.current = requestAnimationFrame(updateCursor);
    };

    const setHoverStateFromTarget = (target: HTMLElement | null) => {
      const clickable = target?.closest(
        'a, button, input, select, textarea, .cursor-target, [role="button"]',
      ) as HTMLElement;

      if (clickable) {
        hoveredElement.current = clickable;
        setIsHovering(true);
      } else {
        hoveredElement.current = null;
        setIsHovering(false);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      setHoverStateFromTarget(e.target as HTMLElement);
    };

    const handleMouseOut = (e: MouseEvent) => {
      // Related target is what the mouse just entered
      setHoverStateFromTarget(e.relatedTarget as HTMLElement);
    };

    const handleDocumentMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.addEventListener("mouseleave", handleDocumentMouseLeave);

    requestRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleDocumentMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);

      document.documentElement.style.cursor = "auto";
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      className={`fixed left-0 top-0 z-9999 pointer-events-none mix-blend-difference transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* 
        This is the 0x0 anchor point that moves and rotates via JS. 
        DO NOT apply CSS transitions to it to avoid severe performance lag.
      */}
      <div
        ref={cursorRef}
        className="pointer-events-none"
        style={{ width: "0px", height: "0px", willChange: "transform" }}
      >
        {/* 
          This inner container uses JS to handle the hover expand animation precisely.
          It is positioned exactly over the 0x0 anchor using absolute positioning and -translate.
        */}
        <div
          ref={innerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transform-gpu"
          style={{
            width: "32px",
            height: "32px",
          }}
        >
          {/* Top Left Bracket */}
          <div className="absolute top-0 left-0 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-l-2 border-white"></div>
          {/* Top Right Bracket */}
          <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-r-2 border-white"></div>
          {/* Bottom Left Bracket */}
          <div className="absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-l-2 border-white"></div>
          {/* Bottom Right Bracket */}
          <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-r-2 border-white"></div>

          {/* Optional center dot */}
          <div
            className={`absolute w-[3px] h-[3px] rounded-full bg-white transition-opacity duration-300 ${
              isHovering ? "opacity-75" : "opacity-100"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}
