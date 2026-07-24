"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { setStoredUserId } from "@/lib/api/client";
import { loginWithKakao, createMember } from "@/lib/api/auth";

function KakaoCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  // 카카오 인가 코드는 1회용이라, React Strict Mode의 effect 이중 실행으로 loginWithKakao가 두 번
  // 호출되면 두 번째 호출은 이미 소모된 코드로 인식돼 백엔드가 401을 반환한다 — call/analysis 페이지와
  // 동일한 패턴으로 방지.
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const code = searchParams.get("code");
    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 직후 쿼리스트링 확인 결과에 따른 상태 전환이라 불가피함
      setStatus("error");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await loginWithKakao(code);
        setStoredUserId(result.userId);
        if (result.signupStatus !== "SIGNUP_COMPLETE") {
          await createMember(result.userId);
        }
        if (cancelled) return;
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        router.replace(ROUTES.home);
      } catch (err) {
        console.error("[kakao-login] 실패:", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-base font-semibold text-gray-700">카카오 로그인에 실패했습니다.</p>
        <button
          type="button"
          onClick={() => router.replace(ROUTES.login)}
          className="cursor-pointer rounded-lg bg-[#FEE500] px-5 py-2.5 text-sm font-medium text-[#3c1e1e]"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center">
      <p className="text-sm text-gray-500">로그인 처리 중입니다...</p>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <KakaoCallbackInner />
    </Suspense>
  );
}
