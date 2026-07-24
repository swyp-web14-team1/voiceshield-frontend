export type UserMode = "guest" | "member";

export type CaseCategory =
  | "institution" // 기관 사칭
  | "family" // 가족 사칭
  | "delivery" // 택배 사칭
  | "messenger" // 메신저 피싱
  | "investment"; // 투자 사기

export type CaseDifficulty = "easy" | "medium" | "hard";

export type SimulationMode = "voice" | "message";

export interface PhishingDialogueLine {
  speaker: "caller" | "user";
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  /** 실제 API에서 온 퀴즈일 때만 존재 — choices와 같은 순서의 실제 optionId. choices 평가 API(evaluateChoice) 호출에 필요. */
  optionIds?: string[];
}

export interface PhishingCase {
  id: string;
  title: string;
  category: CaseCategory;
  difficulty: CaseDifficulty;
  summary: string;
  estimatedMinutes: number;
  completionRate: number; // 0~100
  isCompleted: boolean;
  recommendation: number; // 0~5 (별점)
  realCaseExample: string;
  exampleMessage: string;
  phoneDialogue: PhishingDialogueLine[];
  callerLabel: string; // 전화 시뮬레이션에서 발신자로 표시할 이름 (예: "시청 주무관 사칭범")
  quiz: QuizQuestion[]; // 전화 시뮬레이션 중간에 등장하는 판단 퀴즈
  finalQuiz: QuizQuestion; // 시뮬레이션 완료 후 "마무리 퀴즈"에서 등장하는 문제 (같은 주제의 다른 문항)
  textMessages: string[]; // 문자 시뮬레이션에서 순서대로 등장하는 문자 메시지(모두 사기범 발신)
  textQuiz: QuizQuestion; // 문자 시뮬레이션의 판단 퀴즈("어떻게 행동 하시겠습니까?", 2지선다)
  textFeedback: { correct: string; wrong: string }; // 문자 시뮬레이션 완료 직후 상단에 보여줄 요약 피드백 문구
}

export interface LearningProgress {
  totalCases: number;
  completedCases: number;
  weakCategories: CaseCategory[];
  todayLearningMinutes: number;
}

// POST /api/analyze 요청/응답 — Gemini가 생성하는 시뮬레이션 결과 피드백
export interface AnalyzeRequest {
  caseTitle: string;
  category: string;
  quiz: QuizQuestion[];
  answers: (number | null)[];
}

export interface AiAnalysisResult {
  feedback: string; // AI 피드백 본문
  responseSpeed: string; // 반응 속도 (예: 빠름/보통/느림)
  suspicion: string; // 의심도 (예: 낮음/적절/높음)
  goodPoints: string[]; // 좋았던 점
  missedPoints: string[]; // 놓친 부분
  actionTips: string[]; // 행동수칙
}
