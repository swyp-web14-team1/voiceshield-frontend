"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";


const ICON_SIZE = "1.5em";
const ICON_GAP = "0.667em";
const GUEST_TEXT_OFFSET = `calc(${ICON_SIZE} + ${ICON_GAP})`;


export default function LoginPage() {
  const router = useRouter();

  const handleKakaoLogin = () => {

    router.push(ROUTES.home);
  };

  return (
    <div
      className="flex min-h-full flex-1 flex-col items-center"
      style={{
        paddingTop: "clamp(96px, 36.4cqw, 230px)",
        paddingBottom: "clamp(16px, 6.4cqw, 32px)",
      }}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: "clamp(8px, 3.2cqw, 16px)" }}
      >
        <Image
          src="/logo.svg"
          alt="피싱안심지킴이"
          width={96}
          height={96}
          priority
          style={{ width: "clamp(56px, 19.2cqw, 96px)", height: "clamp(56px, 19.2cqw, 96px)" }}
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          피싱안심지킴이
        </h1>
        <p className="text-sm leading-[1.45] tracking-tight text-gray-600 dark:text-gray-400 ">
          실전 시뮬레이션으로 배우는
          <br />
          보이스피싱 예방 학습
        </p>
      </div>

      <div
        className="flex flex-col self-stretch"
        style={{
          marginInline: "clamp(42px, 20cqw, 100px)",
          marginTop: "clamp(32px, 13.6cqw, 68px)",
        }}
      >
        <div className="flex flex-col" style={{ gap: "clamp(4px, 1.6cqw, 8px)" }}>
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-between bg-[#FEE500] text-xs font-semibold text-[#3c1e1e] cursor-pointer hover:bg-[#f7de04]"
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
            className="flex w-full items-center justify-between border border-gray-300 text-xs font-semibold text-gray-500 dark:border-gray-700"
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
          style={{ marginTop: "clamp(14px, 5.8cqw, 29px)" }}
        >
          로그인하면 이용약관 및 개인정보 처리방침에
          <br />
          동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    >
      <path d="M12 3C6.477 3 2 6.582 2 11c0 2.775 1.79 5.222 4.5 6.66-.146.55-.94 3.29-.97 3.5 0 0-.02.16.086.222a.29.29 0 0 0 .225.02c.297-.04 3.44-2.25 4.02-2.66.7.1 1.42.16 2.14.16 5.523 0 10-3.582 10-8s-4.477-8-10-8Z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
