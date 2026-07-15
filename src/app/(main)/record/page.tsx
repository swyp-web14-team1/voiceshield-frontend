"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";
import { BackHeader } from "@/components/layout/BackHeader";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/case-meta";
import { MOCK_CASES } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";
import type { CaseCategory, PhishingCase } from "@/types";

const RELATIVE_TIME_LABELS = ["어제", "3일 전", "1주일 전", "3주일 전", "1개월 전"];

function RecordSectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col rounded-xl bg-white shadow-[0px_1px_6px_rgba(0,0,0,0.07)]">
      <div className="border-b border-[#f1f5f9] px-4 py-3.5">
        <p className="text-sm font-bold text-[#1a2332]">{title}</p>
      </div>
      {children}
    </section>
  );
}

function CategoryIcon({ category, size }: { category: CaseCategory; size: number }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: meta.bg, width: size + 14, height: size + 14 }}
    >
      <Icon className="text-white" style={{ width: size, height: size }} />
    </div>
  );
}

function CompletedCaseRow({ phishingCase }: { phishingCase: PhishingCase }) {
  const meta = CATEGORY_META[phishingCase.category];
  return (
    <Link
      href={ROUTES.scenario(phishingCase.id)}
      className="flex items-center justify-between gap-4 rounded-[10px] bg-gray-100 px-3.5 py-2.5 transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-200"
    >
      <div className="flex items-center gap-2.5">
        <CategoryIcon category={phishingCase.category} size={16} />
        <div className="flex flex-col">
          <p className="text-[13px] font-semibold text-[#1a2332]">{phishingCase.title}</p>
          <p className="text-[11px] font-medium text-gray-500">{meta.label}</p>
        </div>
      </div>
      <IoCheckmarkCircle className="shrink-0 text-gray-500" size={16} />
    </Link>
  );
}

function WeakCategoryTag({ category }: { category: CaseCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <div className="flex items-center gap-1.5 rounded-[10px] border border-gray-300 bg-gray-100 px-3.25 py-[5.5px]">
      <CategoryIcon category={category} size={11} />
      <p className="text-xs font-semibold text-gray-600">{meta.label}</p>
    </div>
  );
}

function RecentCaseRow({
  phishingCase,
  timeLabel,
  isLast,
}: {
  phishingCase: PhishingCase;
  timeLabel: string;
  isLast: boolean;
}) {
  const difficulty = DIFFICULTY_META[phishingCase.difficulty];
  return (
    <Link
      href={ROUTES.scenario(phishingCase.id)}
      className={`flex items-center justify-between gap-2.5 px-8 pt-3 transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50 ${isLast ? "pb-4.25" : "border-b border-[#f1f5f9] pb-3"}`}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[13px] font-semibold text-[#1a2332]">{phishingCase.title}</p>
        <div className="flex items-center gap-1.5">
          <span
            className="rounded-full px-1.5 py-px text-[10px] font-medium text-white"
            style={{ backgroundColor: difficulty.bg }}
          >
            {difficulty.label}
          </span>
          <span className="text-[11px] text-gray-500">{CATEGORY_META[phishingCase.category].label}</span>
        </div>
      </div>
      <p className="shrink-0 text-[11px] font-medium text-gray-500">{timeLabel}</p>
    </Link>
  );
}

export default function RecordPage() {
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const completedCases = MOCK_CASES.filter((c) => c.isCompleted);
  const totalCount = MOCK_CASES.length;
  const completedCount = completedCases.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const categoryAverages = (Object.keys(CATEGORY_META) as CaseCategory[]).map((category) => {
    const cases = MOCK_CASES.filter((c) => c.category === category);
    const avg = cases.reduce((sum, c) => sum + c.completionRate, 0) / cases.length;
    return { category, avg };
  });
  const weakCategories = categoryAverages
    .filter((c) => c.avg < 50)
    .sort((a, b) => a.avg - b.avg)
    .map((c) => c.category);

  const recentCases = [...MOCK_CASES].sort((a, b) => b.completionRate - a.completionRate);
  const visibleCompletedCases = showAllCompleted ? completedCases : completedCases.slice(0, 2);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="학습 기록" backHref={ROUTES.home} />

      <div className="no-scrollbar flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-6">
        <section
          className="flex flex-col gap-4 rounded-xl px-4.5 py-4"
          style={{ backgroundImage: "linear-gradient(90deg, #60a5fa 0%, #2849be 100%)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/75">전체 학습 진행률</p>
            <span className="flex items-center justify-center rounded-full bg-white/20 px-3 py-1 text-center text-[11px] leading-none font-normal tracking-normal text-white">
              {completedCount}/{totalCount} 진행중
            </span>
          </div>
          <div className="flex items-end gap-1.5">
            <p className="text-[42px] leading-none font-bold text-white">{progressPercent}</p>
            <p className="pb-1 text-lg font-semibold text-white/80">%</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        <section className="flex h-14.5 items-center justify-between rounded-xl bg-white px-4.5 shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-2.5">
            <IoCheckmarkCircle className="text-[#f97316]" size={16} />
            <p className="text-sm font-semibold text-[#1a2332]">완료 시나리오 개수</p>
          </div>
          <p className="flex items-baseline gap-0.5">
            <span className="text-[28px] font-bold text-orange-500">{completedCount}</span>
            <span className="text-[13px] font-medium text-gray-500">개</span>
          </p>
        </section>

        <RecordSectionCard title="완료 학습 조회">
          <div className="flex flex-col gap-2 p-3.5">
            {completedCases.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">아직 완료한 학습이 없어요</p>
            ) : (
              visibleCompletedCases.map((c) => <CompletedCaseRow key={c.id} phishingCase={c} />)
            )}
            {completedCases.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllCompleted((v) => !v)}
                className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-500"
              >
                {showAllCompleted ? "접기" : "더보기"}
                <FiChevronRight
                  size={12}
                  className={`text-gray-500 ${showAllCompleted ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
            )}
          </div>
        </RecordSectionCard>

        <RecordSectionCard title="취약 유형">
          <div className="flex flex-wrap gap-2 px-3.5 py-3">
            {weakCategories.length === 0 ? (
              <p className="py-2 text-sm text-gray-400">아직 취약한 유형이 없어요</p>
            ) : (
              weakCategories.map((category) => <WeakCategoryTag key={category} category={category} />)
            )}
          </div>
        </RecordSectionCard>

        <RecordSectionCard title="최근 진행한 학습">
          <div className="flex flex-col">
            {recentCases.map((c, index) => (
              <RecentCaseRow
                key={c.id}
                phishingCase={c}
                timeLabel={RELATIVE_TIME_LABELS[index % RELATIVE_TIME_LABELS.length]}
                isLast={index === recentCases.length - 1}
              />
            ))}
          </div>
        </RecordSectionCard>
      </div>
    </div>
  );
}
