"use client";
import { WaveTiles } from "@/ui/components/basic/wave-tiles";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

const DEFAULT_LIGHT = "opacity-40";
const DEFAULT_DARK = "opacity-30";

type ThemeContextValue = {
  isLightMode: boolean;
  setWaveTilesOpacity: (lightClass: string, darkClass: string) => () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isLightMode: true,
  setWaveTilesOpacity: () => () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(true);
  const [lightClass, setLightClass] = useState(DEFAULT_LIGHT);
  const [darkClass, setDarkClass] = useState(DEFAULT_DARK);
  const pathname = usePathname();
  const showWaveTiles = pathname !== "/";

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

  return (
    <ThemeContext.Provider value={{ isLightMode, setWaveTilesOpacity }}>
      {showWaveTiles && (
        <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
          <WaveTiles
            className={isLightMode ? lightClass : darkClass}
            onModeChange={setIsLightMode}
            trackPointerGlobally
          />
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
}
