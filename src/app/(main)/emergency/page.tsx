"use client";

import { useState } from "react";
import { BiSolidPhoneCall } from "react-icons/bi";
import { FiAlertTriangle } from "react-icons/fi";
import { ROUTES } from "@/lib/routes";
import { BackHeader } from "@/components/layout/BackHeader";

const EMERGENCY_CONTACTS = [
  {
    org: "경찰청",
    number: "112",
    tags: ["#즉시 신고", "#긴급 대응"],
    gradient: "linear-gradient(to top right, #ffcbcc -30%, #df1e21 100%)",
    border: "#f42c2f",
  },
  {
    org: "금융감독원",
    number: "1332",
    tags: ["#금융 사기 상담", "#계좌 정지"],
    gradient: "linear-gradient(to top right, #60a5fa 0%, #2849be 100%)",
    border: "#395cd8",
  },
];

type TipSegment = { text: string; highlight?: boolean };

const DAMAGE_RESPONSE: TipSegment[][] = [
  [{ text: "송금했다면 즉시 은행 콜센터에 " }, { text: "지급정지 요청", highlight: true }],
  [{ text: "속아서 앱을 설치했다면 휴대폰을 " }, { text: "비행기 모드로 전환", highlight: true }],
  [{ text: "가족 / 지인에게 " }, { text: "상황을 공유하고 도움 요청", highlight: true }],
  [{ text: "관련 문자 / 통화 기록", highlight: true }, { text: "은 삭제하지 말고 " }, { text: "보관", highlight: true }],
];

const PREVENTION_TIPS: TipSegment[][] = [
  [{ text: "공공기관은 전화로 계좌 / 비밀번호를 " }, { text: "절대 묻지 않습니다", highlight: true }],
  [{ text: "'안전계좌' 이체 요구", highlight: true }, { text: "는 100% 사기입니다" }],
  [{ text: "링크가 포함된 문자", highlight: true }, { text: "는 누르기 전에 한 번 더 확인하세요" }],
  [{ text: "가족 이름의 " }, { text: "낯선 번호", highlight: true }, { text: "는 반드시 통화로 확인하세요" }],
];

function TipCard({
  title,
  tips,
  accentColor,
  stripColor,
}: {
  title: string;
  tips: TipSegment[][];
  accentColor: string;
  stripColor: string;
}) {
  return (
    <section className="relative mt-3.5 overflow-hidden rounded-xl bg-white pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
      <div
        className="flex flex-col items-center justify-center gap-0.2"
        style={{ backgroundColor: stripColor, height: "clamp(56px, 15cqw, 75px)" }}
      >
        <FiAlertTriangle
          style={{ color: accentColor, width: "clamp(20px, 6cqw, 30px)", height: "clamp(20px, 6cqw, 30px)" }}
        />
        <p className="text-base font-bold" style={{ color: accentColor }}>
          {title}
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-1.75" style={{ paddingInline: "clamp(12px, 4cqw, 34px)" }}>
        {tips.map((segments, i) => (
          <li
            key={i}
            className="break-keep rounded-lg bg-gray-100 text-center text-sm font-semibold text-[#1a2332]"
            style={{ paddingInline: "clamp(12px, 3cqw, 20px)", paddingBlock: "clamp(8px, 2cqw, 14px)" }}
          >
            {segments.map((seg, j) => (
              <span key={j} className={seg.highlight ? "font-bold" : undefined} style={seg.highlight ? { color: accentColor } : undefined}>
                {seg.text}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function EmergencyPage() {
  const [target, setTarget] = useState<{ org: string; number: string } | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="신고 안내" backHref={ROUTES.home} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <p className="pt-2 text-xl font-bold text-[#1a2332]">바로 전화 하기</p>
        <p className="pt-1 pb-3 text-sm text-gray-600">보이스피싱 피해 시 즉시 신고하세요</p>

        <div className="grid grid-cols-2 gap-3.75">
          {EMERGENCY_CONTACTS.map((c) => (
            <button
              key={c.org}
              type="button"
              onClick={() => setTarget(c)}
              className="flex flex-col justify-between rounded-lg border-2 text-left shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
              style={{
                backgroundImage: c.gradient,
                borderColor: c.border,
                height: "clamp(110px, 30cqw, 136px)",
                padding: "clamp(12px, 3.6cqw, 16px)",
              }}
            >
              <div className="font-bold text-white" style={{ fontSize: "clamp(10px, 2.6cqw, 11px)", lineHeight: 1.45 }}>
                {c.tags.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="flex flex-col gap-0">
                <p className="mt-2 -mb-0.5 text-right leading-none font-medium text-white" style={{ fontSize: "clamp(12px, 3.2cqw, 14px)" }}>
                  {c.org}
                </p>
                <div className="flex items-center justify-between">
                  <div
                    className="flex shrink-0 items-center justify-center rounded-full bg-white/25"
                    style={{ width: "clamp(36px, 9.6cqw, 48px)", height: "clamp(36px, 9.6cqw, 48px)" }}
                  >
                    <BiSolidPhoneCall className="text-white" style={{ width: "clamp(18px, 5cqw, 26px)", height: "clamp(18px, 5cqw, 26px)" }} />
                  </div>
                  <p className="font-bold text-white" style={{ fontSize: "clamp(28px, 8cqw, 40px)" }}>
                    {c.number}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <TipCard title="피해 발생 대응" tips={DAMAGE_RESPONSE} accentColor="#df1e21" stripColor="rgba(223,30,33,0.08)" />
        <TipCard title="예방 수칙" tips={PREVENTION_TIPS} accentColor="#2563eb" stripColor="rgba(37,99,235,0.1)" />
      </div>

      {target && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setTarget(null)}
        >
          <div
            className="flex w-full max-w-90 flex-col items-center gap-4.25 rounded-xl bg-white text-center shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
            style={{
              paddingInline: "clamp(24px, 8cqw, 40px)",
              paddingBlock: "clamp(16px, 5.2cqw, 26px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <p className="font-bold text-[#1a2332]" style={{ fontSize: "clamp(18px, 4.8cqw, 24px)" }}>
                신고 안내
              </p>
              <p className="text-base text-gray-600">
                신고를 하시겠습니까?
                <br />
                &apos;신고&apos; 클릭시 실제 전화로 연결됩니다.
              </p>
            </div>
            <div className="flex w-full gap-3.5">
              <button
                type="button"
                onClick={() => setTarget(null)}
                className="flex h-11.25 flex-1 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
              >
                취소
              </button>
              <a
                href={`tel:${target.number}`}
                className="flex h-11.25 flex-1 items-center justify-center rounded-lg bg-[#df1e21] text-sm font-bold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
              >
                신고
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
