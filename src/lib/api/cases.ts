import { apiFetch } from "./client";
import type {
  CaseChannel,
  CaseChoiceEvaluationResponse,
  CaseScenarioResponse,
  CaseScenarioStepResponse,
  CategoryCaseListResponse,
  CategoryResponse,
} from "./types";

export function fetchCategories() {
  return apiFetch<CategoryResponse[]>("/api/v1/categories");
}

export function fetchCasesByCategory(categoryId: string) {
  return apiFetch<CategoryCaseListResponse>(`/api/v1/categories/${categoryId}/cases`);
}

export function fetchScenario(scenarioId: string) {
  return apiFetch<CaseScenarioResponse>(`/api/v1/cases/${scenarioId}`);
}

export function fetchScenarioStep(scenarioId: string, channel: CaseChannel) {
  return apiFetch<CaseScenarioStepResponse>(`/api/v1/cases/${scenarioId}/variants/${channel}/scenario-step`);
}

export function evaluateChoice(scenarioId: string, channel: CaseChannel, choiceOptionId: string) {
  return apiFetch<CaseChoiceEvaluationResponse>(`/api/v1/cases/${scenarioId}/variants/${channel}/choices`, {
    method: "POST",
    body: { choiceOptionId },
  });
}
