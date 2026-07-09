/**
 * 서비스 라우팅 맵.
 * 01. 유저스토리 - 시트1.pdf 의 US ID 구간과 1:1로 매핑된다.
 */
export const ROUTES = {
  login: "/login", // US-01 회원가입/로그인

  home: "/", // US-02 메인 화면

  cases: "/cases", // US-03 사례 선택
  case: (caseId: string) => `/cases/${caseId}`, // US-04 사례 학습
  simulationVoice: (caseId: string) => `/cases/${caseId}/simulation/voice`, // US-05 대화 시뮬레이션(보이스)
  simulationMessage: (caseId: string) => `/cases/${caseId}/simulation/message`, // US-05 대화 시뮬레이션(메시지)
  result: (caseId: string) => `/cases/${caseId}/result`, // US-06 결과 및 피드백
  quiz: (caseId: string) => `/cases/${caseId}/quiz`, // US-07 퀴즈
  quizResult: (caseId: string) => `/cases/${caseId}/quiz/result`, // US-07 퀴즈 결과

  history: "/history", // US-08 학습 기록
  report: "/report", // US-09 신고 안내

  settings: "/settings", // US-10 설정
  settingsAccount: "/settings/account", // US-10 회원탈퇴
} as const;
