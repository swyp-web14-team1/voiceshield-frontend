import Link from "next/link";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FiChevronRight } from "react-icons/fi";
import { DIFFICULTY_META } from "@/lib/case-meta";
import type { PhishingCase } from "@/types";

interface RecommendedCardProps {
  href: string;
  phishingCase: PhishingCase;
}

export function RecommendedCard({ href, phishingCase }: RecommendedCardProps) {
  const difficulty = DIFFICULTY_META[phishingCase.difficulty];

  return (
    <div className="flex items-center justify-between gap-4.25 rounded-xl bg-white px-4 py-6.25 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-bold text-[#1a2332]">{phishingCase.title}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white"
            style={{ backgroundColor: difficulty.bg }}
          >
            {difficulty.label}
          </span>
          <span className="shrink-0 text-xs whitespace-nowrap text-gray-600">
            예상 학습시간 <span className="font-semibold text-gray-800">{phishingCase.estimatedMinutes}분</span>
          </span>
          <span className="shrink-0 text-xs text-gray-300">|</span>
          <span className="flex shrink-0 items-center gap-0.5 text-xs whitespace-nowrap text-gray-600">
            추천도
            {Array.from({ length: 5 }).map((_, i) =>
              i < phishingCase.recommendation ? (
                <AiFillStar key={i} size={12} className="text-[#60a5fa]" />
              ) : (
                <AiOutlineStar key={i} size={12} className="text-gray-300" />
              ),
            )}
          </span>
        </div>
      </div>
      <Link
        href={href}
        className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#2563eb] py-1.5 pr-2 pl-3 text-xs font-semibold text-white shadow-[0px_1px_1px_rgba(0,0,0,0.1)] transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#1d4fd1]"
      >
        학습하기
        <FiChevronRight size={14} />
      </Link>
    </div>
  );
}
