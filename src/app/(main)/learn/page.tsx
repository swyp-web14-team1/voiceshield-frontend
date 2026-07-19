"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { ROUTES } from "@/lib/routes";
import { MOCK_CASES, getCaseById } from "@/lib/mock-cases";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/case-meta";
import type { CaseCategory } from "@/types";
import { BackHeader } from "@/components/layout/BackHeader";
import { ContinueLearningCard } from "@/components/cards/ContinueLearningCard";
import { ScenarioCard } from "@/components/cards/ScenarioCard";
import { CategoryTagRow } from "@/components/learn/CategoryTagRow";
import { applyProgressOverride, readProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";

const DEFAULT_CONTINUE_CASE_ID = "institution-01";
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

  const [progress, setProgress] = useState<ProgressSnapshot>(EMPTY_PROGRESS_SNAPSHOT);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피함
    setProgress(readProgressSnapshot());
  }, []);

  const continueCaseId = progress.recentInProgressCaseId ?? DEFAULT_CONTINUE_CASE_ID;
  const continueCase = applyProgressOverride(getCaseById(continueCaseId)!, progress);
  const filteredCases = MOCK_CASES.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      c.title.toLowerCase().includes(query.trim().toLowerCase()),
  ).map((c) => applyProgressOverride(c, progress));

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
        <ContinueLearningCard
          heading="최근 학습한 사례"
          href={ROUTES.scenario(continueCase.id)}
          phishingCase={continueCase}
          difficultyLabel={DIFFICULTY_META[continueCase.difficulty].label}
          difficultyColor={DIFFICULTY_META[continueCase.difficulty].bg}
          variant="compact"
        />
        {filteredCases.map((c) => (
          <ScenarioCard key={c.id} phishingCase={c} />
        ))}
        {filteredCases.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">검색 결과가 없어요.</p>
        )}
      </div>
    </div>
  );
}
