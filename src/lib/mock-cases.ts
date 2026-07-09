import type { CaseCategory, PhishingCase } from "@/types";

export const CASE_CATEGORY_LABEL: Record<CaseCategory, string> = {
  institution: "기관 사칭",
  family: "가족 사칭",
  delivery: "택배 사칭",
  messenger: "메신저 피싱",
  investment: "투자 사기",
};

export const MOCK_CASES: PhishingCase[] = [
  {
    id: "institution-01",
    title: "검찰청을 사칭한 계좌 확인 전화",
    category: "institution",
    difficulty: "medium",
    summary: "수사기관을 사칭해 개인정보와 금융정보를 요구하는 상황을 체험합니다.",
    estimatedMinutes: 8,
    completionRate: 0,
    isCompleted: false,
  },
  {
    id: "family-01",
    title: "자녀 납치를 가장한 긴급 송금 요청",
    category: "family",
    difficulty: "hard",
    summary: "자녀의 사고를 빙자해 긴박한 상황을 연출, 송금을 유도하는 상황을 체험합니다.",
    estimatedMinutes: 10,
    completionRate: 0,
    isCompleted: false,
  },
  {
    id: "delivery-01",
    title: "택배 배송 오류를 가장한 피싱 문자",
    category: "delivery",
    difficulty: "easy",
    summary: "택배 배송 조회 링크를 미끼로 개인정보를 탈취하는 상황을 체험합니다.",
    estimatedMinutes: 5,
    completionRate: 0,
    isCompleted: false,
  },
  {
    id: "messenger-01",
    title: "지인을 사칭한 메신저 피싱",
    category: "messenger",
    difficulty: "medium",
    summary: "지인의 메신저 계정을 도용해 긴급 금전을 요청하는 상황을 체험합니다.",
    estimatedMinutes: 7,
    completionRate: 0,
    isCompleted: false,
  },
  {
    id: "investment-01",
    title: "고수익을 미끼로 한 투자 사기 상담",
    category: "investment",
    difficulty: "hard",
    summary: "단기간 고수익을 미끼로 투자금을 유도하는 상황을 체험합니다.",
    estimatedMinutes: 9,
    completionRate: 0,
    isCompleted: false,
  },
];

export function getCaseById(caseId: string): PhishingCase | undefined {
  return MOCK_CASES.find((c) => c.id === caseId);
}
