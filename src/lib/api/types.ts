/**
 * 실제 백엔드(Swagger: /v3/api-docs) 스키마를 그대로 옮긴 타입.
 * PDF 명세서(77개)와 달리 실제 구현은 13개 엔드포인트뿐이며 구조도 다르다 — 이 파일이 진짜 기준이다.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  timestamp: string;
}

export interface CategoryResponse {
  categoryId: string;
  categoryName: string;
}

export interface CategoryCaseSummaryResponse {
  scenarioId: string;
  caseName: string;
  difficulty: string | null;
  estimatedLearningTime: string | null;
}

export interface CategoryCaseListResponse {
  categoryId: string;
  categoryName: string;
  cases: CategoryCaseSummaryResponse[];
}

export type CaseChannel = "MESSAGE" | "VOICE";

export interface CaseVariantOptionResponse {
  optionId: string;
  optionNumber: number;
  optionText: string;
  isCorrect: boolean;
}

export interface CaseVariantResponse {
  variantId: string;
  channel: CaseChannel;
  content: string | null;
  options: CaseVariantOptionResponse[];
}

export interface CaseScenarioResponse {
  scenarioId: string;
  caseName: string;
  difficulty: string | null;
  estimatedLearningTime: string | null;
  completionRate: string | null;
  /** 키가 소문자("message"/"voice")로 내려온다 (channel enum 값과 대소문자가 다름, 실제 응답 기준). */
  variants: Record<string, CaseVariantResponse>;
}

export interface CaseQuizResponse {
  quizId: string;
  quizNumber: number;
  question: string;
}

export interface CaseScenarioStepResponse {
  scenarioId: string;
  variantId: string;
  channel: CaseChannel;
  quiz: CaseQuizResponse | null;
  scriptLines: string[];
  choices: CaseVariantOptionResponse[];
}

export interface CaseChoiceResultOptionResponse {
  optionId: string;
  optionNumber: number;
  optionText: string;
  isCorrect: boolean;
}

export interface RecommendedLearningResponse {
  scenarioId: string;
  title: string;
  difficulty: string;
  estimatedLearningTime: string;
}

export interface CaseChoiceEvaluationResponse {
  choiceOptionId?: string;
  choiceOptionIds?: string[];
  optionNumber: number;
  isCorrect: boolean;
  quiz: CaseQuizResponse | null;
  selectedOption: CaseChoiceResultOptionResponse | null;
  selectedOptions: CaseChoiceResultOptionResponse[] | null;
  correctOption: CaseChoiceResultOptionResponse | null;
  correctOptions: CaseChoiceResultOptionResponse[] | null;
  explanation: string | null;
  recommendedLearning: RecommendedLearningResponse | null;
}

export interface ReportGuideContactResponse {
  name: string;
  phoneNumber: string;
  description: string;
}

export interface ReportGuideResponse {
  reportSteps: string[];
  emergencyContacts: ReportGuideContactResponse[];
  realActionGuide: string[];
  preventionTips: string[];
}

export interface GuestSessionResponse {
  guestSessionId: string;
  availableFeatures: string[];
}

export interface LearningCompletionResponse {
  scenarioId: string;
  status: string;
  completed: boolean;
  message: string;
}

export interface KakaoLoginRequest {
  kakaoAuthCode: string;
}
export interface KakaoLoginResponse {
  userId: string;
  loginResult: string;
  signupStatus: string;
}

export interface MemberCreateRequest {
  userId: string;
  signupStatus: "SIGNUP_COMPLETE";
}
export interface MemberResponse {
  memberId: string;
  signupStatus: string;
}
export interface MemberMeResponse {
  memberId: string;
  userId: string;
  signupStatus: string;
  name?: string;
  nickname?: string;
}
