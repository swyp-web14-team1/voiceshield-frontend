import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-05-01 ~ US-05-13 대화 시뮬레이션(보이스)
export default async function VoiceSimulationPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const phishingCase = getCaseById(caseId);

  if (!phishingCase) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-900 text-white">
      <PageHeader
        title="전화 수신"
        description={phishingCase.title}
        usRange="US-05-01 ~ US-05-13"
      />
      <main className="flex flex-1 flex-col justify-between px-5 pb-6">
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
          <p className="text-sm text-zinc-300">
            TTS 재생 · 대화 텍스트 · 다시 듣기 (US-05-03 ~ US-05-05)
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-300">
            행동 선택지 (US-05-06, US-05-07)
          </p>
          <button className="rounded-xl border border-white/20 py-4 text-left px-4">
            선택지 1
          </button>
          <button className="rounded-xl border border-white/20 py-4 text-left px-4">
            선택지 2
          </button>
          <Link
            href={ROUTES.result(phishingCase.id)}
            className="mt-2 rounded-xl bg-blue-600 py-4 text-center font-semibold"
          >
            시나리오 종료 → 결과 보기
          </Link>
        </section>
      </main>
    </div>
  );
}
