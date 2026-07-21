"use client";

import { useEffect, useState } from "react";

export const AUTH_STORAGE_KEY = "voiceshield-logged-in";

export function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피함
    setIsLoggedIn(localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  }, []);

  return isLoggedIn;
}
