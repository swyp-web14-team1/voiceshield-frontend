"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsFillPersonFill } from "react-icons/bs";
import { ROUTES } from "@/lib/routes";
import { getCaseById } from "@/lib/mock-cases";
import { getStoredTtsPreference, prefetchTts } from "@/lib/tts";

const ACTION_BUTTON_SIZE = "clamp(56px, 18cqw, 75px)";
const ACTION_ICON_SIZE = "clamp(22px, 6cqw, 30px)";
const CALL_END_ICON_WIDTH = "clamp(27px, 8cqw, 37px)";
// 무음 44바이트 WAV. 모바일 브라우저는 오디오/TTS 재생을 "사용자 제스처와 동일한 이벤트" 안에서 시작해야만
// 허용한다 — 통화 진행 화면(call/progress)의 대사 재생은 useEffect 안에서 fetch 이후에 시작되므로 이 조건을
// 만족하지 못해 조용히 막히고, 결국 매 대사마다 강제 타임아웃(15초)까지 멈춰 있는 것처럼 보이는 문제가 있었다.
// "시작하기" 버튼 클릭(진짜 사용자 제스처) 안에서 무음을 한 번 재생해두면 이후 같은 세션에서 만들어지는
// Audio/speechSynthesis 재생이 모두 잠금 해제된다.
const SILENT_WAV = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

function unlockMobileAudio() {
  try {
    new Audio(SILENT_WAV).play().catch(() => {});
  } catch {
    // ignore
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    } catch {
      // ignore
    }
  }
}

export default function IncomingCallPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();

  // 통화 진행 화면으로 넘어가자마자 첫 대사가 바로 들리도록, 벨이 울리는 동안 미리 TTS를 요청해둔다.
  useEffect(() => {
    const phishingCase = getCaseById(caseId);
    const firstLine = phishingCase?.phoneDialogue.find((line) => line.speaker === "caller");
    if (!firstLine) return;
    const { voice, rate } = getStoredTtsPreference();
    prefetchTts(firstLine.text, voice, rate).catch(() => {});
  }, [caseId]);

  return (
    <div
      className="no-scrollbar flex h-full flex-col items-center overflow-y-auto"
      style={{ backgroundImage: "linear-gradient(120deg, #1a2035 0%, #2d1f4e 100%)", paddingBottom: "clamp(50px, 12cqh, 123px)" }}
    >
      <div className="flex flex-col items-center" style={{ marginTop: "clamp(58px, 12cqh, 110px)" }}>
        <p className="text-sm font-medium text-white">수신 전화</p>

        <div
          className="flex items-center justify-center rounded-full border-2 border-[#df1e21] bg-white/35"
          style={{ width: "clamp(88px, 24cqw, 113px)", height: "clamp(88px, 24cqw, 113px)", marginTop: "clamp(16px, 6cqh, 24px)" }}
        >
          <BsFillPersonFill className="text-white" style={{ width: "52%", height: "52%" }} />
        </div>

        <p
          className="font-semibold text-white"
          style={{ fontSize: "calc(var(--font-scale, 1) * clamp(18px, 6cqw, 24px))", marginTop: "clamp(16px, 6cqh, 24px)" }}
        >
          010-****-1234
        </p>
        <p className="text-sm font-medium text-[#df1e21]" style={{ marginTop: "clamp(4px, 2cqh, 8px)" }}>
          알 수 없는 번호
        </p>
      </div>

      <div className="flex-1" />

      <p className="text-base font-medium text-white">*체험용 시뮬레이션 입니다</p>

      <div
        className="flex w-full items-center justify-between"
        style={{ marginTop: "clamp(32px, 8cqh, 56px)", paddingInline: "clamp(40px, 17cqw, 96px)" }}
      >
        <button
          type="button"
          onClick={() => router.push(ROUTES.scenario(caseId))}
          className="flex flex-col items-center"
          style={{ gap: "clamp(10px, 3cqh, 16px)" }}
        >
          <span
            className="flex items-center justify-center rounded-full bg-[#df1e21]"
            style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}
          >
            <Image src="/callend.svg" alt="" width={32} height={32} style={{ width: CALL_END_ICON_WIDTH, height: "auto" }} />
          </span>
          <span className="text-base font-bold text-gray-200">종료하기</span>
        </button>

        <button
          type="button"
          onClick={() => {
            unlockMobileAudio();
            router.push(ROUTES.callProgress(caseId));
          }}
          className="flex flex-col items-center"
          style={{ gap: "clamp(10px, 3cqh, 16px)" }}
        >
          <span className="relative flex items-center justify-center" style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}>
            <span
              className="call-ring-pulse absolute inset-0 rounded-full border-[#00bc7d]"
              style={{ animationDelay: "0s", borderWidth: "clamp(9.8px, 3cqw, 11px)" }}
            />
            <span
              className="call-ring-pulse absolute inset-0 rounded-full border-[#00bc7d]"
              style={{ animationDelay: "0.7s", borderWidth: "clamp(9.8px, 3cqw, 11px)" }}
            />
            <span
              className="call-ring-pulse absolute inset-0 rounded-full border-[#00bc7d]"
              style={{ animationDelay: "1.4s", borderWidth: "clamp(9.8px, 3cqw, 11px)" }}
            />
            
            <span
              className="relative flex items-center justify-center rounded-full bg-[#00bc7d]"
              style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}
            >
              <Image src="/call.svg" alt="" width={30} height={30} style={{ width: ACTION_ICON_SIZE, height: ACTION_ICON_SIZE }} />
            </span>
          </span>
          <span className="text-base font-bold text-gray-200">시작하기</span>
        </button>
      </div>
    </div>
  );
}
