"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX } from "react-icons/fi";
import { MdOutlineReplay } from "react-icons/md";
import { BsFillPersonFill } from "react-icons/bs";
import { IoVolumeMute, IoVolumeHigh, IoCheckmark, IoClose } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";
import { getStoredTtsPreference, prefetchTts } from "@/lib/tts";
import { WAVEFORM_BAR_PATHS } from "@/lib/waveform-bars";
import type { QuizQuestion } from "@/types";

type Phase = "dialogue" | "quiz" | "complete";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";

function CallWaveform({ active }: { active: boolean }) {
  return (
    <svg
      width={162}
      height={36}
      viewBox="0 0 162 36"
      fill="none"
      style={{ width: "clamp(120px, 32cqw, 162px)", height: "auto" }}
    >
      {WAVEFORM_BAR_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="white"
          opacity={0.75}
          className={active ? "call-waveform-bar" : ""}
          style={
            active
              ? {
                  transformBox: "fill-box",
                  animationDelay: `${(i % 6) * 0.15}s`,
                  animationDuration: `${1.6 + (i % 4) * 0.25}s`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

function QuizCard({
  question,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  selected: number | null;
  onSelect: (choiceIndex: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
      <div
        className="break-keep text-center text-sm font-bold text-white"
        style={{
          backgroundImage: HEADER_GRADIENT,
          paddingInline: "clamp(12px, 5cqw, 16px)",
          paddingBlock: "clamp(7px, 2.5cqh, 10px)",
        }}
      >
        {question.question}
      </div>
      <div
        className="flex flex-col"
        style={{
          gap: "clamp(6px, 2cqh, 8px)",
          paddingInline: "clamp(16px, 7cqw, 26px)",
          paddingTop: "clamp(12px, 4cqh, 18px)",
          paddingBottom: "clamp(10px, 3.5cqh, 16px)",
        }}
      >
        {question.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrectChoice = i === question.answerIndex;
          const isCorrectAndSelected = isSelected && isCorrectChoice;
          const isWrongAndSelected = isSelected && !isCorrectChoice;
          return (
            <button
              key={i}
              type="button"
              disabled={selected !== null}
              onClick={() => onSelect(i)}
              style={{
                paddingInline: "clamp(10px, 4cqw, 14px)",
                paddingBlock: "clamp(8px, 2.8cqh, 12px)",
                ...(isCorrectAndSelected ? { backgroundImage: HEADER_GRADIENT } : undefined),
              }}
              className={`flex items-center justify-between gap-2 rounded-lg border text-left text-sm font-medium transition-colors ${
                isCorrectAndSelected
                  ? "border-transparent text-white"
                  : isWrongAndSelected
                    ? "border-gray-400 bg-gray-300 text-[#1a2332]"
                    : "border-gray-300 bg-gray-100 text-[#1a2332]"
              } ${selected === null ? "cursor-pointer [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-200" : "cursor-default"}`}
            >
              <span className="flex items-start gap-2">
                <span className="shrink-0 font-bold">{i + 1}.</span>
                <span>{choice}</span>
              </span>
              {isCorrectAndSelected && <IoCheckmark size={18} className="shrink-0" />}
              {isWrongAndSelected && <IoClose size={18} className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CallSimulationProgressPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const phishingCase = getCaseById(caseId);
  if (!phishingCase) notFound();

  const [phase, setPhase] = useState<Phase>("dialogue");
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(phishingCase.quiz.length).fill(null));
  const [muted, setMuted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [playingLineIndex, setPlayingLineIndex] = useState<number | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);
  const playTokenRef = useRef(0);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dialogueScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  }, [muted]);

  // 컴포넌트가 완전히 언마운트될 때(다른 페이지로 이동 등)도 재생 중이던 오디오를 확실히 멈춘다.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const currentQuestion = phishingCase.quiz[quizIndex];
  const correctCount = answers.filter((answer, i) => answer === phishingCase.quiz[i].answerIndex).length;
  const lastCallerIndex = phishingCase.phoneDialogue.reduce(
    (acc, line, i) => (line.speaker === "caller" ? i : acc),
    -1,
  );

  const scrollLineToTop = (index: number) => {
    const container = dialogueScrollRef.current;
    const target = lineRefs.current[index];
    if (!container || !target) return;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: offset, behavior: "smooth" });
  };

  // 퀴즈 카드가 처음 나타나 대화 영역 높이가 줄어드는 순간에는, 그 전에 대사가 끝나며 시도했던
  // 스크롤이 아직 스크롤할 내용이 없어 무시됐을 수 있다 — 카드가 뜬 직후 마지막 대사를 다시 맨 위로 올린다.
  useEffect(() => {
    if (phase !== "quiz" || lastCallerIndex < 0) return;
    const raf = requestAnimationFrame(() => scrollLineToTop(lastCallerIndex));
    return () => cancelAnimationFrame(raf);
  }, [phase, lastCallerIndex]);

  // playTokenRef로 자기 자신보다 나중에 시작된 재생 요청이 있으면 스스로를 무효화한다.
  // (React Strict Mode의 effect 이중 실행 등으로 같은 대사가 두 번 재생되어 겹쳐 들리는 문제 방지)
  const playLine = async (index: number, text: string) => {
    const token = ++playTokenRef.current;
    if (mutedRef.current) return;
    audioRef.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlayingLineIndex(index);

    let audio: HTMLAudioElement | null = null;
    let url: string | null = null;

    try {
      const { voice, rate } = getStoredTtsPreference();
      // 수신 전화 화면에서 미리 요청해둔 첫 대사가 있으면 그걸 그대로 이어받아 재생까지의 지연을 줄인다.
      const blob = await prefetchTts(text, voice, rate);
      url = URL.createObjectURL(blob);
      if (token !== playTokenRef.current) throw new Error("superseded");

      audio = new Audio(url);
      audioRef.current = audio;
      const currentAudio = audio;
      const ended = new Promise<void>((resolve) => {
        currentAudio.onended = () => resolve();
        currentAudio.onerror = () => resolve();
        // 음소거 등으로 재생이 중간에 멈춘(pause) 경우에도 재생이 끝난 것으로 취급해,
        // 다음 대사로 넘어가지 못하고 멈춰버리는 일이 없게 한다.
        currentAudio.onpause = () => resolve();
      });
      await audio.play();
      if (token !== playTokenRef.current) throw new Error("superseded");
      await ended;
    } catch {
      // 클라우드 음성 재생이 (자동재생 차단 등으로) 실패한 경로로 들어온 경우, 시도했던 오디오
      // 엘리먼트를 완전히 멈춰서 나중에 뒤늦게 재생되며 브라우저 TTS 폴백과 겹쳐 들리는 일이 없게 한다.
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (token !== playTokenRef.current) return;
      const { rate } = getStoredTtsPreference();
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ko-KR";
        utterance.rate = rate;
        const koreanVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
        if (koreanVoice) utterance.voice = koreanVoice;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (token === playTokenRef.current) {
        setPlayingLineIndex(null);
        // 말이 끝난 대사가 화면 위쪽으로 올라오도록 스크롤해, 다음 내용을 보기 위해 수동으로 스크롤할 필요가 없게 한다.
        scrollLineToTop(index);
      }
    }
  };

  useEffect(() => {
    if (phase !== "dialogue") return;
    let cancelled = false;

    const runDialogue = async () => {
      for (let i = 0; i < phishingCase.phoneDialogue.length; i++) {
        if (cancelled) return;
        setRevealedCount(i + 1);
        const line = phishingCase.phoneDialogue[i];
        if (line.speaker === "caller") {
          await playLine(i, line.text);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 900));
        }
      }
      if (!cancelled) setPhase("quiz");
    };

    runDialogue();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phishingCase.id]);

  const playDing = () => {
    if (mutedRef.current) return;
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playNote = (freq: number, start: number, duration: number, peak: number) => {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(peak, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    playNote(1318.51, 0, 0.5, 0.25); // 띵
    playNote(1046.5, 0.15, 0.6, 0.22); // 동
    setTimeout(() => ctx.close(), 900);
  };

  const playBuzz = () => {
    if (mutedRef.current) return;
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 880; // 땡
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.45);

    setTimeout(() => ctx.close(), 600);
  };

  const handleSelect = (choiceIndex: number) => {
    if (answers[quizIndex] !== null) return;
    const next = [...answers];
    next[quizIndex] = choiceIndex;
    setAnswers(next);

    if (choiceIndex === currentQuestion?.answerIndex) {
      playDing();
    } else {
      playBuzz();
    }

    setTimeout(() => {
      if (quizIndex + 1 < phishingCase.quiz.length) {
        setQuizIndex((i) => i + 1);
      } else {
        setPhase("complete");
      }
    }, 900);
  };

  const handleRestart = () => {
    setAnswers(Array(phishingCase.quiz.length).fill(null));
    setQuizIndex(0);
    setRevealedCount(0);
    setPhase("dialogue");
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div
        className="relative shrink-0 px-4 text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
        style={{
          backgroundImage: HEADER_GRADIENT,
          paddingTop: "clamp(16px, 5cqh, 21px)",
          paddingBottom: phase === "complete" ? "clamp(14px, 4cqh, 20px)" : "clamp(24px, 7cqh, 34px)",
        }}
      >
        <button
          type="button"
          aria-label="종료"
          onClick={() => setShowExitModal(true)}
          className="absolute top-5 left-6.5 cursor-pointer text-white/90"
        >
          <FiX size="clamp(15px, 4.5cqw, 21px)" />
        </button>
        {phase !== "complete" && (
          <button
            type="button"
            aria-label={muted ? "음소거 해제" : "음소거"}
            onClick={() => setMuted((m) => !m)}
            className={`absolute top-5 right-6.5 cursor-pointer ${muted ? "text-gray-500" : "text-white"}`}
          >
            {muted ? (
              <IoVolumeMute size="clamp(15px, 5cqw, 21px)" />
            ) : (
              <IoVolumeHigh size="clamp(15px, 5cqw, 21px)" />
            )}
          </button>
        )}

        <div className="flex flex-col items-center" style={{ gap: "clamp(10px, 3cqh, 15px)" }}>
          <div
            className={`flex h-8 items-center gap-1.5 rounded-full border-[1.5px] px-4 ${
              phase === "complete" ? "border-[#60a5fa]/30 bg-[#60a5fa]/10" : "border-[#df1e21]/30 bg-[#df1e21]/10"
            }`}
          >
            <span className={`size-1.5 rounded-full ${phase === "complete" ? "bg-[#60a5fa]" : "animate-pulse bg-[#df1e21]"}`} />
            <span className={`text-sm font-semibold ${phase === "complete" ? "text-[#60a5fa]" : "text-[#df1e21]"}`}>
              {phase === "complete" ? "시뮬레이션 완료" : "통화중"}
            </span>
          </div>

          <p className="text-center font-extrabold" style={{ fontSize: "clamp(15px, 4.2cqw, 18px)" }}>
            시나리오 : {phishingCase.title}
          </p>

          {phase === "complete" ? (
            <p className="text-sm font-bold">
              올바른 대응 <span className="text-[#60a5fa]">{correctCount}</span>
              <span className="text-white/50"> / {phishingCase.quiz.length}회</span>
            </p>
          ) : (
            <CallWaveform active={playingLineIndex !== null} />
          )}
        </div>
      </div>

      {phase !== "complete" ? (
        <>
          <div ref={dialogueScrollRef} className="no-scrollbar flex-1 overflow-y-auto">
            <div className="flex flex-col gap-5 px-9.5 py-5">
              {phishingCase.phoneDialogue.slice(0, revealedCount).map((line, i) => {
                const isSpeaking = playingLineIndex === i;
                return line.speaker === "caller" ? (
                  <div
                    key={i}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    className="bubble-enter flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#1a2332]">
                        <BsFillPersonFill className="text-white" size={13} />
                      </span>
                      <p className="text-sm font-bold text-[#1a2332]">{phishingCase.callerLabel}</p>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-tr-xl rounded-br-xl rounded-bl-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#1a2332] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] ${
                        isSpeaking ? "border-[rgba(255,0,0,0.3)]" : "border-transparent"
                      }`}
                    >
                      {line.text}
                    </div>
                    <button
                      type="button"
                      onClick={() => playLine(i, line.text)}
                      className="flex cursor-pointer items-center gap-1 text-xs font-bold text-gray-600 [@media(hover:hover)_and_(pointer:fine)]:hover:text-gray-800"
                    >
                      <MdOutlineReplay size={15} className={playingLineIndex === i ? "animate-spin" : ""} />
                      다시 듣기
                    </button>
                  </div>
                ) : (
                  <div
                    key={i}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    className="bubble-enter flex justify-end"
                  >
                    <div className="max-w-[85%] rounded-tl-xl rounded-br-xl rounded-bl-xl bg-white px-3.5 py-2.5 text-sm text-[#1a2332] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                      {line.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {phase === "quiz" && currentQuestion && (
            <div className="shrink-0 px-[18px] pb-[15px]">
              <QuizCard question={currentQuestion} selected={answers[quizIndex]} onSelect={handleSelect} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="no-scrollbar flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3.5 px-4 py-5">
              {phishingCase.quiz.map((q, i) => {
                const chosen = answers[i];
                const isCorrect = chosen === q.answerIndex;
                return (
                  <div key={q.id} className="rounded-xl bg-white p-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-col items-center gap-3.5 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="flex h-5.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1a2332] px-2.5 text-xs font-bold text-[#1a2332]">
                          선택{i + 1}
                        </span>
                        <p className="text-sm font-semibold text-[#1a2332]">{q.question}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 rounded-lg px-6 py-2 text-xs font-bold text-white ${
                          isCorrect ? "bg-[#00bc7d]" : "bg-[#df1e21]"
                        }`}
                      >
                        {isCorrect ? <IoCheckmark size={16} /> : <IoClose size={16} />}
                        {chosen !== null ? q.choices[chosen] : "선택하지 않음"}
                      </div>
                      <p className={`text-sm font-bold ${isCorrect ? "text-[#00bc7d]" : "text-[#df1e21]"}`}>
                        {isCorrect ? "정확합니다!" : "위험합니다"}
                      </p>
                      <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                        <p className="text-xs leading-relaxed text-gray-700">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 border-t border-gray-200 bg-white px-4 py-3.5">
            <button
              type="button"
              onClick={handleRestart}
              className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-600 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
            >
              <MdOutlineReplay size={16} />
              다시 하기
            </button>
            <button
              type="button"
              disabled
              className="flex h-11 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-[#1a2035] text-sm font-bold text-white opacity-50"
            >
              <HiSparkles size={15} />
              AI 분석 결과 보기 (준비중)
            </button>
            <button
              type="button"
              disabled
              className="flex h-11 cursor-not-allowed items-center justify-center rounded-lg border border-[#1a2035] text-sm font-semibold text-[#1a2332] opacity-50"
            >
              마무리 퀴즈 하러 가기 (준비중)
            </button>
          </div>
        </>
      )}

      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          style={{ padding: "clamp(20px, 8cqw, 40px)" }}
          onClick={() => setShowExitModal(false)}
        >
          <div
            className="flex w-full flex-col items-center justify-center rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
            style={{
              maxWidth: "clamp(280px, 90cqw, 360px)",
              height: "clamp(160px, 60cqw, 206px)",
              padding: "clamp(18px, 7cqw, 26px) clamp(20px, 8cqw, 40px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex flex-col gap-2">
                <p className="font-bold text-[#1a2332]" style={{ fontSize: "clamp(17px, 5.5cqw, 22px)" }}>
                  학습을 종료하시겠습니까?
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  현재 진행 중인 시뮬레이션은 종료되며, 다음에 다시 시작할 경우 처음부터 진행됩니다.
                </p>
              </div>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playTokenRef.current++;
                    audioRef.current?.pause();
                    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
                    router.push(ROUTES.scenario(caseId));
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
                  style={{ height: "clamp(36px, 12cqw, 44px)" }}
                >
                  종료하기
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-gray-700 text-sm font-bold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800"
                  style={{ height: "clamp(36px, 12cqw, 44px)" }}
                >
                  계속하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
