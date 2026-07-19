"use client";

import { use, useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX, FiBookOpen } from "react-icons/fi";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { MdCancel, MdOutlineReplay } from "react-icons/md";
import { getCaseById, MOCK_CASES } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { playFeedbackTone } from "@/lib/sound";
import { recordCaseProgress } from "@/lib/progress";
import { RecommendedCard } from "@/components/cards/RecommendedCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";
import { ChatBubbleIcon, ArrowIcon } from "@/components/icons/kakao-icons";
import { FaCheck } from "react-icons/fa";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";

export default function FinalQuizPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const phishingCase = getCaseById(caseId);
  if (!phishingCase) notFound();

  const [pendingChoice, setPendingChoice] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피함
    setIsLoggedIn(localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  }, []);

  const recommended = MOCK_CASES.find((c) => c.id !== caseId) ?? MOCK_CASES[0];
  const question = phishingCase.finalQuiz;
  const isCorrect = selected !== null && selected === question.answerIndex;
  const isDone = selected !== null;

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
                    <p className="text-left text-xs leading-relaxed text-gray-700">{question.explanation}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setPendingChoice(null);
                    }}
                    className="flex cursor-pointer items-center gap-1 text-xs font-bold text-gray-600 [@media(hover:hover)_and_(pointer:fine)]:hover:text-gray-800"
                  >
                    <MdOutlineReplay size={15} />
                    다시 풀기
                  </button>
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1a2332]">다음 학습이 궁금하다면?</p>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#1a2035] uppercase">
                    <FiBookOpen size={14} className="text-gray-600" />
                    오늘의 추천학습
                  </span>
                </div>
                <RecommendedCard href={ROUTES.scenario(recommended.id)} phishingCase={recommended} />
              </div>

              {!isLoggedIn && (
                <div
                  className="flex items-center justify-center gap-4 rounded-xl px-4 py-5.5 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
                  style={{ backgroundImage: HEADER_GRADIENT }}
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold text-white">
                      간편 로그인 하고
                      <br />
                      이번 학습을 저장해보세요!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem(AUTH_STORAGE_KEY, "true");
                        setIsLoggedIn(true);
                      }}
                      className="flex w-fit shrink-0 cursor-pointer items-center gap-4 bg-[#FEE500] text-xs leading-none font-semibold whitespace-nowrap text-[#3c1e1e] hover:bg-[#f7de04]"
                      style={{
                        paddingInline: "clamp(10px, 4cqw, 13px)",
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
                    {["학습 진행률 저장", "완료한 학습 기록", "취약 유형 분석"].map((label) => (
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
