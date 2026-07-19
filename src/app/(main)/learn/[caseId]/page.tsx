import { notFound } from "next/navigation";
import Link from "next/link";
import { BiPhoneCall } from "react-icons/bi";
import { LuMessageSquareMore } from "react-icons/lu";
import { getCaseById } from "@/lib/mock-cases";
import { CATEGORY_META } from "@/lib/case-meta";
import { ROUTES } from "@/lib/routes";
import { BackHeader } from "@/components/layout/BackHeader";
import { CaseStatsGrid } from "@/components/cards/CaseStatsGrid";

export default async function ScenarioDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const phishingCase = getCaseById(caseId);
  if (!phishingCase) notFound();

  const category = CATEGORY_META[phishingCase.category];
  const CategoryIcon = category.Icon;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <BackHeader title="학습 시나리오" backHref={ROUTES.learn} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 mt-2">
        <div className="overflow-hidden rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
          <div
            className="flex items-center gap-1.5 px-3.5 py-2.5"
            style={{ backgroundImage: "linear-gradient(175deg, #2849be 0%, #2d1f4e 100%)" }}
          >
            <div
              className="flex size-5 items-center justify-center rounded-md"
              style={{ backgroundColor: category.bg }}
            >
              <CategoryIcon className="size-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{category.label}</span>
          </div>

          <div className="flex flex-col px-3.5 pt-4 pb-5">
            <p className="text-xl font-bold text-[#1a2332]">시나리오 : {phishingCase.title}</p>

            <div style={{ marginTop: "clamp(16px, 6cqw, 25px)" }}>
              <CaseStatsGrid phishingCase={phishingCase} />
            </div>

            <div className="flex flex-col gap-1.75" style={{ marginTop: "clamp(20px, 7.5cqw, 31px)" }}>
              <p className="text-sm font-bold text-gray-700">요약</p>
              <div className="rounded-xl bg-gray-100 px-5 py-2.5">
                <p className="text-xs leading-relaxed text-[#1a2332]">{phishingCase.summary}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.75" style={{ marginTop: "clamp(16px, 6cqw, 25px)" }}>
              <p className="text-sm font-bold text-gray-700">실제 사례</p>
              <div className="rounded-xl border border-orange-500 bg-orange-500/10 px-5 py-2.5">
                <p className="text-xs leading-relaxed text-[#1a2332]">{phishingCase.realCaseExample}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.75" style={{ marginTop: "clamp(16px, 6cqw, 25px)" }}>
              <p className="text-sm font-bold text-gray-700">예시 문자</p>
              <div className="rounded-xl bg-gray-100 px-5 py-2.5">
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#1a2332]">{phishingCase.exampleMessage}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3" style={{ marginTop: "clamp(16px, 6cqw, 25px)" }}>
              <p className="text-sm font-bold text-gray-700">예시 전화 대화</p>
              <div className="flex flex-col gap-2.5 rounded-xl bg-gray-200 p-3">
                {phishingCase.phoneDialogue.map((line, i) => (
                  <div key={i} className={`flex ${line.speaker === "user" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[85%] rounded-lg px-2.5 py-2 text-xs leading-relaxed ${
                        line.speaker === "user" ? "bg-white text-[#1a2332]" : "bg-gray-600 text-white"
                      }`}
                    >
                      {line.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center justify-center border-t border-gray-200 bg-white px-4"
        style={{ gap: "clamp(10px, 3cqw, 20px)", paddingBlock: "clamp(8px, 2.5cqh, 11px)" }}
      >
        <Link
          href={ROUTES.call(caseId)}
          className="flex items-center justify-center gap-1.25 rounded-lg text-sm font-bold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] transition-shadow [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),inset_0_0_0_999px_rgba(0,0,0,0.12)]"
          style={{
            backgroundImage: "linear-gradient(90deg, #60a5fa 0%, #2849be 100%)",
            width: "clamp(100px, 30cqw, 127px)",
            paddingBlock: "clamp(8px, 2.5cqh, 10px)",
          }}
        >
          <BiPhoneCall size={17} />
          전화로 시작
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-1.25 rounded-lg bg-white text-sm font-bold text-blue-600 shadow-[0px_1px_3px_rgba(0,0,0,0.1)] transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-blue-50"
          style={{ width: "clamp(100px, 30cqw, 127px)", paddingBlock: "clamp(8px, 2.5cqh, 10px)" }}
        >
          <LuMessageSquareMore size={17} />
          문자로 시작
        </button>
      </div>
    </div>
  );
}
