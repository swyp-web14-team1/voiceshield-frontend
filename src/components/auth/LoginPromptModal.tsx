"use client";

import { FiX } from "react-icons/fi";
import { getKakaoAuthorizeUrl } from "@/lib/kakao";
import { ChatBubbleIcon, ArrowIcon } from "@/components/icons/kakao-icons";

export function LoginPromptModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{ padding: "clamp(20px, 8cqw, 40px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-90 rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
        style={{ padding: "clamp(24px, 10cqw, 32px) clamp(20px, 8cqw, 28px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
        >
          <FiX size={16} />
        </button>

        <div className="flex flex-col items-center" style={{ gap: "clamp(18px, 7cqw, 25px)" }}>
          <p className="text-center font-bold text-[#1a2332]" style={{ fontSize: "clamp(16px, 5cqw, 21px)" }}>
            로그인 후 이용 가능합니다.
          </p>

          <div className="flex w-full flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = getKakaoAuthorizeUrl();
              }}
              className="flex w-full items-center justify-between bg-[#FEE500] text-xs font-semibold text-[#3c1e1e] hover:bg-[#f7de04]"
              style={{
                paddingInline: "clamp(12px, 4cqw, 20px)",
                paddingBlock: "clamp(8px, 2cqw, 9px)",
                borderRadius: "clamp(4px, 1.558cqw, 7.79px)",
              }}
            >
              <span className="flex items-center gap-[0.667em]">
                <ChatBubbleIcon />
                Kakao로 시작하기
              </span>
              <ArrowIcon className="text-[#3c1e1e70]" />
            </button>

            <p className="px-4 text-center text-[10px] leading-relaxed text-gray-500">
              로그인하면 <span className="underline">이용약관</span> 및{" "}
              <span className="underline">개인정보 처리방침</span>에
              <br />
              동의한 것으로 간주합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
