import Link from "next/link";
import { FaCircleCheck } from "react-icons/fa6";
import { CASE_CATEGORY_LABEL } from "@/lib/mock-cases";
import { CATEGORY_META } from "@/lib/case-meta";
import { ROUTES } from "@/lib/routes";
import { CaseStatsGrid } from "@/components/cards/CaseStatsGrid";
import type { PhishingCase } from "@/types";

export function ScenarioCard({ phishingCase }: { phishingCase: PhishingCase }) {
  const category = CATEGORY_META[phishingCase.category];
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

        <CaseStatsGrid phishingCase={phishingCase} />

        <Link
          href={ROUTES.scenario(phishingCase.id)}
          className="rounded-[10px] py-2.5 text-center text-[13px] font-semibold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-shadow [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),inset_0_0_0_999px_rgba(0,0,0,0.12)]"
          style={{ backgroundImage: "linear-gradient(90deg, #60a5fa 0%, #2849be 100%)" }}
        >
          {phishingCase.isCompleted
            ? "다시 학습하기"
            : phishingCase.completionRate > 0
              ? "이어서 학습하기"
              : "학습 시작하기"}
        </Link>
      </div>
    </div>
  );
}
