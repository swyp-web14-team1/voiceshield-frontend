/**
 * 서비스 라우팅 맵.
 * 01. 유저스토리 - 시트1.pdf 의 US ID 구간과 1:1로 매핑된다.
 */
export const ROUTES = {
  login: "/", // US-01 회원가입/로그인

  home: "/home", // US-02 메인 화면

  learn: "/learn", // US-03 학습하기
  scenario: (caseId: string) => `/learn/${caseId}`, // US-03 학습 시나리오 상세

  emergency: "/emergency", // US-09 긴급 신고 안내

  settings: "/settings", // US-10 설정
  settingsAccount: "/settings/account", // US-10 회원탈퇴
} as const;
