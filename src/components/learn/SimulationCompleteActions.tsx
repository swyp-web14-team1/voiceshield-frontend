"use client";

import { useRouter } from "next/navigation";
import { MdOutlineReplay } from "react-icons/md";
import { RiShiningLine } from "react-icons/ri";
import { ROUTES } from "@/lib/routes";
import { saveAnalysisInput } from "@/lib/analysis";
import type { AnalyzeRequest } from "@/types";

export function SimulationCompleteActions({
  caseId,
  onRestart,
  analysisInput,
}: {
  caseId: string;
  onRestart: () => void;
  analysisInput: AnalyzeRequest;
}) {
  const router = useRouter();

  return (
    <div className="flex shrink-0 flex-col gap-2.5 border-t border-gray-200 bg-white px-4 py-3.5">
      <button
        type="button"
        onClick={onRestart}
        className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-500 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#1a2035]"
      >
        <MdOutlineReplay size={16} />
        다시 하기
      </button>
      <button
        type="button"
        onClick={() => {
          saveAnalysisInput(caseId, analysisInput);
          router.push(ROUTES.callAnalysis(caseId));
        }}
        className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#1a2035] text-sm font-semibold text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#212841]"
      >
        <RiShiningLine size={15} />
        AI 분석 결과 보기
      </button>
      <button
        type="button"
        onClick={() => router.push(ROUTES.callQuiz(caseId))}
        className="flex h-10.25 w-full cursor-pointer items-center justify-center rounded-[7px] border border-[#1a2035] bg-white text-sm font-semibold text-[#1a2035] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
      >
        마무리 퀴즈 하러 가기
      </button>
    </div>
  );
}
