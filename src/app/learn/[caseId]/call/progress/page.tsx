"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX } from "react-icons/fi";
import { MdOutlineReplay, MdCancel } from "react-icons/md";
import { BsFillPersonFill } from "react-icons/bs";
import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { RiCheckboxCircleFill, RiShiningLine } from "react-icons/ri";
import { getCaseById, CASE_CATEGORY_LABEL } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";
import { getStoredTtsPreference, prefetchTts } from "@/lib/tts";
import { WAVEFORM_BAR_PATHS } from "@/lib/waveform-bars";
import { saveAnalysisInput } from "@/lib/analysis";
import { recordCaseProgress } from "@/lib/progress";
import { useStudyTimeTracker } from "@/lib/daily-stats";
import { QuizCard } from "@/components/learn/QuizCard";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";

type Phase = "dialogue" | "quiz" | "complete";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";
// 오디오 재생 대사 1개당 최대 대기 시간. 모바일 브라우저(특히 iOS Safari)에서 speechSynthesis의
// onend/onerror가 아예 발화하지 않는 경우가 실제로 있어, 이 시간이 지나면 강제로 다음으로 넘어간다.
const PLAYBACK_TIMEOUT_MS = 15_000;

function withTimeout(promise: Promise<void>, ms: number): Promise<void> {
  return Promise.race([promise, new Promise<void>((resolve) => setTimeout(resolve, ms))]);
}

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


export default function CallSimulationProgressPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const phishingCase = getCaseById(caseId);
  if (!phishingCase) notFound();

  useStudyTimeTracker();

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
  const exitedRef = useRef(false);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dialogueScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    recordCaseProgress(caseId, phase);
  }, [caseId, phase]);

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


  useEffect(() => {
    if (phase !== "quiz" || lastCallerIndex < 0) return;
    const raf = requestAnimationFrame(() => scrollLineToTop(lastCallerIndex));
    return () => cancelAnimationFrame(raf);
  }, [phase, lastCallerIndex]);

  const playLine = async (index: number, text: string) => {
    const token = ++playTokenRef.current;
    if (mutedRef.current || exitedRef.current) return;
    audioRef.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlayingLineIndex(index);

    let audio: HTMLAudioElement | null = null;
    let url: string | null = null;

    try {
      const { voice, rate } = getStoredTtsPreference();

      const blob = await prefetchTts(text, voice, rate);
      url = URL.createObjectURL(blob);
      if (token !== playTokenRef.current) throw new Error("superseded");

      audio = new Audio(url);
      audioRef.current = audio;
      const currentAudio = audio;
      const ended = new Promise<void>((resolve) => {
        currentAudio.onended = () => resolve();
        currentAudio.onerror = () => resolve();

        currentAudio.onpause = () => resolve();
      });
      await audio.play();
      if (token !== playTokenRef.current) throw new Error("superseded");
      await withTimeout(ended, PLAYBACK_TIMEOUT_MS);
    } catch {

      if (audio) {
        audio.pause();
        audio.src = "";
      }
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (token !== playTokenRef.current) return;
      const { rate } = getStoredTtsPreference();
      await withTimeout(
        new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ko-KR";
          utterance.rate = rate;
          const koreanVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
          if (koreanVoice) utterance.voice = koreanVoice;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        }),
        PLAYBACK_TIMEOUT_MS,
      );
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (token === playTokenRef.current) {
        setPlayingLineIndex(null);

        scrollLineToTop(index);
      }
    }
  };

  useEffect(() => {
    if (phase !== "dialogue") return;
    let cancelled = false;

    const runDialogue = async () => {
      for (let i = 0; i < phishingCase.phoneDialogue.length; i++) {
        if (cancelled || exitedRef.current) return;
        setRevealedCount(i + 1);
        const line = phishingCase.phoneDialogue[i];
        if (line.speaker === "caller") {
          await playLine(i, line.text);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 900));
        }
        if (cancelled || exitedRef.current) return;
      }
      if (!cancelled && !exitedRef.current) setPhase("quiz");
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

    playNote(1318.51, 0, 0.5, 0.25); 
    playNote(1046.5, 0.15, 0.6, 0.22); 
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
    osc.frequency.value = 880;
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
          paddingTop: "27px",
          paddingBottom: phase === "complete" ? "clamp(14px, 4cqh, 20px)" : "clamp(24px, 7cqh, 34px)",
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

        <div className="flex flex-col items-center">
          <div
            className={`flex h-[clamp(24px,6.5cqw,30px)] items-center gap-1.5 rounded-full border-[1.5px] px-[clamp(10px,3cqw,14px)] ${
              phase === "complete" ? "border-[#60a5fa]/30 bg-[#60a5fa]/10" : "border-[#df1e21]/30 bg-[#df1e21]/10"
            }`}
          >
            <span
              className={`size-[clamp(4px,1.2cqw,6px)] rounded-full ${phase === "complete" ? "bg-[#60a5fa]" : "animate-pulse bg-[#df1e21]"}`}
            />
            <span
              className={`text-[clamp(11px,3cqw,13px)] font-semibold ${phase === "complete" ? "text-[#60a5fa]" : "text-[#df1e21]"}`}
            >
              {phase === "complete" ? "시뮬레이션 완료" : "통화중"}
            </span>
          </div>

          <p
            className="text-center font-extrabold"
            style={{ fontSize: "clamp(15px, 4.2cqw, 18px)", marginTop: "clamp(10px, 3cqh, 15px)" }}
          >
            시나리오 : {phishingCase.title}
          </p>

          {phase === "complete" ? (
            <p className="text-sm font-medium" style={{ marginTop: "5px" }}>
              올바른 대응 <span className="text-[#60a5fa]">{correctCount}</span>
              <span className="text-white/50"> / {phishingCase.quiz.length}회</span>
            </p>
          ) : (
            <div style={{ marginTop: "clamp(10px, 3cqh, 15px)" }}>
              <CallWaveform active={playingLineIndex !== null} />
            </div>
          )}
        </div>
      </div>

      {phase !== "complete" ? (
        <>
          <div key="dialogue" ref={dialogueScrollRef} className="no-scrollbar flex-1 overflow-y-auto">
            <div className="flex flex-col gap-5 px-[clamp(16px,8cqw,32px)] py-5">
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
            <div className="shrink-0 px-4.25 pt-3.5 pb-3.75">
              <QuizCard question={currentQuestion} selected={answers[quizIndex]} onSelect={handleSelect} />
            </div>
          )}
        </>
      ) : (
        <>
          <div key="complete" className="no-scrollbar flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3.5 px-4.25 py-3.5">
              {phishingCase.quiz.map((q, i) => {
                const chosen = answers[i];
                const isCorrect = chosen === q.answerIndex;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl bg-white px-6.25 pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
                    style={{ paddingTop: "clamp(20px, 6cqw, 34px)" }}
                  >
                    <div className="flex flex-col items-center gap-3.5 text-center">
                      <div className="flex w-full items-start gap-2">
                        <span className="flex h-[clamp(20px,5.5cqw,22px)] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1a2332] px-[clamp(6px,2cqw,8px)] text-[clamp(10px,2.8cqw,12px)] font-bold text-[#1a2332]">
                          선택{i + 1}
                        </span>
                        <p className="break-keep text-left text-sm font-semibold text-[#1a2332]">{q.question}</p>
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
                        <span className="break-keep leading-tight">{chosen !== null ? q.choices[chosen] : "선택하지 않음"}</span>
                      </div>
                      <p className={`text-sm font-bold ${isCorrect ? "text-[#00bc7d]" : "text-[#df1e21]"}`}>
                        {isCorrect ? "정확합니다!" : "위험합니다"}
                      </p>
                      <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                        <p className="text-left text-xs leading-relaxed text-gray-700">{q.explanation}</p>
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
              className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-500 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#1a2035]"
            >
              <MdOutlineReplay size={16} />
              다시 하기
            </button>
            <button
              type="button"
              onClick={() => {
                saveAnalysisInput(caseId, {
                  caseTitle: phishingCase.title,
                  category: CASE_CATEGORY_LABEL[phishingCase.category],
                  quiz: phishingCase.quiz,
                  answers,
                });
                router.push(ROUTES.callAnalysis(caseId));
              }}
              className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#1a2035] text-sm font-semibold text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#212841]"
            >
              <RiShiningLine size={15} />
              AI 분석 결과 보기
            </button>
            <div className="rounded-lg p-[1.5px]" style={{ backgroundImage: HEADER_GRADIENT }}>
              <button
                type="button"
                onClick={() => router.push(ROUTES.callQuiz(caseId))}
                className="flex h-10.25 w-full cursor-pointer items-center justify-center rounded-[7px] bg-white text-sm font-semibold text-[#1a2035] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
              >
                마무리 퀴즈 하러 가기
              </button>
            </div>
          </div>
        </>
      )}

      <ExitConfirmModal
        open={showExitModal}
        onExit={() => {
          exitedRef.current = true;
          playTokenRef.current++;
          audioRef.current?.pause();
          if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
          router.push(ROUTES.scenario(caseId));
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
