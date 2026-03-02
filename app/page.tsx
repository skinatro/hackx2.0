"use client";

import { TileDataClass } from "@/libs/types";
import { Tile } from "@/ui/components/basic/tile";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const windowWidth = 48;
  const windowHeight = 30;
  const total = windowWidth * windowHeight;
  const triggerIndex = windowWidth - 1; // the tile that starts the wave

  // use softer shades instead of pure black/white
  const COLOR_DARK = "#0f1724"; // dark slate instead of pure black
  const COLOR_LIGHT = "#f8fafc"; // gentle off-white (flip color)

  const initialTileData = Array.from({ length: total }).map((_, i) =>
    new TileDataClass(i === triggerIndex ? COLOR_LIGHT : COLOR_DARK, 1, 1, i === triggerIndex ? "flip-button" : "")
  );

  // Tiles for creating gdg logo


  // visual state (color per tile)
  const [colors, setColors] = useState<string[]>(initialTileData.map((t) => t.tileColor));
  const [containerInverted, setContainerInverted] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      // cleanup scheduled timeouts on unmount
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
      setContainerInverted(false);
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    setContainerInverted(false);
  }

  // diagonal sweep from top-right → bottom-left
  function handleWave() {
    clearTimers();

    // compute diagonal distance for each tile so tiles on the same diagonal flip together
    const distances = new Array(total).fill(0);
    for (let idx = 0; idx < total; idx++) {
      const r = Math.floor(idx / windowWidth);
      const c = idx % windowWidth;
      // distance from top-right corner along diagonals
      distances[idx] = r + (windowWidth - 1 - c);
    }

    const baseDelay = 50; // ms per diagonal step

    // schedule tile flips using diagonal distance
    for (let i = 0; i < total; i++) {
      const d = distances[i];
      const id = window.setTimeout(() => {
        setColors((prev) => {
          const next = prev.slice();
          next[i] = prev[i] === COLOR_DARK ? COLOR_LIGHT : COLOR_DARK; // toggle to show flipped/back face
          return next;
        });
      }, d * baseDelay);
      timersRef.current.push(id);
    }

    // container pulse synchronized to diagonal steps
    const maxDistance = Math.max(...distances);
    const pulseMs = Math.max(40, Math.floor(baseDelay * 0.6));
    for (let step = 0; step <= maxDistance; step++) {
      const onId = window.setTimeout(() => setContainerInverted(true), step * baseDelay);
      const offId = window.setTimeout(() => setContainerInverted(false), step * baseDelay + pulseMs);
      timersRef.current.push(onId, offId);
    }
  }

  return (
    <div
      className={`grid grid-flow-row gap-px p-px min-h-screen min-w-screen layout-container transition-colors duration-300 ease-in-out ${containerInverted ? "bg-neutral-200 dark:bg-neutral-800" : "bg-neutral-900 dark:bg-neutral-400"}`}
      style={{
        gridTemplateColumns: `repeat(${windowWidth}, minmax(0, 1fr))`,
      }}
    >
      {initialTileData.map((data, i) => (
        <Tile
          key={i}
          {...data}
          frontColor={COLOR_DARK}
          backColor={COLOR_LIGHT}
          flipped={colors[i] === COLOR_LIGHT}
          className={`${data.className ?? ""} ${i === triggerIndex ? "cursor-pointer" : ""}`}
          onClick={i === triggerIndex ? handleWave : undefined}
        />
      ))}
    </div>
  );
}
