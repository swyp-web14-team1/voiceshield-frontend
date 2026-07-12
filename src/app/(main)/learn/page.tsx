"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiSearch } from "react-icons/fi";
import { ROUTES } from "@/lib/routes";
import { MOCK_CASES, getCaseById } from "@/lib/mock-cases";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/case-meta";
import type { CaseCategory } from "@/types";
import { ContinueLearningCard } from "@/components/cards/ContinueLearningCard";
import { ScenarioCard } from "@/components/cards/ScenarioCard";

// US-03-01 ~ US-03-14 학습하기 (사례 선택)
export default function LearnPage() {
  const [category, setCategory] = useState<"all" | CaseCategory>("all");
  const [query, setQuery] = useState("");
  const tagRowRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });

  const handleTagRowMouseDown = (e: React.MouseEvent) => {
    const el = tagRowRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false };
  };

  const handleTagRowMouseMove = (e: React.MouseEvent) => {
    const el = tagRowRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - delta;
  };

  const endTagRowDrag = () => {
    drag.current.active = false;
  };

  // 드래그로 스크롤한 직후엔 버튼 클릭(카테고리 선택)을 막아서 오작동 방지
  const handleTagRowClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const continueCase = getCaseById("institution-01")!;
  const filteredCases = MOCK_CASES.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <div className="shrink-0">
        <header className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Link href={ROUTES.home} className="text-gray-700">
            <FiChevronLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold text-gray-700">학습하기</h1>
        </header>

        <div className="flex flex-col gap-4 px-4 pb-6">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] mt-2">
            <FiSearch className="shrink-0 text-gray-500" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="시나리오 검색"
              className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-500"
            />
          </div>

          <div
            ref={tagRowRef}
            className="no-scrollbar flex cursor-grab gap-2.5 overflow-x-auto active:cursor-grabbing"
            style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch" }}
            onMouseDown={handleTagRowMouseDown}
            onMouseMove={handleTagRowMouseMove}
            onMouseUp={endTagRowDrag}
            onMouseLeave={endTagRowDrag}
            onClickCapture={handleTagRowClickCapture}
          >
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-4 py-1 text-sm font-bold whitespace-nowrap ${
                category === "all" ? "bg-gray-600 text-white" : "bg-white text-gray-600 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
              }`}
            >
              전체
            </button>
            {(Object.keys(CATEGORY_META) as CaseCategory[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`shrink-0 rounded-full px-4 py-1 text-sm font-bold whitespace-nowrap ${
                  category === key ? "bg-gray-600 text-white" : "bg-white text-gray-600 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
                }`}
              >
                {CATEGORY_META[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠: 이 영역만 스크롤 */}
      <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
        <ContinueLearningCard
          heading="최근 학습 이어하기"
          href={ROUTES.home}
          phishingCase={continueCase}
          difficultyLabel={DIFFICULTY_META[continueCase.difficulty].label}
          difficultyColor={DIFFICULTY_META[continueCase.difficulty].bg}
          variant="gradient"
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
