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
  variant?: "light" | "gradient" | "compact";
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

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-shadow [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),inset_0_0_0_999px_rgba(0,0,0,0.12)]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #1e40af 0%, #1f42b3 7%, #1f45b7 14%, #2047bc 21%, #204ac0 29%, #214cc4 36%, #214fc8 43%, #2251cd 50%, #2254d1 57%, #2356d5 64%, #2359da 71%, #235cde 79%, #245ee2 86%, #2461e6 93%, #2563eb 100%)",
        }}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/20">
          <CategoryIcon className="size-4.5 text-white" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs text-white/70">{heading}</span>
          <span className="truncate text-[0.8125rem] font-medium text-white">{phishingCase.title}</span>
        </div>
        <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-600">이어하기</span>
      </Link>
    );
  }

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
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
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
