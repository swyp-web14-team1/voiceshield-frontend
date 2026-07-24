import type { CaseCategory, CaseDifficulty, PhishingCase, PhishingDialogueLine, QuizQuestion } from "@/types";
import { CASE_CATEGORY_LABEL } from "@/lib/case-meta";
import type {
  CaseQuizResponse,
  CaseScenarioResponse,
  CaseScenarioStepResponse,
  CaseVariantOptionResponse,
  CategoryCaseSummaryResponse,
} from "./types";

/** 실제 백엔드 categoryId(슬러그) → 기존에 쓰던 CaseCategory enum 매핑. 백엔드에는 "메신저사기"에 대응하는 카테고리가 없다. */
const CATEGORY_ID_MAP: Record<string, CaseCategory> = {
  "category-institution-impersonation": "institution",
  "category-delivery-impersonation": "delivery",
  "category-investment-fraud": "investment",
  "category-family-impersonation": "family",
};

export function mapCategoryId(categoryId: string): CaseCategory {
  return CATEGORY_ID_MAP[categoryId] ?? "institution";
}

function mapDifficulty(difficulty: string | null): CaseDifficulty {
  if (!difficulty) return "easy";
  const normalized = difficulty.toLowerCase();
  if (normalized.includes("hard") || normalized.includes("고급")) return "hard";
  if (normalized.includes("medium") || normalized.includes("mid") || normalized.includes("중급")) return "medium";
  return "easy";
}

function parseMinutes(estimatedLearningTime: string | null): number {
  const match = estimatedLearningTime?.match(/\d+/);
  return match ? Number(match[0]) : 5;
}

function parseCompletionRate(completionRate: string | null): number {
  const match = completionRate?.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

const PLACEHOLDER_QUIZ: QuizQuestion = {
  id: "placeholder-quiz",
  question: "이 시나리오의 퀴즈는 아직 준비 중입니다.",
  choices: ["확인했어요"],
  answerIndex: 0,
  explanation: "곧 업데이트될 예정입니다.",
};

const DEFAULT_FEEDBACK = {
  correct: "정답이에요! 침착하게 잘 판단하셨어요.",
  wrong: "아쉬워요, 다시 한 번 살펴볼까요?",
};

function buildQuiz(quiz: CaseQuizResponse | null, options: CaseVariantOptionResponse[]): QuizQuestion {
  if (!quiz || options.length === 0) return PLACEHOLDER_QUIZ;
  const sorted = [...options].sort((a, b) => a.optionNumber - b.optionNumber);
  const answerIndex = Math.max(0, sorted.findIndex((o) => o.isCorrect));
  return {
    id: quiz.quizId,
    question: quiz.question,
    choices: sorted.map((o) => o.optionText),
    optionIds: sorted.map((o) => o.optionId),
    answerIndex,
    explanation: "정답 여부는 학습 결과 화면에서 자세히 확인할 수 있어요.",
  };
}

const SPEAKER_LABEL_TO_SPEAKER: Record<string, PhishingDialogueLine["speaker"]> = {
  나: "user",
  사기범: "caller",
};

/**
 * 실제 API의 scriptLines는 대사 하나가 아니라 "화자 이름"과 "대사 조각"이 번갈아 섞인 평탄화된 배열이다
 * (예: ["나", "\"여보세요?\"", "사기범", "\"엄마... 나야.", "휴대폰이 고장 나서", ...] — 긴 대사는 줄바꿈 단위로
 * 여러 항목에 걸쳐 쪼개져 있음). 화자 이름은 문장부호 없는 짧은 토큰이라는 특징으로 구분하고, 그 다음에 오는
 * 조각들을 다음 화자 이름이 나올 때까지 이어붙여 하나의 말풍선으로 합친다. "[전화벨]"처럼 화자 이름이 나오기
 * 전의 지문/장면 설명은 말풍선으로 표시하지 않고 건너뛴다.
 */
function isSpeakerLabelToken(s: string): boolean {
  return s.length > 0 && s.length <= 6 && !/["'.?!,…]/.test(s);
}

function buildDialogue(scriptLines: string[]): PhishingDialogueLine[] {
  const lines: PhishingDialogueLine[] = [];
  let currentSpeaker: PhishingDialogueLine["speaker"] | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentSpeaker && buffer.length > 0) {
      const text = buffer.join(" ").replace(/^"+|"+$/g, "").trim();
      if (text) lines.push({ speaker: currentSpeaker, text });
    }
    buffer = [];
  };

  for (const raw of scriptLines) {
    const trimmed = raw.trim();
    if (isSpeakerLabelToken(trimmed)) {
      flush();
      currentSpeaker = SPEAKER_LABEL_TO_SPEAKER[trimmed] ?? "caller";
      continue;
    }
    if (currentSpeaker === null) continue;
    buffer.push(trimmed);
  }
  flush();

  return lines;
}

/** 백엔드에 발신자 표시 이름 필드가 없어, 케이스명 대신 카테고리 기반 일반명("가족 사칭범" 등)으로 대체한다. */
function buildCallerLabel(category: CaseCategory): string {
  return `${CASE_CATEGORY_LABEL[category]}범`;
}

/** 카테고리별 사례 목록 API(가벼운 필드만 존재)로 목록/카드용 PhishingCase를 만든다. */
export function buildCaseSummary(categoryId: string, item: CategoryCaseSummaryResponse): PhishingCase {
  const category = mapCategoryId(categoryId);
  return {
    id: item.scenarioId,
    title: item.caseName,
    category,
    difficulty: mapDifficulty(item.difficulty),
    summary: "",
    estimatedMinutes: parseMinutes(item.estimatedLearningTime),
    completionRate: 0,
    isCompleted: false,
    recommendation: 5,
    realCaseExample: "",
    exampleMessage: "",
    phoneDialogue: [],
    callerLabel: buildCallerLabel(category),
    quiz: [],
    finalQuiz: PLACEHOLDER_QUIZ,
    textMessages: [],
    textQuiz: PLACEHOLDER_QUIZ,
    textFeedback: DEFAULT_FEEDBACK,
  };
}

/** 시나리오 상세 + 두 채널의 scenario-step을 합쳐 시뮬레이션 화면까지 쓸 수 있는 완전한 PhishingCase를 만든다. */
export function buildFullCase(
  category: CaseCategory,
  scenario: CaseScenarioResponse,
  voiceStep: CaseScenarioStepResponse,
  messageStep: CaseScenarioStepResponse,
): PhishingCase {
  const voiceQuiz = buildQuiz(voiceStep.quiz, voiceStep.choices);
  const messageQuiz = buildQuiz(messageStep.quiz, messageStep.choices);
  const voiceContent = scenario.variants.voice?.content;
  const messageContent = scenario.variants.message?.content;

  return {
    id: scenario.scenarioId,
    title: scenario.caseName,
    category,
    difficulty: mapDifficulty(scenario.difficulty),
    summary: `${scenario.caseName} 시나리오를 통해 실제 보이스피싱 수법을 학습합니다.`,
    estimatedMinutes: parseMinutes(scenario.estimatedLearningTime),
    completionRate: parseCompletionRate(scenario.completionRate),
    isCompleted: false,
    recommendation: 5,
    realCaseExample: voiceContent ?? messageContent ?? "실제 사례 예시는 준비 중입니다.",
    exampleMessage: messageContent ?? "예시 메시지는 준비 중입니다.",
    phoneDialogue: buildDialogue(voiceStep.scriptLines),
    callerLabel: buildCallerLabel(category),
    quiz: voiceStep.quiz ? [voiceQuiz] : [],
    finalQuiz: voiceQuiz,
    textMessages: messageStep.scriptLines,
    textQuiz: messageQuiz,
    textFeedback: DEFAULT_FEEDBACK,
  };
}
