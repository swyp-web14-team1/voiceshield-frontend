"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { FiUser } from "react-icons/fi";
import { BiPhoneCall } from "react-icons/bi";
import { MdCallEnd } from "react-icons/md";
import { ROUTES } from "@/lib/routes";

const ACTION_BUTTON_SIZE = "clamp(56px, 18cqw, 75px)";
const ACTION_ICON_SIZE = "clamp(22px, 6cqw, 30px)";

export default function IncomingCallPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();

  return (
    <div
      className="no-scrollbar flex h-full flex-col items-center overflow-y-auto"
      style={{ backgroundImage: "linear-gradient(120deg, #1a2035 0%, #2d1f4e 100%)", paddingBottom: "clamp(50px, 12cqh, 123px)" }}
    >
      <div className="flex flex-col items-center" style={{ marginTop: "clamp(48px, 12cqh, 82px)" }}>
        <p className="text-sm font-medium text-white">수신 전화</p>

        <div
          className="flex items-center justify-center rounded-full border-2 border-[#df1e21] bg-gray-500"
          style={{ width: "clamp(88px, 24cqw, 113px)", height: "clamp(88px, 24cqw, 113px)", marginTop: "clamp(16px, 6cqh, 24px)" }}
        >
          <FiUser className="text-white" style={{ width: "45%", height: "45%" }} />
        </div>

        <p
          className="font-bold text-white"
          style={{ fontSize: "calc(var(--font-scale, 1) * clamp(18px, 6cqw, 24px))", marginTop: "clamp(16px, 6cqh, 24px)" }}
        >
          010-****-1234
        </p>
        <p className="text-sm font-semibold text-[#df1e21]" style={{ marginTop: "clamp(4px, 2cqh, 8px)" }}>
          알 수 없는 번호
        </p>
      </div>

      <div className="flex-1" />

      <p className="text-base font-semibold text-white">*체험용 시뮬레이션 입니다</p>

      <div
        className="flex w-full items-center justify-between"
        style={{ marginTop: "clamp(32px, 8cqh, 56px)", paddingInline: "clamp(40px, 18cqw, 96px)" }}
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
            <MdCallEnd className="text-white" style={{ width: ACTION_ICON_SIZE, height: ACTION_ICON_SIZE }} />
          </span>
          <span className="text-base font-bold text-gray-200">종료하기</span>
        </button>

        <button
          type="button"
          onClick={() => router.push(ROUTES.scenario(caseId))}
          className="flex flex-col items-center"
          style={{ gap: "clamp(10px, 3cqh, 16px)" }}
        >
          <span className="relative flex items-center justify-center" style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}>
            <span
              className="call-ring-pulse absolute inset-0 rounded-full border-[#00bc7d]"
              style={{ animationDelay: "0s", borderWidth: "9.8px" }}
            />
            <span
              className="call-ring-pulse absolute inset-0 rounded-full border-[#00bc7d]"
              style={{ animationDelay: "0.7s", borderWidth: "9.8px" }}
            />
            <span
              className="call-ring-pulse absolute inset-0 rounded-full border-[#00bc7d]"
              style={{ animationDelay: "1.4s", borderWidth: "9.8px" }}
            />
            <span
              className="relative flex items-center justify-center rounded-full bg-[#00bc7d]"
              style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}
            >
              <BiPhoneCall className="text-white" style={{ width: ACTION_ICON_SIZE, height: ACTION_ICON_SIZE }} />
            </span>
          </span>
          <span className="text-base font-bold text-gray-200">시작하기</span>
        </button>
      </div>
    </div>
  );
}
