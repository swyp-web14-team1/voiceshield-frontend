import Link from "next/link";
import { ChevronIcon } from "@/components/icons/home-icons";
import { CATEGORY_META } from "@/lib/case-meta";
import type { PhishingCase } from "@/types";

interface ContinueLearningCardProps {
  heading: string;
  href: string;
  phishingCase: PhishingCase;
  difficultyLabel: string;
  difficultyColor: string;
  variant?: "light" | "gradient";
}

export function ContinueLearningCard({
  heading,
  href,
  phishingCase,
  difficultyLabel,
  difficultyColor,
  variant = "gradient",
}: ContinueLearningCardProps) {
  const isLight = variant === "light";
  const category = CATEGORY_META[phishingCase.category];
  const CategoryIcon = category.Icon;

  return (
    <Link
      href={href}
      className={
        isLight
          ? "flex flex-col gap-4 rounded-xl bg-white p-4 pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
          : "flex flex-col gap-4 pb-5 rounded-xl p-4 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
      }
      style={isLight ? undefined : { backgroundImage: "linear-gradient(165deg, #2849be 0%, #2d1f4e 100%)" }}
    >
      <p
        className={
          isLight
            ? "text-base font-bold tracking-[0.3px] text-[#1a2035] uppercase"
            : "text-base font-bold tracking-[0.3px] text-white uppercase"
        }
      >
        {heading}
      </p>
      <div className="relative flex items-center gap-4">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: category.bg }}
        >
          <CategoryIcon className="size-7 text-white" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 pr-6">
          <p className={isLight ? "text-sm font-bold text-[#1a2332]" : "text-sm font-bold text-white"}>
            {phishingCase.title}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: difficultyColor }}
            >
              {difficultyLabel}
            </span>
            <span className={isLight ? "text-xs text-slate-500" : "text-xs text-white/80"}>
              진행 {phishingCase.completionRate}%
            </span>
          </div>
          <div
            className={
              isLight
                ? "mt-1 h-2 w-11/12 max-w-80 overflow-hidden rounded-full bg-[rgba(138,155,188,0.21)]"
                : "mt-1 h-2 w-11/12 max-w-80 overflow-hidden rounded-full bg-white/20"
            }
          >
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${phishingCase.completionRate}%` }}
            />
          </div>
        </div>
        <ChevronIcon
          className={
            isLight
              ? "absolute top-1/2 right-3 size-4.5 -translate-y-1/2 text-[#8a9bbc]"
              : "absolute top-1/2 right-3 size-4.5 -translate-y-1/2 text-white"
          }
        />
      </div>
    </Link>
  );
}
