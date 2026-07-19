import { RiCheckboxCircleFill } from "react-icons/ri";
import { MdCancel } from "react-icons/md";
import { playFeedbackTone } from "@/lib/sound";
import type { QuizQuestion } from "@/types";

const HEADER_GRADIENT = "linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)";

export function QuizCard({
  question,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  selected: number | null;
  onSelect: (choiceIndex: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
      <div
        className="break-keep text-center text-sm font-bold text-white"
        style={{
          backgroundImage: HEADER_GRADIENT,
          paddingInline: "clamp(12px, 5cqw, 16px)",
          paddingBlock: "clamp(7px, 2.5cqh, 10px)",
        }}
      >
        {question.question}
      </div>
      <div
        className="flex flex-col"
        style={{
          gap: "clamp(6px, 2cqh, 8px)",
          paddingInline: "clamp(16px, 7cqw, 22px)",
          paddingTop: "clamp(12px, 4cqh, 18px)",
          paddingBottom: "clamp(10px, 3.5cqh, 16px)",
        }}
      >
        {question.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrectChoice = i === question.answerIndex;
          const isCorrectAndSelected = isSelected && isCorrectChoice;
          const isWrongAndSelected = isSelected && !isCorrectChoice;
          return (
            <button
              key={i}
              type="button"
              disabled={selected !== null}
              onClick={() => {
                playFeedbackTone(i === question.answerIndex);
                onSelect(i);
              }}
              style={{
                paddingInline: "clamp(7px, 3cqw, 14px)",
                paddingBlock: "clamp(6px, 1.5cqh, 12px)",
                ...(isCorrectAndSelected ? { backgroundImage: HEADER_GRADIENT } : undefined),
              }}
              className={`flex items-center justify-between gap-2 rounded-lg border text-left text-sm font-medium transition-colors ${
                isCorrectAndSelected
                  ? "border-transparent text-white"
                  : isWrongAndSelected
                    ? "border-gray-400 bg-gray-300 text-[#1a2332]"
                    : "border-gray-300 bg-gray-100 text-[#1a2332]"
              } ${selected === null ? "cursor-pointer [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-200" : "cursor-default"}`}
            >
              <span className="flex items-center gap-2">
                <span className="shrink-0 font-bold">{i + 1}.</span>
                <span className="break-keep">{choice}</span>
              </span>
              <span className="flex size-5 shrink-0 items-center justify-center">
                {isCorrectAndSelected && <RiCheckboxCircleFill size={20} />}
                {isWrongAndSelected && <MdCancel size={20} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
