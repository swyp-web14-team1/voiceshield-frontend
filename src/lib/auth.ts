"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export const AUTH_STORAGE_KEY = "voiceshield-logged-in";

// SSR에서는 useLayoutEffect가 아무 동작도 안 하면서 경고만 낸다 — 서버에서는 useEffect로 대체.
// isLoggedIn을 직접 로컬 state로 읽는 다른 페이지(record, settings, call/quiz 등)에서도 같은 깜빡임 방지에 재사용한다.
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect는 브라우저가 화면을 그린 "뒤"에 실행되어, 회원 전용 섹션이 잠깐 없다가(게스트 화면) 나타나면서
  // 카드들이 밀리는 게 눈에 보였다 — useLayoutEffect는 그리기 "직전"에 동기적으로 실행되어 그 깜빡임이 없다.
  useIsomorphicLayoutEffect(() => {
    setIsLoggedIn(localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  }, []);

  return isLoggedIn;
}
