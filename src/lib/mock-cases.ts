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
    title: "건강보험공단 환급금 사기 전화",
    category: "institution",
    difficulty: "medium",
    summary: "수사기관을 사칭해 개인정보와 금융정보를 요구하는 상황을 체험합니다.",
    estimatedMinutes: 10,
    completionRate: 60,
    isCompleted: false,
    recommendation: 3,
    realCaseExample:
      "건강보험공단은 최근 1년간 환급금을 빙자한 사칭 전화·문자 피해 신고가 총 1,120건에 달한다고 밝혔다. 피해자 대부분은 실제 환급 대상자와 유사한 문구에 속아 개인정보를 제공한 것으로 나타났다.",
    exampleMessage:
      "[건강보험공단] 고객님께 미지급 환급금 68,000원이 발생하였습니다. 신청기한 만료 전 아래 링크에서 본인확인 후 신청해주세요.",
    phoneDialogue: [
      { speaker: "caller", text: "안녕하세요, 국민건강보험공단입니다. 고객님 앞으로 보험료 환급금이 확인되어 연락드렸습니다." },
      { speaker: "caller", text: "본인 확인을 위해 주민등록번호와 계좌번호를 말씀해 주시면 바로 환급 절차를 도와드리겠습니다." },
      { speaker: "user", text: "환급금이요? 어떤 내용인지 문서로 먼저 확인할 수 있을까요?" },
    ],
  },
  {
    id: "family-01",
    title: "아들 납치 협박 보이스피싱",
    category: "family",
    difficulty: "easy",
    summary: "자녀의 사고를 빙자해 긴박한 상황을 연출, 송금을 유도하는 상황을 체험합니다.",
    estimatedMinutes: 10,
    completionRate: 100,
    isCompleted: true,
    recommendation: 5,
    realCaseExample:
      "경찰청 통계에 따르면 자녀·가족을 사칭한 납치 협박형 보이스피싱은 매년 명절 전후로 급증하며, 피해 금액은 건당 평균 1,500만 원 수준으로 집계됐다.",
    exampleMessage:
      "엄마 나 폰 액정 깨져서 급하게 다른 번호로 연락해. 지금 통화 안 되니까 이 번호로 문자해줘. 부탁이 있어.",
    phoneDialogue: [
      { speaker: "caller", text: "(다급한 목소리) 엄마... 나 사고 났어... 지금 많이 다쳤어..." },
      { speaker: "caller", text: "지금 합의 안 하면 큰일 나. 시간 없으니까 불러주는 계좌로 빨리 돈 좀 보내줘." },
      { speaker: "user", text: "잠깐, 목소리가 이상한데 정확히 어디 병원인지 알려줄 수 있어?" },
    ],
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
    recommendation: 4,
    realCaseExample:
      "관세청은 국제택배 통관·배송 오류를 사칭한 스미싱 문자가 온라인 쇼핑 성수기마다 급증한다고 안내하며, 출처가 불분명한 배송조회 링크는 클릭하지 말 것을 당부했다.",
    exampleMessage:
      "[택배] 고객님 주소지 오류로 배송이 보류되었습니다. 아래 주소 재확인 후 재배송 신청해주세요. http://xn--delivery-check.kr",
    phoneDialogue: [
      { speaker: "caller", text: "안녕하세요, 택배 배송기사입니다. 주소지 확인이 안 되어 문자로 안내드린 링크 확인 부탁드립니다." },
      { speaker: "caller", text: "링크에서 이름과 상세주소, 연락처만 다시 입력해 주시면 바로 재배송 처리됩니다." },
      { speaker: "user", text: "주문한 적 없는 물건인데, 정식 앱에서 직접 조회해볼게요." },
    ],
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
    recommendation: 4,
    realCaseExample:
      "경찰청에 따르면 메신저 계정 도용을 통한 지인 사칭 사기는 최근 3년간 2배 이상 증가했으며, 피해자의 지인 프로필 사진과 대화 말투를 그대로 도용하는 수법이 대부분이었다.",
    exampleMessage:
      "나야, 급하게 회사에 이체할 돈이 있는데 폰뱅킹이 막혀서 그래. 미안한데 잠깐 200만 원만 이 계좌로 보내줄 수 있어?",
    phoneDialogue: [
      { speaker: "caller", text: "바빠? 미안한데 지금 급한 일이 있어서 그런데 잠깐 통화 가능해?" },
      { speaker: "caller", text: "신분증 인증만 하면 바로 돌려줄 수 있는데, 앱으로 신분증 사진이랑 인증번호만 보내줄래?" },
      { speaker: "user", text: "목소리로 먼저 통화하자, 지금 바로 전화해볼게." },
    ],
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
    recommendation: 5,
    realCaseExample:
      "금융감독원은 SNS·리딩방을 통한 고수익 보장형 투자 사기 피해 신고가 전년 대비 40% 증가했으며, 평균 피해액은 3,200만 원에 달한다고 발표했다.",
    exampleMessage:
      "[VIP 투자방 초대] 이번 주 비공개 종목 3일 만에 수익률 200% 달성! 선착순 10명 무료 상담 링크 → http://vip-invest-open.kr",
    phoneDialogue: [
      { speaker: "caller", text: "안녕하세요, 프리미엄 투자 컨설팅팀입니다. 이번 주 한정으로 원금 보장형 상품을 안내드리고 있습니다." },
      { speaker: "caller", text: "지금 입금하시면 3일 내 최소 20% 수익을 보장해 드리는데, 오늘까지만 특별가로 가능합니다." },
      { speaker: "user", text: "원금 보장에 고수익까지 보장하는 상품은 금융당국에 등록된 상품인가요?" },
    ],
  },
];

export function getCaseById(caseId: string): PhishingCase | undefined {
  return MOCK_CASES.find((c) => c.id === caseId);
}
