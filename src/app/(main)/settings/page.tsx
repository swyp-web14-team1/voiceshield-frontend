"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { IoVolumeMedium, IoVolumeMediumOutline } from "react-icons/io5";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { BackHeader } from "@/components/layout/BackHeader";
import { ChatBubbleIcon, ArrowIcon } from "@/components/icons/kakao-icons";
import { FONT_SIZES, useFontScale } from "@/components/providers/FontScaleProvider";

const FONT_SIZE_TEXT_CLASS: Record<(typeof FONT_SIZES)[number], string> = {
  보통: "text-[12px]",
  크게: "text-[14px]",
  아주크게: "text-[16px]",
};
const REMINDER_STORAGE_KEY = "voiceshield-reminder-on";
const REMINDER_HOUR_STORAGE_KEY = "voiceshield-reminder-hour";
const REMINDER_MINUTE_STORAGE_KEY = "voiceshield-reminder-minute";
const TTS_SPEEDS = ["X 0.5", "X 1.0", "X 1.5", "X 2.0"] as const;
const TTS_VOICES = ["V1", "V2", "V3", "V4"] as const;
const PREVIEW_TEXT = "안녕하세요, 보이스쉴드입니다. 피싱 예방 교육을 시작할게요.";


const FALLBACK_PITCH: Record<(typeof TTS_VOICES)[number], number> = {
  V1: 1.15,
  V2: 0.95,
  V3: 0.6,
  V4: 0.45,
};

function playWithBrowserTts(
  voice: (typeof TTS_VOICES)[number],
  rate: number,
  onStart: () => void,
  onEnd: () => void,
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(PREVIEW_TEXT);
  utterance.lang = "ko-KR";
  utterance.rate = rate;
  utterance.pitch = FALLBACK_PITCH[voice];
  const koreanVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
  if (koreanVoice) utterance.voice = koreanVoice;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

function PillButton({
  label,
  selected,
  onClick,
  rounded = "full",
  width = "min-w-13.75",
  textClassName = "text-xs",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  rounded?: "full" | "sm";
  width?: string;
  textClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7.5 ${width} shrink-0 items-center justify-center px-2.5 ${textClassName} font-semibold shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-colors ${
        rounded === "full" ? "rounded-full" : "rounded-[5px]"
      } ${
        selected
          ? "text-white"
          : "bg-gray-100 text-gray-800 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-200"
      }`}
      style={selected ? { backgroundImage: "linear-gradient(90deg, #60a5fa 0%, #2849be 100%)" } : undefined}
    >
      {label}
    </button>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-xl bg-white px-4.75 pt-3.75 pb-4.75 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { fontSize, setFontSize } = useFontScale();
  const [ttsSpeed, setTtsSpeed] = useState<(typeof TTS_SPEEDS)[number]>("X 1.0");
  const [ttsVoice, setTtsVoice] = useState<(typeof TTS_VOICES)[number]>("V1");
  const [playingVoice, setPlayingVoice] = useState<(typeof TTS_VOICES)[number] | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<(typeof TTS_VOICES)[number] | null>(null);
  const [reminderOn, setReminderOn] = useState(false);
  const [hour, setHour] = useState(23);
  const [minute, setMinute] = useState(50);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (localStorage.getItem(REMINDER_STORAGE_KEY) === "true") {
      setReminderOn(true);
    }
    const storedHour = localStorage.getItem(REMINDER_HOUR_STORAGE_KEY);
    const storedMinute = localStorage.getItem(REMINDER_MINUTE_STORAGE_KEY);
    const now = new Date();
    setHour(storedHour ? Number(storedHour) : now.getHours());
    setMinute(storedMinute ? Number(storedMinute) : now.getMinutes());
    if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const changeHour = (delta: number) => {
    setHour((h) => {
      const next = (h + delta + 24) % 24;
      localStorage.setItem(REMINDER_HOUR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const changeMinute = (delta: number) => {
    setMinute((m) => {
      const next = (m + delta + 60) % 60;
      localStorage.setItem(REMINDER_MINUTE_STORAGE_KEY, String(next));
      return next;
    });
  };

  // 앱(탭)이 열려 있는 동안에만 동작하는 로컬 알림 예약 — 매일 지정 시각에 도달하면 알림을 띄우고 다음 날로 재예약한다.
  useEffect(() => {
    if (!isLoggedIn || !reminderOn) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const now = new Date();
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);

      timeoutId = setTimeout(() => {
        const notification = new Notification("보이스쉴드 학습 알림", {
          body: "오늘의 피싱 예방 학습을 시작해보세요!",
          icon: "/logo.svg",
        });
        notification.onclick = () => {
          window.focus();
          router.push(ROUTES.home);
          notification.close();
        };
        scheduleNext();
      }, next.getTime() - now.getTime());
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [isLoggedIn, reminderOn, hour, minute, router]);

  const handleToggleReminder = async () => {
    if (!isLoggedIn) {
      setShowLoginRequired(true);
      return;
    }

    const turningOn = !reminderOn;
    setReminderOn(turningOn);
    localStorage.setItem(REMINDER_STORAGE_KEY, String(turningOn));
    if (!turningOn) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        await Notification.requestPermission();
      } catch {
      }
    }

    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone =
      typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
    if (isMobile && !isStandalone) {
      setShowInstallGuide(true);
    }
  };

  const handlePlayVoice = async (voice: (typeof TTS_VOICES)[number]) => {
    audioRef.current?.pause();
    setPlayingVoice(null);
    if (loadingVoice) return;
    setLoadingVoice(voice);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: PREVIEW_TEXT, voice, rate: parseFloat(ttsSpeed.replace("X ", "")) || 1 }),
      });
      if (!res.ok) throw new Error("TTS request failed");

      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setPlayingVoice(voice);
      audio.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      const rate = parseFloat(ttsSpeed.replace("X ", "")) || 1;
      playWithBrowserTts(
        voice,
        rate,
        () => setPlayingVoice(voice),
        () => setPlayingVoice(null),
      );
    } finally {
      setLoadingVoice(null);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="설정" backHref={ROUTES.home} />

      <div className="no-scrollbar flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-6">
        <SettingsCard>
          <p className="text-center text-sm font-bold text-[#1a2332]">글자 크기 조정</p>
          <hr className="border-gray-200" />
          <div className="flex items-center justify-center gap-3">
            {FONT_SIZES.map((size) => (
              <PillButton
                key={size}
                label={size}
                selected={fontSize === size}
                onClick={() => setFontSize(size)}
                rounded="sm"
                width="w-[clamp(50px,25cqw,100px)]"
                textClassName={FONT_SIZE_TEXT_CLASS[size]}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard>
          <p className="text-center text-sm font-bold text-[#1a2332]">TTS 속도 변경</p>
          <hr className="border-gray-200" />
          <div className="flex items-center justify-center gap-2.5">
            {TTS_SPEEDS.map((speed) => (
              <PillButton key={speed} label={speed} selected={ttsSpeed === speed} onClick={() => setTtsSpeed(speed)} />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard>
          <p className="text-center text-sm font-bold text-[#1a2332]">
            TTS 음성 설정 <span className="text-xs font-medium text-gray-500">재생 및 선택 가능</span>
          </p>
          <hr className="border-gray-200" />
          <div className="flex items-center justify-center gap-2.5">
            {TTS_VOICES.map((voice) => {
              const selected = ttsVoice === voice;
              const playing = playingVoice === voice;
              return (
                <div key={voice} className="flex flex-col items-center gap-1.5">
                  <PillButton
                    label={voice}
                    selected={selected}
                    onClick={() => {
                      setTtsVoice(voice);
                      handlePlayVoice(voice);
                    }}
                  />
                  <button
                    type="button"
                    aria-label={`${voice} 미리듣기`}
                    aria-pressed={playing}
                    onClick={() => {
                      setTtsVoice(voice);
                      handlePlayVoice(voice);
                    }}
                    className={`flex items-center justify-center rounded-full border px-3 py-0.25 transition-colors ${
                      playing ? "border-gray-400 text-gray-400" : "border-gray-200  text-gray-400"
                    }`}
                  >
                    {playing ? <IoVolumeMedium size={14} /> : <IoVolumeMediumOutline size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        </SettingsCard>

        <SettingsCard>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#1a2332]">매일 학습 알림</p>
              <p className="text-xs text-gray-500">
                {isLoggedIn ? `알림이 ${reminderOn ? "활성화" : "비활성화"}되어 있습니다` : "로그인 후 이용 가능합니다"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isLoggedIn && reminderOn}
              onClick={handleToggleReminder}
              className={`relative h-7 w-13 shrink-0 rounded-xl shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-colors ${
                isLoggedIn && reminderOn ? "bg-[#2563eb]" : "bg-gray-300"
              } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`absolute top-0.75 left-0.75 size-5.5 rounded-full bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.2)] transition-transform ${
                  isLoggedIn && reminderOn ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </SettingsCard>

        {isLoggedIn && reminderOn && (
          <SettingsCard>
            <p className="text-center text-sm font-bold text-[#1a2332]">알림 시간</p>
            <hr className="border-gray-200" />
            <div className="flex items-center justify-center gap-3.75">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    aria-label="시 증가"
                    onClick={() => changeHour(1)}
                    className="flex size-5.75 items-center justify-center rounded-full bg-gray-200 text-gray-600"
                  >
                    <FiChevronUp size={14} />
                  </button>
                  <div className="flex h-10.75 w-15 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
                    <p className="text-xl font-bold text-black">{String(hour).padStart(2, "0")}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="시 감소"
                    onClick={() => changeHour(-1)}
                    className="flex size-5.75 items-center justify-center rounded-full bg-gray-200 text-gray-600"
                  >
                    <FiChevronDown size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">시</p>
              </div>
              <p className="text-2xl font-bold text-black">:</p>
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    aria-label="분 증가"
                    onClick={() => changeMinute(1)}
                    className="flex size-5.75 items-center justify-center rounded-full bg-gray-200 text-gray-600"
                  >
                    <FiChevronUp size={14} />
                  </button>
                  <div className="flex h-10.75 w-15 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
                    <p className="text-xl font-bold text-black">{String(minute).padStart(2, "0")}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="분 감소"
                    onClick={() => changeMinute(-1)}
                    className="flex size-5.75 items-center justify-center rounded-full bg-gray-200 text-gray-600"
                  >
                    <FiChevronDown size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">분</p>
              </div>
            </div>
          </SettingsCard>
        )}

        <div className="flex flex-col gap-6.25">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(AUTH_STORAGE_KEY, "false");
                localStorage.setItem(REMINDER_STORAGE_KEY, "false");
                router.push(ROUTES.login);
              }}
              className="flex items-center justify-center rounded-xl bg-white py-4 text-base font-bold text-[#df1e21] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href={ROUTES.login}
              className="flex items-center justify-center rounded-xl bg-white py-4 text-base font-bold text-blue-600 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
            >
              로그인
            </Link>
          )}
          {isLoggedIn && (
            <Link href={ROUTES.settingsAccount} className="pb-2 text-center text-base font-medium text-gray-600 underline">
              회원 탈퇴
            </Link>
          )}
        </div>
      </div>

      {showInstallGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          style={{ padding: "clamp(20px, 8cqw, 40px)" }}
          onClick={() => setShowInstallGuide(false)}
        >
          <div
            className="w-full max-w-90 rounded-2xl bg-white text-center"
            style={{ padding: "clamp(24px, 10cqw, 40px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-[#1a2332]" style={{ fontSize: "clamp(15px, 4cqw, 18px)" }}>
              홈 화면에 추가해주세요
            </p>
            <p
              className="mt-2.5 text-sm leading-relaxed text-gray-500"
              style={{ fontSize: "clamp(12px, 3.2cqw, 14px)" }}
            >
              매일 학습 알림을 받으려면 보이스쉴드를 홈 화면에 추가해야 해요.
              <br />
              브라우저 메뉴에서 &lsquo;홈 화면에 추가&rsquo; 또는 &lsquo;앱 설치&rsquo;를 선택해주세요.
            </p>
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showLoginRequired && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          style={{ padding: "clamp(20px, 8cqw, 40px)" }}
          onClick={() => setShowLoginRequired(false)}
        >
          <div
            className="relative w-full max-w-90 rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
            style={{ padding: "clamp(24px, 10cqw, 32px) clamp(20px, 8cqw, 28px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setShowLoginRequired(false)}
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
                    localStorage.setItem(AUTH_STORAGE_KEY, "true");
                    setIsLoggedIn(true);
                    setShowLoginRequired(false);
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
      )}

    </div>
  );
}
