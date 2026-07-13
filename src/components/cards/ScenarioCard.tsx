import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";
import { CASE_CATEGORY_LABEL } from "@/lib/mock-cases";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/case-meta";
import type { PhishingCase } from "@/types";

export function ScenarioCard({ phishingCase }: { phishingCase: PhishingCase }) {
  const category = CATEGORY_META[phishingCase.category];
  const difficulty = DIFFICULTY_META[phishingCase.difficulty];
  const CategoryIcon = category.Icon;

  return (
    <div className="flex flex-col rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between rounded-t-xl bg-gray-200 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="flex size-5 items-center justify-center rounded-md" style={{ backgroundColor: category.bg }}>
            <CategoryIcon className="size-3 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">{CASE_CATEGORY_LABEL[phishingCase.category]}</span>
        </div>
        {phishingCase.isCompleted && (
          <span className="flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-500 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
            학습 완료
            <FaCircleCheck size={12} className="text-orange-500" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 px-3.5 pt-3 pb-3.5">
        <p className="text-sm font-bold text-gray-900">{phishingCase.title}</p>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex flex-col gap-1 rounded-lg bg-gray-100 px-2.5 py-2">
            <span className="text-[11px] font-medium text-slate-400">난이도</span>
            <span
              className="w-fit rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: difficulty.bg }}
            >
              {difficulty.label}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-gray-100 px-2.5 py-2">
            <span className="text-[11px] font-medium text-slate-400">예상 학습시간</span>
            <span className="text-xs font-semibold text-gray-900">{phishingCase.estimatedMinutes}분</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-gray-100 px-2.5 py-2">
            <span className="text-[11px] font-medium text-slate-400">완료율</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${phishingCase.completionRate}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">{phishingCase.completionRate}%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-gray-100 px-2.5 py-2">
            <span className="text-[11px] font-medium text-slate-400">추천도</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) =>
                i < phishingCase.recommendation ? (
                  <AiFillStar key={i} size={12} className="text-[#60a5fa]" />
                ) : (
                  <AiOutlineStar key={i} size={12} className="text-gray-300" />
                ),
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="rounded-[10px] py-2.5 text-center text-[13px] font-semibold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
          style={{ backgroundImage: "linear-gradient(90deg, #60a5fa 0%, #2849be 100%)" }}
        >
          {phishingCase.isCompleted
            ? "다시 학습하기"
            : phishingCase.completionRate > 0
              ? "이어서 학습하기"
              : "학습 시작하기"}
        </button>
      </div>
    </div>
  );
}
