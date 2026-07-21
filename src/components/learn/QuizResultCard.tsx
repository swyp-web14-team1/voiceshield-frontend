import { RiCheckboxCircleFill } from "react-icons/ri";
import { MdCancel } from "react-icons/md";

/** 전화·문자 시뮬레이션 완료 화면 공용 판단 퀴즈 결과 카드(선택N 배지 + 정답/오답 pill + 해설). */
export function QuizResultCard({
  index,
  question,
  isCorrect,
  chosenLabel,
  explanation,
  stackOnNarrow = false,
}: {
  index: number;
  question: string;
  isCorrect: boolean;
  chosenLabel: string;
  explanation: string;
  /** message/progress 원래 디자인 — 좁은 컨테이너에서는 배지·질문을 세로로 쌓고 450px 이상에서만 가로로 정렬. call/progress는 항상 가로 정렬(기본값). */
  stackOnNarrow?: boolean;
}) {
  return (
    <div
      className="rounded-xl bg-white px-6.25 pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
      style={{ paddingTop: "clamp(20px, 6cqw, 34px)" }}
    >
      <div className="flex flex-col items-center gap-3.5 text-center">
        <div
          className={
            stackOnNarrow
              ? "flex w-full flex-col items-center gap-2 @[450px]:flex-row @[450px]:items-center"
              : "flex w-full items-start gap-2"
          }
        >
          <span className="flex h-[clamp(20px,5.5cqw,22px)] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1a2332] px-[clamp(6px,2cqw,8px)] text-[clamp(10px,2.8cqw,12px)] font-bold text-[#1a2332]">
            선택{index}
          </span>
          <p
            className={
              stackOnNarrow
                ? "break-keep text-center text-sm font-semibold text-[#1a2332] @[450px]:text-left"
                : "break-keep text-left text-sm font-semibold text-[#1a2332]"
            }
          >
            {question}
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-lg px-[clamp(12px,4cqw,24px)] py-2 text-left text-xs font-semibold text-white ${
            isCorrect ? "bg-[#00bc7d]" : "bg-[#df1e21]"
          }`}
        >
          {isCorrect ? (
            <RiCheckboxCircleFill size={18} className="shrink-0" />
          ) : (
            <MdCancel size={18} className="shrink-0" />
          )}
          <span className="break-keep leading-tight">{chosenLabel}</span>
        </div>
        <p className={`text-sm font-bold ${isCorrect ? "text-[#00bc7d]" : "text-[#df1e21]"}`}>
          {isCorrect ? "정확합니다!" : "위험합니다"}
        </p>
        <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
          <p className="text-left text-xs leading-relaxed text-gray-700">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
