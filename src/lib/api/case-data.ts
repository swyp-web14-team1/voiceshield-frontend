import type { PhishingCase } from "@/types";
import { fetchCategories, fetchCasesByCategory, fetchScenario, fetchScenarioStep } from "./cases";
import { buildCaseSummary, buildFullCase } from "./adapt";

/** 전체 카테고리 순회해서 사례 목록 카드용 PhishingCase 배열을 만든다(학습하기 목록/홈 화면 추천·이어서 학습하기용). */
export async function fetchAllCaseSummaries(): Promise<PhishingCase[]> {
  const categories = await fetchCategories();
  const lists = await Promise.all(categories.map((c) => fetchCasesByCategory(c.categoryId)));
  return lists.flatMap((list) => list.cases.map((item) => buildCaseSummary(list.categoryId, item)));
}

/** 시나리오 상세 + 두 채널(VOICE/MESSAGE)의 scenario-step까지 합쳐 시뮬레이션 화면에 쓸 완전한 PhishingCase를 만든다. */
export async function fetchCaseDetail(scenarioId: string): Promise<PhishingCase | null> {
  const summaries = await fetchAllCaseSummaries();
  const stub = summaries.find((c) => c.id === scenarioId);
  if (!stub) return null;

  const [scenario, voiceStep, messageStep] = await Promise.all([
    fetchScenario(scenarioId),
    fetchScenarioStep(scenarioId, "VOICE"),
    fetchScenarioStep(scenarioId, "MESSAGE"),
  ]);
  return buildFullCase(stub.category, scenario, voiceStep, messageStep);
}
