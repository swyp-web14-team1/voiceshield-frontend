"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiBookOpen } from "react-icons/fi";
import { getCaseById, MOCK_CASES } from "@/lib/mock-cases";
import { AiOutlineStock } from "react-icons/ai";
import {
  CategoryDeliveryIcon,
  CategoryFamilyIcon,
  CategoryGovernmentIcon,
  CategoryMessengerIcon,
} from "@/components/icons/home-icons";
import { DIFFICULTY_META } from "@/lib/case-meta";
import { ContinueLearningCard } from "@/components/cards/ContinueLearningCard";
import { RecommendedCard } from "@/components/cards/RecommendedCard";
import { ROUTES } from "@/lib/routes";
import { applyProgressOverride, readProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import type { CaseCategory } from "@/types";

const DEFAULT_CONTINUE_CASE_ID = "institution-01";
const EMPTY_PROGRESS_SNAPSHOT: ProgressSnapshot = { recentInProgressCaseId: null, overrides: {} };

const DEFAULT_ICON_SIZE = "clamp(14px, 4cqw, 20px)";

const CATEGORY_TILES: {
  label: string;
  category: CaseCategory;
  Icon: React.ElementType;
  bg: string;
  iconSize?: string;
}[] = [
  { label: "기관사칭", category: "institution", Icon: CategoryGovernmentIcon, bg: "rgba(138,155,188,0.44)" },
  { label: "가족사기", category: "family", Icon: CategoryFamilyIcon, bg: "#ff2056" },
  { label: "택배사기", category: "delivery", Icon: CategoryDeliveryIcon, bg: "#fe9a00" },
  { label: "투자사기", category: "investment", Icon: AiOutlineStock, bg: "#00bc7d", iconSize: "clamp(17px, 4.8cqw, 24px)" },
  { label: "메신저사기", category: "messenger", Icon: CategoryMessengerIcon, bg: "#8e51ff" },
];

const RECOMMENDED_CASES = [...MOCK_CASES].sort((a, b) => b.recommendation - a.recommendation).slice(0, 2);


export default function HomePage() {
  // localStorage 기반 진행 기록은 서버에서 읽을 수 없으므로, 초기값은 서버·클라이언트 동일하게 빈 스냅샷으로 고정하고
  // 실제 값은 마운트 후 useEffect에서 읽는다 (하이드레이션 불일치 방지).
  const [progress, setProgress] = useState<ProgressSnapshot>(EMPTY_PROGRESS_SNAPSHOT);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피함
    setProgress(readProgressSnapshot());
  }, []);

  const continueCaseId = progress.recentInProgressCaseId ?? DEFAULT_CONTINUE_CASE_ID;
  const continueCase = applyProgressOverride(getCaseById(continueCaseId)!, progress);

  return (
    <main className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3.5 [@media(min-height:950px)_and_(hover:none)_and_(pointer:coarse)]:flex-none overflow-y-auto bg-gray-100 px-4 py-8 @max-[410px]:py-4">
      <section className="flex flex-col gap-1 rounded-xl bg-white p-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
        <p className="text-xs font-medium text-[#64748B]">피싱안전지킴이</p>
        <h1 className="text-xl font-bold text-[#1a2332]">
          안녕하세요, <span className="text-blue-600">홍길동</span> 님!
        </h1>
        <p className="mt-2.25 text-sm text-slate-500">오늘의 학습 진도율</p>
        <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-[#e6eaf0]">
          <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-slate-500">오늘 완료: 68%</span>
          <span className="text-xs font-bold text-blue-600">68 / 100</span>
        </div>
      </section>

      <section className="flex gap-3">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-white p-4 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-xs font-semibold text-slate-500">오늘 학습 시간 (분)</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-white p-4 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <p className="text-3xl font-bold text-orange-500">3</p>
          <p className="text-xs font-semibold text-slate-500">오늘 완료 시나리오</p>
        </div>
      </section>

      <ContinueLearningCard
        heading="이어서 학습하기"
        href={ROUTES.scenario(continueCase.id)}
        phishingCase={continueCase}
        difficultyLabel={DIFFICULTY_META[continueCase.difficulty].label}
        difficultyColor={DIFFICULTY_META[continueCase.difficulty].bg}
        variant="light"
      />

      <section
        className="flex flex-col gap-4 rounded-xl border border-black/8 p-4 pb-6 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)]"
        style={{ backgroundImage: "linear-gradient(147deg, #2849be 0%, #2d1f4e 100%)" }}
      >
        <p className="text-base font-bold tracking-[0.3px] text-white uppercase">
          카테고리별 학습
        </p>
        
        <div className="grid grid-cols-3 gap-3 cursor-pointer">
          {CATEGORY_TILES.map(({ label, category, Icon, bg, iconSize }) => (
            <Link
              href={`${ROUTES.learn}?category=${category}`}
              key={label}
              className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[10px]
                        backdrop-blur-lg transition-all duration-300
                        bg-white/[0.08] hover:bg-white/[0.15]
                        shadow-[0_12px_24px_-4px_rgba(13,10,31,0.2),_inset_4px_4px_12px_rgba(0,0,0,0.1)]"
              style={{
                padding: "clamp(8px, 3cqw, 22px)",
                gap: "clamp(4px, 2cqw, 6px)",
              }}
            >

              <div
                className="absolute inset-0 rounded-[10px] pointer-events-none -z-10"
                style={{
                  padding: '0.7px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.4) 22%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 65%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.4) 100%)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              
              <div
                className="relative flex items-center justify-center "
                style={{
                  backgroundColor: bg,
                  width: "clamp(28px, 8cqw, 40px)",
                  height: "clamp(28px, 8cqw, 40px)",
                  borderRadius: "clamp(7px, 2cqw, 10px)",
                }}
              >
                <Icon
                  className="text-white"
                  style={{ width: iconSize ?? DEFAULT_ICON_SIZE, height: iconSize ?? DEFAULT_ICON_SIZE }}
                />
              </div>
              
              <span className="relative text-xs font-medium text-white tracking-wide">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col pt-1">
        <p className="flex items-center gap-1.5 text-base font-bold text-[#1A2035]">
          <FiBookOpen size={18} className="text-gray-600" />
          오늘의 추천학습
        </p>
        <div className="mt-3 flex flex-col gap-2.25">
          {RECOMMENDED_CASES.map((c) => (
            <RecommendedCard key={c.id} href={ROUTES.scenario(c.id)} phishingCase={c} />
          ))}
        </div>
      </section>
    </main>
  );
}
