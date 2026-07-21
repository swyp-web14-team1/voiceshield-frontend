"use client";

import { useEffect, useRef } from "react";
import { AUTH_STORAGE_KEY } from "@/lib/auth";

const DAILY_STUDY_TIME_KEY = "voiceshield-daily-study-seconds";
const FLUSH_INTERVAL_MS = 10_000;

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DAILY_STUDY_TIME_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function addTodaySeconds(seconds: number) {
  if (seconds <= 0) return;
  if (typeof window === "undefined" || localStorage.getItem(AUTH_STORAGE_KEY) !== "true") return;
  const map = readMap();
  const key = todayKey();
  map[key] = (map[key] ?? 0) + seconds;
  localStorage.setItem(DAILY_STUDY_TIME_KEY, JSON.stringify(map));
}

/** 오늘 누적 학습 시간(분, 내림). 서버 렌더링 시점에는 항상 0. */
export function getTodayStudyMinutes(): number {
  if (typeof window === "undefined") return 0;
  const map = readMap();
  return Math.floor((map[todayKey()] ?? 0) / 60);
}

/**
 * 학습 관련 화면(시나리오 상세, 전화 시뮬레이션 각 단계)에 붙여서 머문 시간을 오늘 날짜에 누적 기록한다.
 * router.push()는 페이지를 즉시 언마운트하지 않으므로 unmount 클린업만으로는 다른 학습 페이지로
 * 이동할 때 시간이 누락될 수 있어, 주기적 flush(10초)와 visibilitychange를 함께 사용한다.
 */
export function useStudyTimeTracker() {
  const lastTickRef = useRef(0);

  useEffect(() => {
    lastTickRef.current = Date.now();

    const flush = () => {
      const now = Date.now();
      addTodaySeconds(Math.round((now - lastTickRef.current) / 1000));
      lastTickRef.current = now;
    };

    const interval = setInterval(flush, FLUSH_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else lastTickRef.current = Date.now();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      flush();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
