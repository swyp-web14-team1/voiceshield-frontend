import { AUTH_STORAGE_KEY } from "@/lib/auth";
import type { PhishingCase } from "@/types";

const PROGRESS_STORAGE_KEY = "voiceshield-case-progress";

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export type CasePhase = "dialogue" | "quiz" | "complete" | "finalQuiz";
export type CaseChannel = "voice" | "message";

// 단계별로 도달했을 때 반영할 완료율 — 이미 더 높은 단계에 도달한 기록이 있으면 낮은 값으로 덮어쓰지 않는다.
const PHASE_COMPLETION_RATE: Record<CasePhase, number> = {
  dialogue: 30,
  quiz: 60,
  complete: 90,
  finalQuiz: 100,
};

/** "이어하기"로 정확히 중단했던 지점부터 재개하기 위한 스냅샷. voice는 quizIndex/answers가 여러 개, message는 quizIndex 항상 0에 answers 1개. */
export interface ResumeState {
  channel: CaseChannel;
  phase: CasePhase;
  revealedCount: number;
  quizIndex: number;
  answers: (number | null)[];
}

interface StoredCaseProgress {
  completionRate: number;
  isCompleted: boolean;
  updatedAt: number;
  /** AI 분석 결과의 정답률(0~100). AI 분석을 아직 본 적 없으면 undefined. */
  accuracy?: number;
  /** 처음 isCompleted가 true가 된 시각. 이후 같은 케이스를 다시 봐도 갱신하지 않는다 ("오늘 완료 시나리오" 집계용). */
  completedAt?: number;
  /** 완료된 케이스는 재개할 지점이 없으므로 완료 시점에 지운다. */
  resume?: ResumeState;
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

/**
 * 시뮬레이션 진행 중 도달한 단계를 기록한다. `completionRate`는 항상 이번 방문에서 도달한 단계를 그대로
 * 반영한다(재도전 시 이전보다 낮아질 수 있음) — 반면 `isCompleted`는 한 번 true가 되면 계속 유지되어
 * "완료 학습" 기록 자체는 재도전으로 인해 없어지지 않는다. `resume`을 같이 넘기면 "이어하기"로 정확한
 * 지점부터 재개할 수 있도록 저장해두고(완료되는 순간엔 지움), 넘기지 않으면 기존 resume 값을 유지한다.
 * 게스트(비로그인)는 저장하지 않는다(US-56).
 */
export function recordCaseProgress(
  caseId: string,
  phase: CasePhase,
  resume?: Omit<ResumeState, "phase">,
) {
  if (!isLoggedIn()) return;
  const map = readProgressMap();
  const nextRate = PHASE_COMPLETION_RATE[phase];
  const existing = map[caseId];
  const willBeCompleted = phase === "finalQuiz";
  const isCompleted = existing?.isCompleted || willBeCompleted;
  // 처음 완료되는 순간에만 completedAt을 찍는다 — 이후 재방문 시 updatedAt만 갱신되어도 "오늘 완료"로 잘못 집계되지 않도록.
  const completedAt = willBeCompleted && !existing?.isCompleted ? Date.now() : existing?.completedAt;
  const nextResume = willBeCompleted ? undefined : resume ? { ...resume, phase } : existing?.resume;

  map[caseId] = {
    completionRate: nextRate,
    isCompleted,
    updatedAt: Date.now(),
    completedAt,
    accuracy: existing?.accuracy,
    resume: nextResume,
  };
  writeProgressMap(map);
}

function isToday(timestamp: number): boolean {
  const now = new Date();
  const d = new Date(timestamp);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  );
}

/** 오늘 처음 완료 처리된(finalQuiz 도달) 시나리오 개수. 서버 렌더링 시점에는 항상 0. */
export function getTodayCompletedCount(): number {
  if (typeof window === "undefined") return 0;
  const map = readProgressMap();
  return Object.values(map).filter((v) => v.completedAt !== undefined && isToday(v.completedAt)).length;
}

/** AI 분석 결과가 나왔을 때 정답률을 기록한다. completionRate/isCompleted는 건드리지 않고 accuracy만 갱신한다. 게스트(비로그인)는 저장하지 않는다. */
export function recordAnalysisAccuracy(caseId: string, accuracy: number) {
  if (!isLoggedIn()) return;
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
  // "이어서 학습하기" 대상 여부는 isCompleted(한 번 찍히면 계속 유지되는 값)가 아니라 resume 존재 여부로 판단한다 —
  // 예전에 완료했던 케이스를 다시 진행 중이어도(재도전) isCompleted는 계속 true라서 그것만으로는 구분이 안 되고,
  // resume은 finalQuiz(진짜 완료) 도달 시에만 지워지므로 "지금 이어서 할 게 있는지"를 정확히 나타낸다.
  const entries = Object.entries(map).filter(([, v]) => v.resume !== undefined);
  entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return { recentInProgressCaseId: entries[0]?.[0] ?? null, overrides: map };
}

/** 진행 중인 케이스가 없을 때(전부 완료) 홈 화면 "이어서 학습하기" 카드의 대체 표시용 — 완료 여부와 무관하게 가장 최근에 손댄 케이스 ID를 반환한다. */
export function pickMostRecentCaseId(snapshot: ProgressSnapshot): string | null {
  const entries = Object.entries(snapshot.overrides);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return entries[0][0];
}

/** mock 케이스에 저장된 진행률을 덮어씌운 케이스 객체를 반환한다. 기록이 없으면 원본을 그대로 반환한다. */
export function applyProgressOverride(phishingCase: PhishingCase, snapshot: ProgressSnapshot): PhishingCase {
  const stored = snapshot.overrides[phishingCase.id];
  if (!stored) return phishingCase;
  return { ...phishingCase, completionRate: stored.completionRate, isCompleted: stored.isCompleted };
}

export function applyProgressOverrideToAll(cases: PhishingCase[], snapshot: ProgressSnapshot): PhishingCase[] {
  return cases.map((c) => applyProgressOverride(c, snapshot));
}
