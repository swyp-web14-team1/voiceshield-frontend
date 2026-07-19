/**
 * 서비스 라우팅 맵.
 * 01. 유저스토리 - 시트1.pdf 의 US ID 구간과 1:1로 매핑된다.
 */
export const ROUTES = {
  login: "/", // US-01 회원가입/로그인

  home: "/home", // US-02 메인 화면

  learn: "/learn", // US-03 학습하기
  scenario: (caseId: string) => `/learn/${caseId}`, // US-03 학습 시나리오 상세
  call: (caseId: string) => `/learn/${caseId}/call`, // US-03 전화 시뮬레이션(수신 전화 화면)
  callProgress: (caseId: string) => `/learn/${caseId}/call/progress`, // US-03 전화 시뮬레이션(통화 진행/퀴즈/완료 화면)
  callAnalysis: (caseId: string) => `/learn/${caseId}/call/analysis`, // US-03 전화 시뮬레이션(AI 분석 결과 화면)
  callQuiz: (caseId: string) => `/learn/${caseId}/call/quiz`, // US-03 전화 시뮬레이션(마무리 퀴즈 화면)

  record: "/record", // US-04~08 학습 기록

  emergency: "/emergency", // US-09 긴급 신고 안내

  settings: "/settings", // US-10 설정
  settingsAccount: "/settings/account", // US-10 회원탈퇴
} as const;
