"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { FiX } from "react-icons/fi";
import { MdOutlineReplay } from "react-icons/md";
import { BsFillPersonFill } from "react-icons/bs";
import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { fetchCaseDetail } from "@/lib/api/case-data";
import { evaluateChoice } from "@/lib/api/cases";
import { markSimulationComplete } from "@/lib/api/learning";
import { getStoredUserId } from "@/lib/api/client";
import { CASE_CATEGORY_LABEL } from "@/lib/case-meta";
import { ROUTES } from "@/lib/routes";
import { getStoredTtsPreference, prefetchTts, unlockMobileAudio } from "@/lib/tts";
import { WAVEFORM_BAR_PATHS } from "@/lib/waveform-bars";
import { readProgressSnapshot, recordCaseProgress } from "@/lib/progress";
import { useStudyTimeTracker } from "@/lib/daily-stats";
import { QuizCard } from "@/components/learn/QuizCard";
import { ExitConfirmModal } from "@/components/learn/ExitConfirmModal";
import { SimulationCompleteActions } from "@/components/learn/SimulationCompleteActions";
import { QuizResultCard } from "@/components/learn/QuizResultCard";
import type { PhishingCase } from "@/types";

type Phase = "dialogue" | "quiz" | "complete";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";

const PLAYBACK_TIMEOUT_MS = 15_000;
// 음소거 상태에서 대사 하나당 유지할 최소 노출 시간 — 소리가 없다고 대사가 순간이동하듯 한꺼번에
// 넘어가버리면 안 되므로, 실제 재생 시간 대신 이 정도의 텀을 유지한다.
const MUTED_LINE_DELAY_MS = 1_600;

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

  useStudyTimeTracker();

  const [phishingCase, setPhishingCase] = useState<PhishingCase | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>("dialogue");
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
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
    let cancelled = false;
    fetchCaseDetail(caseId)
      .then((c) => {
        if (cancelled) return;
        if (!c) {
          setLoadFailed(true);
          return;
        }
        setPhishingCase(c);

        // "이어하기"로 들어온 경우 중단했던 정확한 지점(화자, 퀴즈 번호, 답변)부터 재개한다.
        const resume = readProgressSnapshot().overrides[caseId]?.resume;
        if (resume && resume.channel === "voice" && resume.answers.length === c.quiz.length) {
          // 선택 직후(900ms 텀) 저장 타이밍과 겹쳐 이미 답한 문항에 quizIndex가 멈춰있을 수 있어 한 칸 보정한다.
          const startIndex =
            resume.quizIndex < c.quiz.length && resume.answers[resume.quizIndex] !== null
              ? resume.quizIndex + 1
              : resume.quizIndex;
          setAnswers(resume.answers);
          setQuizIndex(Math.min(startIndex, c.quiz.length));
          setRevealedCount(resume.revealedCount);
          setPhase(resume.phase === "quiz" || resume.phase === "complete" ? resume.phase : "dialogue");
        } else {
          setAnswers(Array(c.quiz.length).fill(null));
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
    recordCaseProgress(caseId, phase, { channel: "voice", revealedCount, quizIndex, answers });
  }, [caseId, phase, revealedCount, quizIndex, answers, phishingCase]);

  // 수신 전화 화면의 "시작하기" 버튼을 거치지 않고 이 화면에 직접 진입하거나(새로고침 등) 그 제스처의
  // 잠금 해제가 유지되지 않는 브라우저를 위한 보완책 — 이 화면에서 처음 탭/클릭하는 순간에도 한 번 더
  // 오디오/TTS 잠금 해제를 시도한다.
  useEffect(() => {
    const unlock = () => {
      unlockMobileAudio();
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  }, [muted]);


  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const currentQuestion = phishingCase?.quiz[quizIndex];
  const correctCount = phishingCase
    ? answers.filter((answer, i) => answer === phishingCase.quiz[i].answerIndex).length
    : 0;
  const lastDialogueIndex = (phishingCase?.phoneDialogue.length ?? 0) - 1;

  const scrollLineToTop = (index: number) => {
    const container = dialogueScrollRef.current;
    const target = lineRefs.current[index];
    if (!container || !target) return;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: offset, behavior: "smooth" });
  };

  useEffect(() => {
    if (phase !== "quiz" || lastDialogueIndex < 0) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => scrollLineToTop(lastDialogueIndex));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [phase, lastDialogueIndex]);

  const playLine = async (index: number, text: string) => {
    const token = ++playTokenRef.current;
    if (exitedRef.current) return;

    if (mutedRef.current) {
      // 음소거 상태여도 대사가 순간이동하듯 한꺼번에 넘어가면 안 되므로, 소리 없이도 최소한의 텀은 유지한다.
      setPlayingLineIndex(index);
      scrollLineToTop(index);
      await new Promise((resolve) => setTimeout(resolve, MUTED_LINE_DELAY_MS));
      if (token === playTokenRef.current) setPlayingLineIndex(null);
      return;
    }

    audioRef.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlayingLineIndex(index);
    scrollLineToTop(index);

    let url: string | null = null;

    try {
      const { voice, rate } = getStoredTtsPreference();

      const blob = await prefetchTts(text, voice, rate);
      url = URL.createObjectURL(blob);
      if (token !== playTokenRef.current) throw new Error("superseded");
      if (!audioRef.current) audioRef.current = new Audio();
      const currentAudio = audioRef.current;
      currentAudio.src = url;
      currentAudio.load();
      const ended = new Promise<void>((resolve) => {
        currentAudio.onended = () => resolve();
        currentAudio.onerror = () => resolve();
        // 재생 중 음소거를 누르면 이 pause가 즉시 발생하는데, 그대로 바로 resolve하면 지금 보이던
        // 대사가 순간이동하듯 건너뛰어 버린다 — 음소거 상태로 새로 시작하는 대사와 같은 정도의
        // 텀(MUTED_LINE_DELAY_MS)을 준 뒤에 다음으로 넘어가게 한다.
        currentAudio.onpause = () => setTimeout(resolve, MUTED_LINE_DELAY_MS);
      });

      await withTimeout(currentAudio.play(), 4000);
      if (token !== playTokenRef.current) throw new Error("superseded");
      await withTimeout(ended, PLAYBACK_TIMEOUT_MS);
    } catch {

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
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
      }
    }
  };

  useEffect(() => {
    if (phase !== "dialogue" || !phishingCase) return;
    const activeCase = phishingCase;
    let cancelled = false;

    const runDialogue = async () => {
      // "이어하기"로 재개한 경우 이미 본 대사(revealedCount)는 다시 재생하지 않고 그 다음부터 이어간다.
      for (let i = revealedCount; i < activeCase.phoneDialogue.length; i++) {
        if (cancelled || exitedRef.current) return;
        setRevealedCount(i + 1);
        const line = activeCase.phoneDialogue[i];
        if (line.speaker === "caller") {
          if (i === 0) {

            await new Promise((resolve) => setTimeout(resolve, 600));
            if (cancelled || exitedRef.current) return;
          }

          const nextCaller = activeCase.phoneDialogue.slice(i + 1).find((l) => l.speaker === "caller");
          if (nextCaller) {
            const { voice, rate } = getStoredTtsPreference();
            prefetchTts(nextCaller.text, voice, rate).catch(() => {});
          }
          await playLine(i, line.text);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 900));
        }
        if (cancelled || exitedRef.current) return;
      }
      // 백엔드에 판단 퀴즈가 없는 시나리오(scenario-step.quiz가 null)는 퀴즈 단계를 건너뛰고 바로 완료 처리한다.
      if (!cancelled && !exitedRef.current) setPhase(activeCase.quiz.length > 0 ? "quiz" : "complete");
    };

    runDialogue();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phishingCase]);

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
    if (answers[quizIndex] !== null || !phishingCase) return;
    const next = [...answers];
    next[quizIndex] = choiceIndex;
    setAnswers(next);

    if (choiceIndex === currentQuestion?.answerIndex) {
      playDing();
    } else {
      playBuzz();
    }

    const optionId = currentQuestion?.optionIds?.[choiceIndex];
    if (optionId) {
      const answeredIndex = quizIndex;
      evaluateChoice(phishingCase.id, "VOICE", optionId)
        .then((res) => {
          if (res.explanation) {
            setExplanations((prev) => ({ ...prev, [answeredIndex]: res.explanation as string }));
          }
        })
        .catch(() => {});
    }

    setTimeout(() => {
      if (quizIndex + 1 < phishingCase.quiz.length) {
        setQuizIndex((i) => i + 1);
      } else {
        setPhase("complete");
        if (getStoredUserId()) markSimulationComplete(phishingCase.id).catch(() => {});
      }
    }, 900);
  };

  const handleRestart = () => {
    if (!phishingCase) return;
    setAnswers(Array(phishingCase.quiz.length).fill(null));
    setExplanations({});
    setQuizIndex(0);
    setRevealedCount(0);
    setPhase("dialogue");
  };

  if (loadFailed) notFound();
  if (!phishingCase) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

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
                  <QuizResultCard
                    key={q.id}
                    index={i + 1}
                    question={q.question}
                    isCorrect={isCorrect}
                    chosenLabel={chosen !== null ? q.choices[chosen] : "선택하지 않음"}
                    explanation={explanations[i] ?? q.explanation}
                  />
                );
              })}
            </div>
          </div>

          <SimulationCompleteActions
            caseId={caseId}
            onRestart={handleRestart}
            analysisInput={{
              caseTitle: phishingCase.title,
              category: CASE_CATEGORY_LABEL[phishingCase.category],
              quiz: phishingCase.quiz,
              answers,
            }}
          />
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
