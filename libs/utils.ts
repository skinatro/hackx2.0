import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generate a human-readable 8-character alphanumeric password.
 * Format: CapWord + Digit(s) + CapWord  (e.g. Sky3Mint, Fox8Gold)
 */
export function generatePassword(): string {
  const starters = [
    "Sky", "Fox", "Jet", "Ace", "Elm", "Bay", "Oak", "Ivy", "Gem", "Dew",
    "Ash", "Hex", "Zen", "Arc", "Orb", "Fin", "Rex", "Pix", "Lux", "Rio",
    "Bow", "Dot", "Ink", "Fog", "Hue", "Kit", "Sol", "Vim", "Wax", "Zap",
    "Cub", "Dip", "Fig", "Gum", "Hub", "Jot", "Key", "Lip", "Mud", "Net",
  ];
  const enders = [
    "Mint", "Gold", "Blue", "Lime", "Rose", "Jade", "Rust", "Wave", "Fern",
    "Peak", "Moon", "Star", "Dusk", "Dawn", "Glow", "Haze", "Bolt", "Reef",
    "Path", "Nest", "Sand", "Lake", "Pine", "Sage", "Teal", "Bloom", "Cliff",
    "Storm", "Drift", "Flame", "Frost", "Grove", "Ridge", "Stone", "Swift",
  ];
  const digit = Math.floor(Math.random() * 10);
  const s = starters[Math.floor(Math.random() * starters.length)];
  const e = enders[Math.floor(Math.random() * enders.length)];
  const raw = `${s}${digit}${e}`;
  // Ensure exactly 8 chars — truncate or pad
  return raw.slice(0, 8);
}

/**
 * Validate an email address (basic check).
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Meal display names
 */
export const MEAL_LABELS: Record<string, string> = {
  day1_lunch: "Day 1 Lunch",
  day1_dinner: "Day 1 Dinner",
  day2_brunch: "Day 2 Brunch",
};
