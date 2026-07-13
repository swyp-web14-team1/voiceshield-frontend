import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { DIFFICULTY_META } from "@/lib/case-meta";
import type { PhishingCase } from "@/types";

export function CaseStatsGrid({ phishingCase }: { phishingCase: PhishingCase }) {
  const difficulty = DIFFICULTY_META[phishingCase.difficulty];

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <div className="flex flex-col gap-1 rounded-lg bg-gray-100 px-2.5 py-2">
        <span className="text-[11px] font-medium text-slate-400">난이도</span>
        <span
          className="w-fit rounded-full px-2 py-0.5 text-xs font-medium text-white"
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
  );
}
