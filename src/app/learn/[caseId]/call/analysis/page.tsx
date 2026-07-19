"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { MdOutlineReplay, MdRule } from "react-icons/md";
import { RiShiningFill, RiShiningLine } from "react-icons/ri";
import { ROUTES } from "@/lib/routes";
import { readAnalysisInput } from "@/lib/analysis";
import { recordAnalysisAccuracy } from "@/lib/progress";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";
import type { AiAnalysisResult, AnalyzeRequest } from "@/types";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-200 bg-gray-100">
      <p className="text-[11px] font-medium text-gray-600">{label}</p>
      <p className="text-xs font-bold text-gray-700">{value}</p>
    </div>
  );
}

export default function AiAnalysisPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();


  const [input, setInput] = useState<AnalyzeRequest | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const accuracy =
    input && input.quiz.length > 0
      ? Math.round((input.quiz.filter((q, i) => input.answers[i] === q.answerIndex).length / input.quiz.length) * 100)
      : 0;

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadedInput = readAnalysisInput(caseId);
    if (!loadedInput) {
      router.replace(ROUTES.scenario(caseId));
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage는 마운트 후에만 읽을 수 있어 불가피함
    setInput(loadedInput);

    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loadedInput),
        });
        if (!res.ok) throw new Error("analyze failed");
        const data = (await res.json()) as AiAnalysisResult;
        setResult(data);
        setStatus("done");

        const quizAccuracy =
          loadedInput.quiz.length > 0
            ? Math.round(
                (loadedInput.quiz.filter((q, i) => loadedInput.answers[i] === q.answerIndex).length /
                  loadedInput.quiz.length) *
                  100,
              )
            : 0;
        recordAnalysisAccuracy(caseId, quizAccuracy);
      } catch {
        setStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div
        className="relative flex shrink-0 flex-col items-center gap-3.5 text-white"
        style={{ backgroundImage: HEADER_GRADIENT, paddingTop: "34px", paddingBottom: "30px" }}
      >
        <button
          type="button"
          aria-label="종료"
          onClick={() => setShowExitModal(true)}
          className="absolute top-5 left-6.5 cursor-pointer text-white/90"
        >
          <FiX size="clamp(15px, 4.5cqw, 21px)" />
        </button>
        <RiShiningLine size={35} />
        <div className="flex h-[clamp(26px,7cqw,32px)] items-center justify-center rounded-full border border-white/50 bg-white/20 px-[clamp(10px,3cqw,14px)]">
          <p className="text-[clamp(13px,3.6cqw,16px)] font-semibold">AI 분석 결과</p>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3.5 px-4.25 py-3.5">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-8 text-center shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
              <RiShiningFill className="animate-pulse text-[#60a5fa]" size={28} />
              <p className="text-sm font-semibold text-gray-700">AI가 학습 결과를 분석하고 있어요...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-8 text-center shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
              <p className="text-sm font-semibold text-[#df1e21]">분석 결과를 불러오지 못했어요.</p>
              <p className="text-xs text-gray-500">잠시 후 다시 시도해주세요.</p>
            </div>
          )}

          {status === "done" && result && (
            <>
              <div className="rounded-xl bg-white px-6.25 py-3.75 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1">
                    <RiShiningFill size={13} className="text-[#60a5fa]" />
                    <p className="text-base font-semibold text-[#1a2035]">AI 피드백</p>
                  </div>
                  <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                    <p className="text-xs leading-relaxed text-gray-700">{result.feedback}</p>
                  </div>
                  <div className="flex gap-2.5">
                    <StatBox label="반응 속도" value={result.responseSpeed} />
                    <StatBox label="의심도" value={result.suspicion} />
                    <StatBox label="정확도" value={`${accuracy}%`} />
                  </div>
                </div>
              </div>

              {result.goodPoints.length > 0 && (
                <div className="rounded-xl border border-[#60a5fa]/60 bg-white px-6.25 py-3.75 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="rounded-full border border-[#60a5fa]/40 bg-[#60a5fa]/10 px-3.75 py-1 text-xs font-bold text-[#60a5fa]/90">
                      좋았던 점
                    </span>
                    <div className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5">
                      {result.goodPoints.map((point, i) => (
                        <p key={i} className="text-xs leading-relaxed text-gray-700">
                          · {point}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.missedPoints.length > 0 && (
                <div className="rounded-xl border border-[#df1e21]/60 bg-white px-6.25 py-3.75 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="rounded-full border border-[#df1e21]/30 bg-[#df1e21]/10 px-3.75 py-1 text-xs font-bold text-[#df1e21]/60">
                      놓친 부분
                    </span>
                    <div className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5">
                      {result.missedPoints.map((point, i) => (
                        <p key={i} className="text-xs leading-relaxed text-[#df1e21]/60">
                          · {point}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-white px-6.25 py-3.75 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <MdRule size={17} className="text-gray-500" />
                    <p className="text-sm font-bold text-[#1a2035]">행동수칙</p>
                  </div>
                  <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                    {result.actionTips.map((tip, i) => (
                      <p key={i} className="text-xs leading-relaxed text-gray-700 underline underline-offset-2">
                        · {tip}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 border-t border-gray-200 bg-white px-4 py-3.75">
        <button
          type="button"
          onClick={() => router.push(ROUTES.call(caseId))}
          className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-400 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#1a2035]"
        >
          <MdOutlineReplay size={16} />
          다시 하기
        </button>
        <button
          type="button"
          onClick={() => router.push(ROUTES.callQuiz(caseId))}
          className="flex h-11 cursor-pointer items-center justify-center rounded-lg border border-[#1a2035] text-sm font-semibold text-[#1a2332] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
        >
          마무리 퀴즈 하러 가기
        </button>
      </div>

      <ExitConfirmModal
        open={showExitModal}
        onExit={() => router.push(ROUTES.scenario(caseId))}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
