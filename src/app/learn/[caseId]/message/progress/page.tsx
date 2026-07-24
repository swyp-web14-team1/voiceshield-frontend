"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX } from "react-icons/fi";
import { BsFillPersonFill } from "react-icons/bs";
import { fetchCaseDetail } from "@/lib/api/case-data";
import { evaluateChoice } from "@/lib/api/cases";
import { markSimulationComplete } from "@/lib/api/learning";
import { getStoredUserId } from "@/lib/api/client";
import { CASE_CATEGORY_LABEL } from "@/lib/case-meta";
import { ROUTES } from "@/lib/routes";
import { readProgressSnapshot, recordCaseProgress } from "@/lib/progress";
import { useStudyTimeTracker } from "@/lib/daily-stats";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";
import { QuizCard } from "@/components/learn/QuizCard";
import { SimulationCompleteActions } from "@/components/learn/SimulationCompleteActions";
import { QuizResultCard } from "@/components/learn/QuizResultCard";
import type { PhishingCase } from "@/types";

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

  useStudyTimeTracker();

  const [phishingCase, setPhishingCase] = useState<PhishingCase | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [realExplanation, setRealExplanation] = useState<string | null>(null);
  const exitedRef = useRef(false);

  const isDone = revealComplete;
  const allRevealed = phishingCase ? revealedCount >= phishingCase.textMessages.length : false;

  useEffect(() => {
    let cancelled = false;
    fetchCaseDetail(caseId)
      .then((c) => {
        if (cancelled) return;
        if (!c) {
          setLoadFailed(true);
          return;
        }
        setPhishingCase(c);

        // "이어하기"로 들어온 경우 중단했던 정확한 지점(메시지 노출 개수, 답변 여부)부터 재개한다.
        const resume = readProgressSnapshot().overrides[caseId]?.resume;
        if (resume && resume.channel === "message") {
          setRevealedCount(resume.revealedCount);
          const previousAnswer = resume.answers[0] ?? null;
          if (previousAnswer !== null) {
            // 이미 답까지 골랐던 상태라면 다시 대화를 재생하지 않고 바로 결과 화면으로 보낸다.
            setAnswer(previousAnswer);
            setRevealComplete(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  useEffect(() => {
    if (!phishingCase) return;
    recordCaseProgress(caseId, isDone ? "complete" : "dialogue", {
      channel: "message",
      revealedCount,
      quizIndex: 0,
      answers: [answer],
    });
  }, [caseId, isDone, revealedCount, answer, phishingCase]);

  useEffect(() => {
    if (!phishingCase || allRevealed || exitedRef.current) return;
    const timer = setTimeout(() => {
      if (exitedRef.current) return;
      setRevealedCount((c) => c + 1);
    }, REVEAL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [revealedCount, allRevealed, phishingCase]);

  useEffect(() => {
    if (!phishingCase || !allRevealed || exitedRef.current) return;
    const timer = setTimeout(() => {
      if (!exitedRef.current) setShowQuiz(true);
    }, QUIZ_DELAY_MS);
    return () => clearTimeout(timer);
  }, [allRevealed, phishingCase]);

  const handleSelect = (choiceIndex: number) => {
    if (!showQuiz || answer !== null || !phishingCase) return;
    setAnswer(choiceIndex);

    const optionId = phishingCase.textQuiz.optionIds?.[choiceIndex];
    if (optionId) {
      evaluateChoice(phishingCase.id, "MESSAGE", optionId)
        .then((res) => {
          if (res.explanation) setRealExplanation(res.explanation);
        })
        .catch(() => {});
    }

    setTimeout(() => {
      if (!exitedRef.current) {
        setRevealComplete(true);
        if (getStoredUserId()) markSimulationComplete(phishingCase.id).catch(() => {});
      }
    }, ANSWER_REVEAL_DELAY_MS);
  };

  const handleRestart = () => {
    setRevealedCount(0);
    setShowQuiz(false);
    setAnswer(null);
    setRevealComplete(false);
    setRealExplanation(null);
  };

  if (loadFailed) notFound();
  if (!phishingCase) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  const isCorrect = answer !== null && answer === phishingCase.textQuiz.answerIndex;

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
              <span className="flex size-[clamp(40px,11cqw,51px)] items-center justify-center rounded-full bg-[#df1e21]">
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

            <QuizResultCard
              index={1}
              question={phishingCase.textQuiz.question}
              isCorrect={isCorrect}
              chosenLabel={phishingCase.textQuiz.choices[answer ?? 0]}
              explanation={realExplanation ?? phishingCase.textQuiz.explanation}
              stackOnNarrow
            />
          </div>
        </div>
      )}

      {isDone && (
        <SimulationCompleteActions
          caseId={caseId}
          onRestart={handleRestart}
          analysisInput={{
            caseTitle: phishingCase.title,
            category: CASE_CATEGORY_LABEL[phishingCase.category],
            quiz: [phishingCase.textQuiz],
            answers: [answer],
          }}
        />
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
