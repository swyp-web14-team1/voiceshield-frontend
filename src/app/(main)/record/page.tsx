"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";
import { BackHeader } from "@/components/layout/BackHeader";
import { CATEGORY_META, DIFFICULTY_META, INSTITUTION_ICON_SIZE } from "@/lib/case-meta";
import { ROUTES } from "@/lib/routes";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { GuestSaveProgressCard } from "@/components/auth/GuestSaveProgressCard";
import { applyProgressOverrideToAll, readProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import type { CaseCategory, PhishingCase } from "@/types";

const EMPTY_PROGRESS_SNAPSHOT: ProgressSnapshot = { recentInProgressCaseId: null, overrides: {} };

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

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

function CategoryIcon({ category, size }: { category: CaseCategory; size: string }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  const iconSize = category === "institution" ? INSTITUTION_ICON_SIZE : size;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: meta.bg, width: `calc(${size} + 14px)`, height: `calc(${size} + 14px)` }}
    >
      <Icon className="text-white" style={{ width: iconSize, height: iconSize }} />
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
        <CategoryIcon category={phishingCase.category} size="clamp(12px, 4cqw, 16px)" />
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
    <div
      className="flex min-w-0 items-center justify-center rounded-[10px] border border-gray-300 bg-gray-100"
      style={{
        gap: "clamp(2px, 1cqw, 4px)",
        paddingInline: "clamp(10px, 3.2cqw, 14px)",
        paddingBlock: "clamp(4px, 1.2cqw, 5.5px)",
      }}
    >
      <CategoryIcon category={category} size="clamp(8px, 2.6cqw, 10px)" />
      <p className="break-keep font-semibold text-gray-600" style={{ fontSize: "clamp(10px, 2.8cqw, 12px)" }}>
        {meta.label}
      </p>
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
  // localStorage 기반 진행 기록은 서버에서 읽을 수 없으므로, 초기값은 서버·클라이언트 동일하게 빈 스냅샷으로 고정하고
  // 실제 값은 마운트 후 useEffect에서 읽는다 (하이드레이션 불일치 방지).
  const [progress, setProgress] = useState<ProgressSnapshot>(EMPTY_PROGRESS_SNAPSHOT);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피함
    setProgress(readProgressSnapshot());
    setIsLoggedIn(localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  }, []);

  const casesWithProgress = applyProgressOverrideToAll(progress);
  const completedCases = casesWithProgress.filter((c) => c.isCompleted);
  const totalCount = casesWithProgress.length;
  const completedCount = completedCases.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // 카테고리별 취약 여부는 AI 분석에서 나온 정답률(accuracy)을 우선 사용하고, 아직 분석을 본 적 없는
  // 카테고리는 completionRate(진행 단계)로 대신 판단한다.
  const categoryScores = (Object.keys(CATEGORY_META) as CaseCategory[]).map((category) => {
    const cases = casesWithProgress.filter((c) => c.category === category);
    const accuracies = cases
      .map((c) => progress.overrides[c.id]?.accuracy)
      .filter((a): a is number => a !== undefined);

    if (accuracies.length > 0) {
      const avgAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
      return { category, score: avgAccuracy, isWeak: avgAccuracy < 70 };
    }
    const avgCompletion = cases.reduce((sum, c) => sum + c.completionRate, 0) / cases.length;
    return { category, score: avgCompletion, isWeak: avgCompletion < 50 };
  });
  const weakCategories = categoryScores
    .filter((c) => c.isWeak)
    .sort((a, b) => a.score - b.score)
    .map((c) => c.category);

  const recentCases = casesWithProgress
    .filter((c) => (progress.overrides[c.id]?.updatedAt ?? 0) > 0)
    .sort((a, b) => (progress.overrides[b.id]?.updatedAt ?? 0) - (progress.overrides[a.id]?.updatedAt ?? 0));
  const visibleCompletedCases = showAllCompleted ? completedCases : completedCases.slice(0, 2);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="학습 기록" backHref={ROUTES.home} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={`no-scrollbar flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 pt-3.5 pb-6 ${
            isLoggedIn ? "" : "pointer-events-none select-none overflow-hidden"
          }`}
        >
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

          <section className="flex py-1 items-center justify-between rounded-xl bg-white px-4.5 shadow-[0px_1px_3px_rgba(0,0,0,0.07)] ">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="text-[#f97316]" size={16} />
              <p className="text-sm font-semibold text-[#1a2332]">완료 시나리오 개수</p>
            </div>
            <p className="flex items-baseline gap-0.5">
              <span className="text-[clamp(18px,6cqw,28px)] font-semibold text-orange-500">{completedCount}</span>
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
            <div
              className="grid px-3.5 py-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                columnGap: "clamp(4px, 1.5cqw, 8px)",
                rowGap: "clamp(6px, 2cqh, 8px)",
              }}
            >
              {weakCategories.length === 0 ? (
                <p className="col-span-full py-2 text-sm text-gray-400">아직 취약한 유형이 없어요</p>
              ) : (
                weakCategories.map((category) => <WeakCategoryTag key={category} category={category} />)
              )}
            </div>
          </RecordSectionCard>

          <RecordSectionCard title="최근 진행한 학습">
            {recentCases.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">아직 진행한 학습이 없어요</p>
            ) : (
              <div className="flex flex-col">
                {recentCases.map((c, index) => (
                  <RecentCaseRow
                    key={c.id}
                    phishingCase={c}
                    timeLabel={formatRelativeTime(progress.overrides[c.id]?.updatedAt ?? 0)}
                    isLast={index === recentCases.length - 1}
                  />
                ))}
              </div>
            )}
          </RecordSectionCard>
        </div>

        {!isLoggedIn && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 px-4 backdrop-blur-md">
            <GuestSaveProgressCard
              onLoggedIn={() => setIsLoggedIn(true)}
              style={{ backgroundColor: "#1a2035" }}
              className="w-full max-w-116.5"
              message="학습기록을 확인해보세요!"
            />
          </div>
        )}
      </div>
    </div>
  );
}
