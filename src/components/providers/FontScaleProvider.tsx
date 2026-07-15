"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const FONT_SIZES = ["보통", "크게", "아주크게"] as const;
export type FontSize = (typeof FONT_SIZES)[number];

export const FONT_SCALE: Record<FontSize, number> = {
  보통: 1,
  크게: 14 / 12,
  아주크게: 16 / 12,
};

const STORAGE_KEY = "voiceshield-font-size";

interface FontScaleContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontScaleContext = createContext<FontScaleContextValue | null>(null);

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("보통");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (FONT_SIZES as readonly string[]).includes(stored)) {
      setFontSizeState(stored as FontSize);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(FONT_SCALE[fontSize]));
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY, size);
  };

  return <FontScaleContext.Provider value={{ fontSize, setFontSize }}>{children}</FontScaleContext.Provider>;
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext);
  if (!ctx) throw new Error("useFontScale must be used within FontScaleProvider");
  return ctx;
}
