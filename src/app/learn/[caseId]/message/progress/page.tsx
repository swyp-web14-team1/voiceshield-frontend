"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX } from "react-icons/fi";
import { BsFillPersonFill } from "react-icons/bs";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { MdCancel } from "react-icons/md";
import { getCaseById, CASE_CATEGORY_LABEL } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";
import { saveAnalysisInput } from "@/lib/analysis";
import { recordCaseProgress } from "@/lib/progress";
import { useStudyTimeTracker } from "@/lib/daily-stats";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";
import { QuizCard } from "@/components/learn/QuizCard";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";
const REVEAL_INTERVAL_MS = 1800;
const QUIZ_DELAY_MS = 1200;
const ANSWER_REVEAL_DELAY_MS = 900;

const TODAY_LABEL = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(new Date());

export default function MessageSimulationProgressPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const phishingCase = getCaseById(caseId);
  if (!phishingCase) notFound();

  useStudyTimeTracker();

  const [revealedCount, setRevealedCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const exitedRef = useRef(false);

  const isDone = revealComplete;
  const isCorrect = answer !== null && answer === phishingCase.textQuiz.answerIndex;
  const allRevealed = revealedCount >= phishingCase.textMessages.length;

  useEffect(() => {
    recordCaseProgress(caseId, isDone ? "complete" : "dialogue");
  }, [caseId, isDone]);

  useEffect(() => {
    if (allRevealed || exitedRef.current) return;
    const timer = setTimeout(() => {
      if (exitedRef.current) return;
      setRevealedCount((c) => c + 1);
    }, REVEAL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [revealedCount, allRevealed]);

  useEffect(() => {
    if (!allRevealed || exitedRef.current) return;
    const timer = setTimeout(() => {
      if (!exitedRef.current) setShowQuiz(true);
    }, QUIZ_DELAY_MS);
    return () => clearTimeout(timer);
  }, [allRevealed]);

  const handleSelect = (choiceIndex: number) => {
    if (!showQuiz || answer !== null) return;
    setAnswer(choiceIndex);
    setTimeout(() => {
      if (!exitedRef.current) setRevealComplete(true);
    }, ANSWER_REVEAL_DELAY_MS);
  };

  const handleRestart = () => {
    setRevealedCount(0);
    setShowQuiz(false);
    setAnswer(null);
    setRevealComplete(false);
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div
        className="relative shrink-0 px-4 text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
        style={{
          backgroundImage: HEADER_GRADIENT,
          paddingTop: "27px",
          paddingBottom: isDone ? "clamp(14px, 4cqh, 20px)" : "clamp(24px, 7cqh, 34px)",
        }}
      >
        <button
          type="button"
          aria-label="종료"
          onClick={() => setShowExitModal(true)}
          className="absolute top-5 left-6.5 cursor-pointer text-white/90"
        >
          <FiX size="clamp(18px, 5cqw, 22px)" />
        </button>

        <div className="flex flex-col items-center">
          <div
            className={`flex h-[clamp(24px,6.5cqw,30px)] items-center gap-1.5 rounded-full border-[1.5px] px-[clamp(10px,3cqw,14px)] ${
              isDone ? "border-[#60a5fa]/30 bg-[#60a5fa]/10" : "border-[#df1e21]/30 bg-[#df1e21]/10"
            }`}
          >
            <span className={`size-[clamp(4px,1.2cqw,6px)] rounded-full ${isDone ? "bg-[#60a5fa]" : "animate-pulse bg-[#df1e21]"}`} />
            <span
              className={`text-[clamp(11px,3cqw,13px)] font-semibold ${isDone ? "text-[#60a5fa]" : "text-[#df1e21]"}`}
            >
              {isDone ? "시뮬레이션 완료" : "메세지 확인중"}
            </span>
          </div>

          <p
            className="text-center font-extrabold"
            style={{ fontSize: "clamp(15px, 4.2cqw, 18px)", marginTop: "clamp(10px, 3cqh, 15px)" }}
          >
            시나리오 : {phishingCase.title}
          </p>

          {isDone && (
            <p className="text-sm font-medium" style={{ marginTop: "5px" }}>
              올바른 대응 <span className="text-[#60a5fa]">{isCorrect ? 1 : 0}</span>
              <span className="text-white/50"> / 1회</span>
            </p>
          )}
        </div>
      </div>

      {!isDone ? (
        <>
          <div key="messages" className="no-scrollbar flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-1.5 px-4 pt-5">
              <span className="flex size-[clamp(44px,13cqw,51px)] items-center justify-center rounded-full bg-[#df1e21]">
                <BsFillPersonFill className="text-white" size={22} />
              </span>
              <p className="text-sm font-bold text-[#1a2332]">{phishingCase.callerLabel}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{TODAY_LABEL}</p>
            </div>

            <div className="flex flex-col gap-2.5 px-4 py-5">
              {phishingCase.textMessages.slice(0, revealedCount).map((text, i) => (
                <div key={i} className="bubble-enter flex justify-start">
                  <div className="max-w-[85%] rounded-tr-xl rounded-br-xl rounded-bl-xl bg-white px-3.5 py-2.5 text-sm leading-normal whitespace-pre-wrap text-[#1a2332] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showQuiz && (
            <div className="shrink-0 px-4.25 pt-3.5 pb-3.75">
              <QuizCard question={phishingCase.textQuiz} selected={answer} onSelect={handleSelect} />
            </div>
          )}
        </>
      ) : (
        <div key="complete" className="no-scrollbar flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3.5 px-4 py-5">
            <p className="text-center text-sm font-bold whitespace-pre-line text-blue-600">
              {isCorrect ? phishingCase.textFeedback.correct : phishingCase.textFeedback.wrong}
            </p>

            <div
              className="rounded-xl bg-white px-6.25 pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
              style={{ paddingTop: "clamp(20px, 6cqw, 34px)" }}
            >
              <div className="flex flex-col items-center gap-3.5 text-center">
                <div className="flex w-full flex-col items-center gap-2 @[450px]:flex-row @[450px]:items-center">
                  <span className="flex h-[clamp(20px,5.5cqw,22px)] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1a2332] px-[clamp(6px,2cqw,8px)] text-[clamp(10px,2.8cqw,12px)] font-bold text-[#1a2332]">
                    선택1
                  </span>
                  <p className="break-keep text-center text-sm font-semibold text-[#1a2332] @[450px]:text-left">
                    {phishingCase.textQuiz.question}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1.5 rounded-lg px-[clamp(12px,4cqw,24px)] py-2 text-left text-xs font-semibold text-white ${
                    isCorrect ? "bg-[#00bc7d]" : "bg-[#df1e21]"
                  }`}
                >
                  {isCorrect ? (
                    <RiCheckboxCircleFill size={18} className="shrink-0" />
                  ) : (
                    <MdCancel size={18} className="shrink-0" />
                  )}
                  <span className="break-keep leading-tight">{phishingCase.textQuiz.choices[answer ?? 0]}</span>
                </div>
                <p className={`text-sm font-bold ${isCorrect ? "text-[#00bc7d]" : "text-[#df1e21]"}`}>
                  {isCorrect ? "정확합니다!" : "위험합니다"}
                </p>
                <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                  <p className="text-left text-xs leading-relaxed text-gray-700">
                    {phishingCase.textQuiz.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDone && (
        <div className="flex shrink-0 flex-col gap-2.5 border-t border-gray-200 bg-white px-4 py-3.5">
          <button
            type="button"
            onClick={handleRestart}
            className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-500 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#1a2035]"
          >
            다시 하기
          </button>
          <button
            type="button"
            onClick={() => {
              saveAnalysisInput(caseId, {
                caseTitle: phishingCase.title,
                category: CASE_CATEGORY_LABEL[phishingCase.category],
                quiz: [phishingCase.textQuiz],
                answers: [answer],
              });
              router.push(ROUTES.callAnalysis(caseId));
            }}
            className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#1a2035] text-sm font-semibold text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#212841]"
          >
            AI 분석 결과 보기
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.callQuiz(caseId))}
            className="flex h-10.25 w-full cursor-pointer items-center justify-center rounded-[7px] border border-[#1a2035] bg-white text-sm font-semibold text-[#1a2035] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
          >
            마무리 퀴즈 하러 가기
          </button>
        </div>
      )}

      <ExitConfirmModal
        open={showExitModal}
        onExit={() => {
          exitedRef.current = true;
          router.push(ROUTES.scenario(caseId));
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
