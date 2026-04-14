"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

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
  isLightMode: false,
  setWaveTilesOpacity: () => () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(false);
  const [lightClass, setLightClass] = useState(DEFAULT_LIGHT);
  const [darkClass, setDarkClass] = useState(DEFAULT_DARK);

  const pathname = usePathname();
  const showWaveTiles =
    pathname !== "/" && pathname !== "/timer" && pathname !== "/login";

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsLightMode(savedTheme === "light");
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      // Optional: use system preference if no saved theme
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsLightMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "light" : "dark");
      return next;
    });
  }, []);

  const setWaveTilesOpacity = useCallback((lc: string, dc: string) => {
    setLightClass(lc);
    setDarkClass(dc);
    return () => {
      setLightClass(DEFAULT_LIGHT);
      setDarkClass(DEFAULT_DARK);
    };
  }, []);

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
            onModeChange={(val) => {
              setIsLightMode(val);
              localStorage.setItem("theme", val ? "light" : "dark");
            }}
            forceTheme={isLightMode}
            initialTheme={isLightMode ? "light" : "dark"}
            trackPointerGlobally
            optimizeForPerformance
          />
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
}
