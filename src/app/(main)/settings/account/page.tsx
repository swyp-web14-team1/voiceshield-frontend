"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Prata } from "next/font/google";
import { IoCheckmark } from "react-icons/io5";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { withdrawMembership } from "@/lib/api/auth";
import { setStoredUserId } from "@/lib/api/client";
import { BackHeader } from "@/components/layout/BackHeader";

const prata = Prata({ weight: "400", subsets: ["latin"] });

const REASONS = [
  "서비스 퀄리티가 낮아요",
  "신뢰도가 떨어져요",
  "대체할 만한 서비스를 찾았어요",
  "서비스 사용이 어려워요",
  "부담감이 있어요",
  "기타",
] as const;

export default function AccountDeletionPage() {
  const router = useRouter();
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [detail, setDetail] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await withdrawMembership();
      setShowComplete(true);
    } catch {
      setSubmitError("탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = () => {
    setStoredUserId(null);
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    router.push(ROUTES.login);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="회원 탈퇴" backHref={ROUTES.settings} />

      <div className="no-scrollbar flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-6">
        <section className="mt-5.25 flex flex-col rounded-xl bg-white px-8 pt-10 pb-12 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-[#1a2332] ">회원 탈퇴</h2>
              <p className={`text-sm text-gray-600 -mt-0.5 ${prata.className}`}>피싱안전교실을 떠나는 이유를 알려주세요.</p>
            </div>

            <div className="flex flex-col gap-4">
              {REASONS.map((r) => {
                const selected = reason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className="flex items-center gap-2 text-left"
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        selected ? "border-gray-300" : "border-gray-300"
                      }`}
                    >
                      {selected && <span className="size-4 rounded-full bg-gray-400" />}
                    </span>
                    <span className={`text-sm font-medium ${selected ? "text-[#1a2332]" : "text-gray-700"}`}>{r}</span>
                  </button>
                );
              })}
            </div>

            {reason === "기타" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-500">탈퇴사유</p>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="탈퇴사유를 입력해주세요."
                  className="h-24 w-full resize-none rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            )}

            {submitError && <p className="text-sm font-medium text-[#df1e21]">{submitError}</p>}
          </div>

          <div className="mt-3.5 flex items-center justify-center gap-3.5">
            <Link
              href={ROUTES.settings}
              className="flex h-11 w-31.75 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="button"
              disabled={!reason || isSubmitting}
              onClick={handleSubmit}
              className="flex h-11 w-31.75 items-center justify-center rounded-lg bg-[#60a5fa] text-sm font-bold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-shadow disabled:cursor-not-allowed disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),inset_0_0_0_999px_rgba(0,0,0,0.12)]"
            >
              {isSubmitting ? "처리 중..." : "제출하기"}
            </button>
          </div>
        </section>
      </div>

      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
          <div
            className="flex w-full flex-col items-center gap-3.5 rounded-xl bg-white"
            style={{
              maxWidth: "clamp(260px, 82cqw, 305px)",
              padding: "clamp(28px, 12cqw, 52px) clamp(8px, 3cqw, 10px)",
            }}
          >
            <span className="flex size-7.75 items-center justify-center rounded-full bg-[#60a5fa]">
              <IoCheckmark className="text-white" size={18} />
            </span>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-2xl font-bold text-[#1a2332]">회원 탈퇴 완료</p>
              <p className="text-base font-medium text-gray-500">탈퇴 처리가 완료되었습니다.</p>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex h-9 w-25.25 items-center justify-center rounded-lg bg-gray-200 text-sm font-bold text-gray-800 transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-300"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
