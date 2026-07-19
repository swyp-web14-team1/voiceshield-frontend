import type { AnalyzeRequest } from "@/types";

const ANALYSIS_INPUT_STORAGE_KEY = "voiceshield-analysis-input";

/** 통화 진행 화면에서 AI 분석 화면으로 넘어가기 직전, 분석에 필요한 퀴즈 결과를 sessionStorage에 저장한다. */
export function saveAnalysisInput(caseId: string, input: AnalyzeRequest) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${ANALYSIS_INPUT_STORAGE_KEY}-${caseId}`, JSON.stringify(input));
}

/** AI 분석 화면에서 저장해둔 퀴즈 결과를 읽어온다. 없으면 직접 진입한 것이므로 null을 반환한다. */
export function readAnalysisInput(caseId: string): AnalyzeRequest | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`${ANALYSIS_INPUT_STORAGE_KEY}-${caseId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalyzeRequest;
  } catch {
    return null;
  }
}
