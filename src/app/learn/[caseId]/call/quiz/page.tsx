"use client";

import { use, useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX } from "react-icons/fi";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { MdOutlineReplay, MdCancel } from "react-icons/md";
import { fetchCaseDetail, fetchAllCaseSummaries } from "@/lib/api/case-data";
import { evaluateChoice } from "@/lib/api/cases";
import { markQuizComplete } from "@/lib/api/learning";
import { getStoredUserId } from "@/lib/api/client";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY, useIsomorphicLayoutEffect } from "@/lib/auth";
import { playFeedbackTone } from "@/lib/sound";
import { recordCaseProgress } from "@/lib/progress";
import { useStudyTimeTracker } from "@/lib/daily-stats";
import { RecommendedCard } from "@/components/cards/RecommendedCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";
import { GuestSaveProgressCard } from "@/components/auth/GuestSaveProgressCard";
import type { PhishingCase } from "@/types";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";

export default function FinalQuizPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();

  useStudyTimeTracker();

  const [phishingCase, setPhishingCase] = useState<PhishingCase | null>(null);
  const [recommended, setRecommended] = useState<PhishingCase | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [realExplanation, setRealExplanation] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsLoggedIn(localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCaseDetail(caseId), fetchAllCaseSummaries()])
      .then(([detail, summaries]) => {
        if (cancelled) return;
        if (!detail) {
          setLoadFailed(true);
          return;
        }
        setPhishingCase(detail);
        setRecommended(summaries.find((c) => c.id !== caseId) ?? summaries[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  if (loadFailed) notFound();
  if (!phishingCase) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  const question = phishingCase.finalQuiz;
  const isCorrect = selected !== null && selected === question.answerIndex;
  const isDone = selected !== null;

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div
        className="relative flex shrink-0 flex-col items-center gap-3.5 text-white"
        style={{ backgroundImage: HEADER_GRADIENT, paddingTop: "34px", paddingBottom: "30px" }}
      >
        {!isDone && (
          <button
            type="button"
            aria-label="종료"
            onClick={() => setShowExitModal(true)}
            className="absolute top-5 left-6.5 cursor-pointer text-white/90"
          >
            <FiX size="clamp(18px, 5cqw, 22px)" />
          </button>
        )}
        <div className="flex h-[clamp(23px,5cqw,27px)] items-center justify-center rounded-full border border-white/50 bg-white/20 px-[clamp(14px,3cqw,18px)]">
          <p className="text-[clamp(13px,3.6cqw,16px)] font-semibold">{isDone ? "퀴즈 결과" : "퀴즈"}</p>
        </div>
        <p
          className="break-keep text-center font-semibold"
          style={{ fontSize: "clamp(15px, 4.2cqw, 18px)" }}
        >
          시나리오 : {phishingCase.title}
        </p>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3.5 px-4.25 py-3.5">
          {!isDone && (
            <div className="flex flex-col gap-3.5">
              <div
                className="break-keep rounded-lg text-center text-[15px] font-semibold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
                style={{
                  backgroundImage: HEADER_GRADIENT,
                  paddingInline: "clamp(12px, 5cqw, 34px)",
                  paddingBlock: "clamp(10px, 3.5cqh, 13px)",
                }}
              >
                Q. {question.question}
              </div>
              <div className="flex flex-col gap-2.5 rounded-xl bg-white px-5 py-6.25 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                {question.choices.map((choice, i) => {
                  const isSelected = pendingChoice === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPendingChoice(i)}
                      className={`flex cursor-pointer items-center gap-1.75 rounded-lg border border-gray-300 px-4.25 py-3 text-left text-sm font-medium text-[#1a2332] ${
                        isSelected ? "bg-gray-300" : "bg-gray-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-200"
                      }`}
                    >
                      <span
                        className={`flex size-5.25 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isSelected ? "text-white" : "bg-gray-400 text-gray-800"
                        }`}
                        style={isSelected ? { backgroundImage: HEADER_GRADIENT } : undefined}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="break-keep">{choice}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={pendingChoice === null}
                onClick={() => {
                  if (pendingChoice === null) return;
                  playFeedbackTone(pendingChoice === question.answerIndex);
                  recordCaseProgress(caseId, "finalQuiz");
                  setSelected(pendingChoice);

                  const optionId = question.optionIds?.[pendingChoice];
                  if (optionId) {
                    evaluateChoice(phishingCase.id, "VOICE", optionId)
                      .then((res) => {
                        if (res.explanation) setRealExplanation(res.explanation);
                      })
                      .catch(() => {});
                  }
                  if (getStoredUserId()) markQuizComplete(phishingCase.id).catch(() => {});
                }}
                className={`flex h-11.25 items-center justify-center rounded-lg border bg-white text-base font-bold ${
                  pendingChoice === null
                    ? "cursor-not-allowed border-gray-300 text-gray-400"
                    : "cursor-pointer border-[#1a2035] text-[#1a2332] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/70"
                }`}
              >
                정답 제출
              </button>
            </div>
          )}

          {isDone && (
            <>
              <div
                className="rounded-xl bg-white px-6.25 pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
                style={{ paddingTop: "clamp(20px, 6cqw, 34px)" }}
              >
                <div className="flex flex-col items-center gap-3.5 text-center">
                  <div className="flex w-full items-start gap-2">
                    <span className="flex h-[clamp(20px,5.5cqw,22px)] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1a2332] px-[clamp(6px,2cqw,8px)] text-[clamp(10px,2.8cqw,12px)] font-bold text-[#1a2332]">
                      퀴즈1
                    </span>
                    <p className="break-keep text-left text-sm font-semibold text-[#1a2332]">{question.question}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 rounded-lg px-[clamp(8px,2.5cqw,16px)] py-2 text-left text-xs font-semibold text-white ${
                      isCorrect ? "bg-[#00bc7d]" : "bg-[#df1e21]"
                    }`}
                  >
                    {isCorrect ? (
                      <RiCheckboxCircleFill size={18} className="shrink-0" />
                    ) : (
                      <MdCancel size={18} className="shrink-0" />
                    )}
                    <span className="break-keep leading-tight">{question.choices[selected]}</span>
                  </div>
                  <p className={`text-sm font-semibold ${isCorrect ? "text-[#00bc7d]" : "text-[#df1e21]"}`}>
                    {isCorrect ? "정확합니다!" : "위험합니다"}
                  </p>
                  <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                    <p className="text-left text-xs leading-relaxed text-gray-700">{realExplanation ?? question.explanation}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setPendingChoice(null);
                      setRealExplanation(null);
                    }}
                    className="flex cursor-pointer items-center gap-1 text-xs font-bold text-gray-600 [@media(hover:hover)_and_(pointer:fine)]:hover:text-gray-800"
                  >
                    <MdOutlineReplay size={15} />
                    다시 풀기
                  </button>
                </div>
              </div>

              {recommended && (
                <div className="mt-1 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-[#1a2332]">다음 학습이 궁금하다면?</p>
                  <RecommendedCard href={ROUTES.scenario(recommended.id)} phishingCase={recommended} />
                </div>
              )}

              {!isLoggedIn && (
                <GuestSaveProgressCard style={{ backgroundImage: HEADER_GRADIENT }} />
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />

      <ExitConfirmModal
        open={showExitModal}
        onExit={() => router.push(ROUTES.scenario(caseId))}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
