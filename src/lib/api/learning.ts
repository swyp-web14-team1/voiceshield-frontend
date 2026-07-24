import { apiFetch } from "./client";
import type { LearningCompletionResponse } from "./types";

export function markSimulationComplete(scenarioId: string) {
  return apiFetch<LearningCompletionResponse>(`/api/v1/learning/scenarios/${scenarioId}/simulation-complete`, {
    method: "POST",
  });
}

export function markQuizComplete(scenarioId: string) {
  return apiFetch<LearningCompletionResponse>(`/api/v1/learning/scenarios/${scenarioId}/quiz-complete`, {
    method: "POST",
  });
}
