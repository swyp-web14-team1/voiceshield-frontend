import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import type { AnalyzeRequest, AiAnalysisResult } from "@/types";

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    feedback: { type: SchemaType.STRING },
    responseSpeed: { type: SchemaType.STRING },
    suspicion: { type: SchemaType.STRING },
    goodPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    missedPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    actionTips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["feedback", "responseSpeed", "suspicion", "goodPoints", "missedPoints", "actionTips"],
};

function buildPrompt({ caseTitle, category, quiz, answers }: AnalyzeRequest) {
  const questionSummaries = quiz
    .map((q, i) => {
      const chosen = answers[i];
      const isCorrect = chosen === q.answerIndex;
      const chosenText = chosen !== null && chosen !== undefined ? q.choices[chosen] : "선택하지 않음";
      return `문항 ${i + 1}: ${q.question}\n사용자가 선택한 답: ${chosenText}\n정답 여부: ${isCorrect ? "정답" : "오답"}\n해설: ${q.explanation}`;
    })
    .join("\n\n");

  return `당신은 보이스피싱 예방 교육 앱 "보이스쉴드"의 AI 코치입니다. 사용자가 "${category}" 유형의 "${caseTitle}" 시나리오 음성 시뮬레이션을 마쳤습니다.

아래는 사용자가 시뮬레이션 중 풀었던 판단 퀴즈 결과입니다:

${questionSummaries}

이 결과를 바탕으로 사용자의 대응을 분석해서 아래 항목을 한국어로 작성하세요:
- feedback: 사용자의 전반적인 대응에 대한 2~3문장 피드백 (격려하는 톤, 정답/오답 내용을 구체적으로 언급)
- responseSpeed: "빠름" / "보통" / "느림" 중 하나 (정답률이 높을수록 침착하고 빠르게 판단한 것으로 평가)
- suspicion: "낮음" / "적절" / "높음" 중 하나 (사기 정황을 얼마나 적절히 의심했는지)
- goodPoints: 정답을 맞춘 문항을 근거로 잘한 점을 짧은 문장씩 배열로 (정답이 하나도 없으면 빈 배열)
- missedPoints: 오답인 문항을 근거로 놓친 부분을 짧은 문장씩 배열로 (오답이 하나도 없으면 빈 배열)
- actionTips: 이 시나리오 유형(${category})에 실제로 도움이 되는 행동수칙 3~4개를 짧은 문장 배열로

모든 문장은 존댓말로, 모바일 화면에 표시될 짧고 명확한 문장으로 작성하세요.`;
}

// 순서대로 시도한다 — 앞 모델이 할당량 소진(429)이나 서비스 종료(404) 등으로 실패하면 다음 모델로 넘어간다.
const MODEL_FALLBACK_CHAIN = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-pro-latest",
];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AnalyzeRequest;

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(body);

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json", responseSchema },
      });
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text()) as AiAnalysisResult;
      return NextResponse.json(parsed);
    } catch {
      // 이 모델이 막혀 있으면(할당량 초과, 서비스 종료 등) 다음 후보 모델로 넘어간다.
    }
  }

  return NextResponse.json({ error: "AI 분석에 실패했습니다." }, { status: 502 });
}
