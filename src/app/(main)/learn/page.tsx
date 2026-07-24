"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { ROUTES } from "@/lib/routes";
import { fetchAllCaseSummaries } from "@/lib/api/case-data";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/case-meta";
import type { CaseCategory, PhishingCase } from "@/types";
import { BackHeader } from "@/components/layout/BackHeader";
import { ContinueLearningCard } from "@/components/cards/ContinueLearningCard";
import { ScenarioCard } from "@/components/cards/ScenarioCard";
import { CategoryTagRow } from "@/components/learn/CategoryTagRow";
import { applyProgressOverride, pickMostRecentCaseId, readProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import { useIsLoggedIn } from "@/lib/auth";

const EMPTY_PROGRESS_SNAPSHOT: ProgressSnapshot = { recentInProgressCaseId: null, overrides: {} };

function isCaseCategory(value: string | null): value is CaseCategory {
  return !!value && value in CATEGORY_META;
}

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnPageContent />
    </Suspense>
  );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [category, setCategory] = useState<"all" | CaseCategory>(
    isCaseCategory(initialCategory) ? initialCategory : "all",
  );
  const [query, setQuery] = useState("");

  const [cases, setCases] = useState<PhishingCase[]>([]);
  const [casesLoaded, setCasesLoaded] = useState(false);
  const [progress, setProgress] = useState<ProgressSnapshot>(EMPTY_PROGRESS_SNAPSHOT);
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피함
    setProgress(readProgressSnapshot());
    fetchAllCaseSummaries()
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setCasesLoaded(true));
  }, []);

  // 진행 중인 케이스가 없으면(전부 완료) 완료 여부와 무관하게 가장 최근에 학습한 케이스를 대신 보여준다.
  const continueCaseId = progress.recentInProgressCaseId ?? pickMostRecentCaseId(progress);
  const continueCaseBase = cases.find((c) => c.id === continueCaseId) ?? cases[0];
  const continueCase = continueCaseBase ? applyProgressOverride(continueCaseBase, progress) : null;
  // 진행 중이던 케이스는 상세 페이지가 아니라 중단했던 채널(전화/문자)의 시뮬레이션으로 바로 들어간다.
  const continueResume = continueCaseId ? progress.overrides[continueCaseId]?.resume : undefined;
  const continueHref =
    continueCase && continueResume
      ? continueResume.channel === "message"
        ? ROUTES.messageProgress(continueCase.id)
        : ROUTES.callProgress(continueCase.id)
      : continueCase
        ? ROUTES.scenario(continueCase.id)
        : "";
  const filteredCases = cases
    .filter(
      (c) =>
        (category === "all" || c.category === category) &&
        c.title.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .map((c) => applyProgressOverride(c, progress));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <div className="shrink-0">
        <BackHeader title="학습하기" backHref={ROUTES.home} />

        <div className="flex flex-col gap-3.5 px-4" style={{ paddingBottom: "clamp(16px, 4cqw, 24px)" }}>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] mt-2">
            <FiSearch className="shrink-0 text-gray-500" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="시나리오 검색"
              className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-500"
            />
          </div>

          <CategoryTagRow value={category} onChange={setCategory} />
        </div>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-6">
        {isLoggedIn && !casesLoaded && (
          // 사례 목록을 API로 받아오는 동안 카드가 없다가 갑자기 나타나면서 아래 목록이 밀리는 걸 막는
          // 자리 예약용 스켈레톤 — ContinueLearningCard(compact)와 비슷한 높이로 맞춰둔다.
          <div className="h-14 animate-pulse rounded-xl bg-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]" />
        )}
        {isLoggedIn && casesLoaded && continueCase && (
          <ContinueLearningCard
            heading="최근 학습한 사례"
            href={continueHref}
            phishingCase={continueCase}
            difficultyLabel={DIFFICULTY_META[continueCase.difficulty].label}
            difficultyColor={DIFFICULTY_META[continueCase.difficulty].bg}
            variant="compact"
          />
        )}
        {filteredCases.map((c) => (
          <ScenarioCard key={c.id} phishingCase={c} />
        ))}
        {casesLoaded && filteredCases.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">검색 결과가 없어요.</p>
        )}
      </div>
    </div>
  );
}
