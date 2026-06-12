import { createContext, useContext, useEffect, useState } from "react";

export interface ThemeColors {
  name: string;
  bg: string;
  accent: string;
  highlight: string;
}

export interface ThemeSettings {
  activeTheme: string;
  heroImageUrl: string;
  theme1: ThemeColors;
  theme2: ThemeColors;
  theme3: ThemeColors;
}

const DEFAULT_THEMES: Record<string, ThemeColors> = {
  "1": { name: "Stealth Black", bg: "#0a0a0a", accent: "#c8102e", highlight: "#ffffff" },
  "2": { name: "Midnight Navy", bg: "#0d1b2a", accent: "#d4af37", highlight: "#ffffff" },
  "3": { name: "Forest Elite", bg: "#0d1a10", accent: "#ff3355", highlight: "#ffffff" },
};

const DEFAULT_HERO = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80";

interface ThemeContextValue {
  settings: ThemeSettings;
  activeColors: ThemeColors;
  refetch: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  settings: {
    activeTheme: "1",
    heroImageUrl: DEFAULT_HERO,
    theme1: DEFAULT_THEMES["1"],
    theme2: DEFAULT_THEMES["2"],
    theme3: DEFAULT_THEMES["3"],
  },
  activeColors: DEFAULT_THEMES["1"],
  refetch: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function hexToHsl(hex: string, lightnessOffset = 0): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const finalL = Math.min(100, Math.max(0, Math.round(l * 100) + lightnessOffset));
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${finalL}%`;
}

function applyTheme(colors: ThemeColors) {
  const root = document.documentElement;
  const bg = hexToHsl(colors.bg);
  const hl = hexToHsl(colors.highlight);
  const ac = hexToHsl(colors.accent);

  root.style.setProperty("--background", bg);
  root.style.setProperty("--foreground", hl);
  root.style.setProperty("--card", hexToHsl(colors.bg, 3));
  root.style.setProperty("--card-foreground", hl);
  root.style.setProperty("--card-border", hexToHsl(colors.bg, 10));
  root.style.setProperty("--popover", hexToHsl(colors.bg, 4));
  root.style.setProperty("--popover-foreground", hl);
  root.style.setProperty("--popover-border", hexToHsl(colors.bg, 10));
  root.style.setProperty("--primary", hl);
  root.style.setProperty("--primary-foreground", bg);
  root.style.setProperty("--secondary", hexToHsl(colors.bg, 8));
  root.style.setProperty("--secondary-foreground", hl);
  root.style.setProperty("--muted", hexToHsl(colors.bg, 6));
  root.style.setProperty("--muted-foreground", hexToHsl(colors.bg, 50));
  root.style.setProperty("--border", hexToHsl(colors.bg, 12));
  root.style.setProperty("--input", hexToHsl(colors.bg, 12));
  root.style.setProperty("--ring", hl);
  root.style.setProperty("--accent", ac);
  root.style.setProperty("--accent-foreground", "0 0% 100%");
}

function parseTheme(raw: string | ThemeColors | undefined, fallback: ThemeColors): ThemeColors {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw) as ThemeColors; } catch { return fallback; }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>({
    activeTheme: "1",
    heroImageUrl: DEFAULT_HERO,
    theme1: DEFAULT_THEMES["1"],
    theme2: DEFAULT_THEMES["2"],
    theme3: DEFAULT_THEMES["3"],
  });

  const load = async () => {
    try {
      const res = await fetch("/api/settings/public");
      if (!res.ok) return;
      const data = await res.json() as {
        activeTheme?: string;
        heroImageUrl?: string;
        theme1?: string;
        theme2?: string;
        theme3?: string;
      };
      const t1 = parseTheme(data.theme1, DEFAULT_THEMES["1"]);
      const t2 = parseTheme(data.theme2, DEFAULT_THEMES["2"]);
      const t3 = parseTheme(data.theme3, DEFAULT_THEMES["3"]);
      setSettings({
        activeTheme: data.activeTheme ?? "1",
        heroImageUrl: data.heroImageUrl ?? DEFAULT_HERO,
        theme1: t1,
        theme2: t2,
        theme3: t3,
      });
    } catch {
      // use defaults
    }
  };

  useEffect(() => { void load(); }, []);

  const themeMap: Record<string, ThemeColors> = {
    "1": settings.theme1,
    "2": settings.theme2,
    "3": settings.theme3,
  };
  const activeColors = themeMap[settings.activeTheme] ?? settings.theme1;

  useEffect(() => { applyTheme(activeColors); }, [activeColors]);

  return (
    <ThemeContext.Provider value={{ settings, activeColors, refetch: load }}>
      {children}
    </ThemeContext.Provider>
  );
}
