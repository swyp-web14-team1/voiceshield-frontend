import { MOCK_CASES } from "@/lib/mock-cases";
import type { PhishingCase } from "@/types";

const PROGRESS_STORAGE_KEY = "voiceshield-case-progress";

export type CasePhase = "dialogue" | "quiz" | "complete" | "finalQuiz";

// 단계별로 도달했을 때 반영할 완료율 — 이미 더 높은 단계에 도달한 기록이 있으면 낮은 값으로 덮어쓰지 않는다.
const PHASE_COMPLETION_RATE: Record<CasePhase, number> = {
  dialogue: 30,
  quiz: 60,
  complete: 90,
  finalQuiz: 100,
};

interface StoredCaseProgress {
  completionRate: number;
  isCompleted: boolean;
  updatedAt: number;
  /** AI 분석 결과의 정답률(0~100). AI 분석을 아직 본 적 없으면 undefined. */
  accuracy?: number;
}

type ProgressMap = Record<string, StoredCaseProgress>;

function readProgressMap(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeProgressMap(map: ProgressMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
}

/** 시뮬레이션 진행 중 도달한 단계를 기록한다. 이전 기록보다 진행률이 낮으면 값은 유지하고 접속 시각만 갱신한다. */
export function recordCaseProgress(caseId: string, phase: CasePhase) {
  const map = readProgressMap();
  const nextRate = PHASE_COMPLETION_RATE[phase];
  const existing = map[caseId];

  if (existing && existing.completionRate >= nextRate) {
    map[caseId] = { ...existing, updatedAt: Date.now() };
  } else {
    map[caseId] = { completionRate: nextRate, isCompleted: phase === "finalQuiz", updatedAt: Date.now() };
  }
  writeProgressMap(map);
}

/** AI 분석 결과가 나왔을 때 정답률을 기록한다. completionRate/isCompleted는 건드리지 않고 accuracy만 갱신한다. */
export function recordAnalysisAccuracy(caseId: string, accuracy: number) {
  const map = readProgressMap();
  const existing = map[caseId];
  map[caseId] = existing
    ? { ...existing, accuracy, updatedAt: Date.now() }
    : { completionRate: 0, isCompleted: false, accuracy, updatedAt: Date.now() };
  writeProgressMap(map);
}

export interface ProgressSnapshot {
  /** 가장 최근에 진행했지만 아직 완료하지 않은 케이스 ID. 기록이 없으면 null. */
  recentInProgressCaseId: string | null;
  overrides: ProgressMap;
}

const EMPTY_SNAPSHOT: ProgressSnapshot = { recentInProgressCaseId: null, overrides: {} };

/**
 * localStorage에 저장된 진행 기록 스냅샷을 읽는다. 서버 렌더링 시점에는 항상 빈 스냅샷을 반환하므로,
 * 하이드레이션 불일치를 피하려면 반드시 마운트 후 useEffect 안에서만 호출할 것.
 */
export function readProgressSnapshot(): ProgressSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  const map = readProgressMap();
  const entries = Object.entries(map).filter(([, v]) => !v.isCompleted && v.completionRate > 0);
  entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return { recentInProgressCaseId: entries[0]?.[0] ?? null, overrides: map };
}

/** mock 케이스에 저장된 진행률을 덮어씌운 케이스 객체를 반환한다. 기록이 없으면 원본을 그대로 반환한다. */
export function applyProgressOverride(phishingCase: PhishingCase, snapshot: ProgressSnapshot): PhishingCase {
  const stored = snapshot.overrides[phishingCase.id];
  if (!stored) return phishingCase;
  return { ...phishingCase, completionRate: stored.completionRate, isCompleted: stored.isCompleted };
}

export function applyProgressOverrideToAll(snapshot: ProgressSnapshot): PhishingCase[] {
  return MOCK_CASES.map((c) => applyProgressOverride(c, snapshot));
}
