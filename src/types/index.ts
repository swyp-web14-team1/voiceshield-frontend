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
}

export interface LearningProgress {
  totalCases: number;
  completedCases: number;
  weakCategories: CaseCategory[];
  todayLearningMinutes: number;
}
