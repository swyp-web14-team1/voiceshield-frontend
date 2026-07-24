"use client";

import { getKakaoAuthorizeUrl } from "@/lib/kakao";
import { ChatBubbleIcon, ArrowIcon } from "@/components/icons/kakao-icons";
import { FaCheck } from "react-icons/fa";

const BADGE_LABELS = ["학습 진행률 저장", "완료한 학습 기록", "취약 유형 분석"];

export function GuestSaveProgressCard({
  style,
  className = "",
  message = "이번 학습을 저장해보세요!",
}: {
  style?: React.CSSProperties;
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={`@container flex items-center justify-center rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1)] ${className}`}
      style={{ gap: "clamp(14px, 5cqw, 16px)", paddingInline: "clamp(10px, 4cqw, 16px)", paddingBlock: "clamp(24px, 14cqw, 55px)", ...style }}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <p className="break-keep font-semibold text-white" style={{ fontSize: "clamp(12px, 4.2cqw, 16px)" }}>
          간편 로그인 하고
          <br />
          {message}
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = getKakaoAuthorizeUrl();
          }}
          className="flex w-fit shrink-0 cursor-pointer items-center bg-[#FEE500] text-xs leading-none font-semibold whitespace-nowrap text-[#3c1e1e] hover:bg-[#f7de04]"
          style={{
            gap: "clamp(3px, 2.5cqw, 16px)",
            paddingInline: "clamp(6px, 2.5cqw, 13px)",
            paddingBlock: "clamp(5px, 2cqw, 7px)",
            borderRadius: "clamp(4px, 1.558cqw, 7.79px)",
          }}
        >
          <span className="flex items-center gap-[0.667em] font-semibold">
            <ChatBubbleIcon />
            Kakao로 시작하기
          </span>
          <ArrowIcon className="text-[#3c1e1e70]" />
        </button>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2">
        {BADGE_LABELS.map((label) => (
          <span
            key={label}
            className="relative flex items-center justify-center gap-1 overflow-hidden rounded-full bg-white/10 px-[clamp(8px,3cqw,12px)] py-[clamp(5px,1.8cqw,7px)] text-[clamp(10px,2.8cqw,12px)] font-medium whitespace-nowrap text-white backdrop-blur-lg shadow-[0_12px_24px_-4px_rgba(13,10,31,0.2),inset_4px_4px_12px_rgba(0,0,0,0.1)]"
          >
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-full"
              style={{
                padding: "0.7px",
                background:
                  "linear-gradient(-15deg, rgba(255,255,255,0.6) 10%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.5) 100%)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <FaCheck size="clamp(10px, 2.8cqw, 12px)" className="shrink-0" color="#60A5FA" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
