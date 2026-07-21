"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { ChatBubbleIcon, ArrowIcon } from "@/components/icons/kakao-icons";

const ICON_SIZE = "1.5em";
const ICON_GAP = "0.667em";
const GUEST_TEXT_OFFSET = `calc(${ICON_SIZE} + ${ICON_GAP})`;


export default function LoginPage() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    router.push(ROUTES.home);
  };

  const handleGuestStart = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
  };

  return (
    <div
      className="flex min-h-full flex-1 flex-col items-center"
      style={{
        paddingTop: "clamp(150px, 23cqh, 240px)",
        paddingBottom: "clamp(16px, 4cqh, 32px)",
      }}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: "clamp(14px, 4cqh, 44px)" }}
      >
        <Image
          src="/logo_f.svg"
          alt="피싱안전교실"
          width={120}
          height={120}
          priority
          style={{ width: "clamp(80px, 27cqw, 155px)", height: "clamp(80px, 27cqw, 123px)" }}
        />
        <p className="text-sm leading-[1.45] tracking-tight text-gray-600 dark:text-gray-400 font-normal">
          실전 시뮬레이션으로 배우는
          <br />
          보이스피싱 예방 학습
        </p>
      </div>

      <div
        className="flex flex-col self-stretch"
        style={{
          marginInline: "clamp(42px, 20cqw, 100px)",
          marginTop: "clamp(24px, 8cqh, 68px)",
        }}
      >
        <div className="flex flex-col" style={{ gap: "clamp(4px, 1.6cqw, 8px)" }}>
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-between bg-[#FEE500] text-xs font-medium text-[#3c1e1e] cursor-pointer hover:bg-[#f7de04]"
            style={{
              paddingInline: "clamp(12px, 4cqw, 20px)",
              paddingBlock: "clamp(8px, 2cqw, 9px)",
              borderRadius: "clamp(4px, 1.558cqw, 7.79px)",
            }}
          >
            <span className="flex items-center" style={{ gap: ICON_GAP }}>
              <ChatBubbleIcon />
              Kakao로 시작하기
            </span>
            <ArrowIcon className="text-[#3c1e1e70]" />
          </button>
          <Link
            href={ROUTES.home}
            onClick={handleGuestStart}
            className="flex w-full items-center justify-between border border-gray-300 text-xs font-medium text-gray-500 dark:border-gray-700"
            style={{
              paddingInline: "clamp(12px, 4cqw, 20px)",
              paddingBlock: "clamp(8px, 2cqw, 9px)",
              borderRadius: "clamp(4px, 1.558cqw, 7.79px)",
            }}
          >
            <span style={{ marginLeft: GUEST_TEXT_OFFSET }}>게스트로 시작하기</span>
            <ArrowIcon className="text-gray-500" />
          </Link>
        </div>
        <p
          className="px-4 text-center text-[0.625rem] leading-relaxed text-gray-500 dark:text-gray-700"
          style={{ marginTop: "clamp(10px, 3.5cqh, 29px)" }}
        >
          로그인하면 이용약관 및 개인정보 처리방침에
          <br />
          동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
