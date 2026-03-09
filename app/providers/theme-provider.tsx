"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

const WaveTiles = dynamic(
  () => import("@/ui/components/basic/wave-tiles").then((mod) => mod.WaveTiles),
  {
    ssr: false,
  },
);

const DEFAULT_LIGHT = "opacity-40";
const DEFAULT_DARK = "opacity-30";

type ThemeContextValue = {
  isLightMode: boolean;
  setWaveTilesOpacity: (lightClass: string, darkClass: string) => () => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isLightMode: true,
  setWaveTilesOpacity: () => () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(true);
  const [lightClass, setLightClass] = useState(DEFAULT_LIGHT);
  const [darkClass, setDarkClass] = useState(DEFAULT_DARK);
  const [forceTheme, setForceTheme] = useState(false);
  const pathname = usePathname();
  const showWaveTiles = pathname !== "/";

  const toggleTheme = useCallback(() => {
    setIsLightMode((prev) => !prev);
    setForceTheme((prev) => !prev);
  }, []);

  const setWaveTilesOpacity = useCallback(
    (lc: string, dc: string) => {
      setLightClass(lc);
      setDarkClass(dc);
      return () => {
        setLightClass(DEFAULT_LIGHT);
        setDarkClass(DEFAULT_DARK);
      };
    },
    [],
  );

  const contextValue = useMemo(
    () => ({ isLightMode, setWaveTilesOpacity, toggleTheme }),
    [isLightMode, setWaveTilesOpacity, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {showWaveTiles && (
        <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
          <WaveTiles
            className={isLightMode ? lightClass : darkClass}
            onModeChange={setIsLightMode}
            forceTheme={forceTheme}
            trackPointerGlobally
            optimizeForPerformance
          />
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
}
