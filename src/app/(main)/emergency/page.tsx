"use client";

import { useState } from "react";
import { BiSolidPhoneCall } from "react-icons/bi";
import { IoCheckmarkCircle } from "react-icons/io5";
import { ROUTES } from "@/lib/routes";
import { BackHeader } from "@/components/layout/BackHeader";

const EMERGENCY_CONTACTS = [
  {
    org: "경찰청",
    number: "112",
    tags: ["#즉시 신고", "#긴급 대응"],
    gradient: "linear-gradient(135deg, #e33a3d 0%, #7d2022 100%)",
  },
  {
    org: "금융감독원",
    number: "1332",
    tags: ["#금융 사기 상담", "#계좌 정지"],
    gradient: "linear-gradient(135deg, #60a5fa 0%, #2849be 100%)",
  },
];

const DAMAGE_RESPONSE = [
  "송금했다면 즉시 은행 콜센터에 지급정지 요청",
  "속아서 앱을 설치했다면 휴대폰을 비행기 모드로 전환",
  "가족 / 지인에게 상황을 공유하고 도움 요청",
  "관련 문자 / 통화 기록은 삭제하지 말고 보관",
];

const PREVENTION_TIPS = [
  "공공기관은 전화로 계좌 / 비밀번호를 절대 묻지 않습니다",
  "'안전계좌' 이체 요구는 100% 사기입니다",
  "링크가 포함된 문자는 누르기 전에 한 번 더 확인하세요",
  "가족 이름의 낯선 번호는 반드시 통화로 확인하세요",
];

export default function EmergencyPage() {
  const [target, setTarget] = useState<{ org: string; number: string } | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="신고 안내" backHref={ROUTES.home} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <p className="pt-2 pb-3 text-xl font-bold text-[#1a2332]">바로 전화 하기</p>

        <div className="grid grid-cols-2 gap-3.75">
          {EMERGENCY_CONTACTS.map((c) => (
            <button
              key={c.org}
              type="button"
              onClick={() => setTarget(c)}
              className="flex flex-col justify-between rounded-lg text-left shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
              style={{
                backgroundImage: c.gradient,
                height: "clamp(110px, 30cqw, 136px)",
                padding: "clamp(12px, 3.6cqw, 16px)",
              }}
            >
              <div className="font-extrabold text-white" style={{ fontSize: "clamp(10px, 2.6cqw, 11px)", lineHeight: 1.45 }}>
                {c.tags.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <p className="text-right font-extrabold text-white" style={{ fontSize: "clamp(12px, 3.2cqw, 14px)" }}>
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
            </button>
          ))}
        </div>

        <section className="mt-6.25 rounded-lg bg-white px-6 pt-5.5 pb-6 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <p className="text-xl font-bold text-[#1a2332]">피해 발생 대응</p>
          <hr className="mt-3.5 mb-4.25 border-gray-200" />
          <ul className="flex flex-col gap-3.75">
            {DAMAGE_RESPONSE.map((t) => (
              <li key={t} className="flex items-start gap-1.5 text-xs text-black">
                <IoCheckmarkCircle className="mt-px shrink-0 text-[#00bc7d]" size={17} />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6.25 rounded-lg bg-white px-6 pt-5.5 pb-6 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <p className="text-xl font-bold text-[#1a2332]">예방 수칙</p>
          <hr className="mt-3.5 mb-4.25 border-gray-200" />
          <ul className="flex flex-col gap-3.75">
            {PREVENTION_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-1.5 text-xs text-black">
                <IoCheckmarkCircle className="mt-px shrink-0 text-[#00bc7d]" size={17} />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {target && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setTarget(null)}
        >
          <div
            className="w-full max-w-90 rounded-xl bg-white shadow-lg"
            style={{
              paddingInline: "clamp(24px, 8cqw, 40px)",
              paddingBlock: "clamp(16px, 5.2cqw, 26px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold text-[#1a2332]" style={{ fontSize: "clamp(18px, 4.8cqw, 24px)" }}>
              신고 안내
            </p>
            <p className="mt-2 text-base text-[#1a2332]">
              신고를 하시겠습니까?
              <br />
              &apos;신고&apos; 클릭시 실제 전화로 연결됩니다.
            </p>
            <div className="mt-4.25 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setTarget(null)}
                className="flex items-center justify-center rounded-lg border border-gray-300 text-base font-bold text-black"
                style={{ paddingInline: "clamp(12px, 3.2cqw, 16px)", paddingBlock: "clamp(6px, 2cqw, 10px)" }}
              >
                취소
              </button>
              <a
                href={`tel:${target.number}`}
                className="flex items-center justify-center rounded-lg bg-[#df1e21] text-base font-bold text-white"
                style={{ paddingInline: "clamp(12px, 3.2cqw, 16px)", paddingBlock: "clamp(6px, 2cqw, 10px)" }}
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
