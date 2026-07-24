"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

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
  // layout.tsx의 inline script가 첫 페인트 전에 --font-scale을 이미 정확한 값으로 세팅해둔다 — 아래 CSS
  // 변수 적용 effect가 마운트 시점에도 무조건 실행되면, fontSize state가 아직 기본값("보통")인 상태로
  // 그 값을 도로 100%로 덮어썼다가 localStorage를 읽는 effect가 끝난 뒤에야 다시 원래 값으로 돌아가는
  // 깜빡임(줄어들었다 커지는 등)이 생긴다. 최초 1회만 건너뛰어 inline script가 세팅한 값을 그대로 둔다.
  const isFirstScaleEffect = useRef(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (FONT_SIZES as readonly string[]).includes(stored)) {
      setFontSizeState(stored as FontSize);
    }
  }, []);

  useEffect(() => {
    if (isFirstScaleEffect.current) {
      isFirstScaleEffect.current = false;
      return;
    }
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
