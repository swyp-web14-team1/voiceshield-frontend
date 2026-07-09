import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-04-01 ~ US-04-10 사례 학습
export default async function CaseDetailPage({
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
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={phishingCase.title}
        description={phishingCase.summary}
        usRange="US-04-01 ~ US-04-10"
      />
      <main className="flex flex-1 flex-col gap-4 px-5 pb-6">
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">학습 목표 · 사기 수법</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            US-04-02, US-04-04
          </p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">실제 사례 · 실제 문자 · 실제 통화 예시 · 이미지</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            US-04-03, US-04-05 ~ US-04-07
          </p>
        </section>
        <section className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">TTS 재생 · 다시 듣기</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            US-04-08, US-04-09
          </span>
        </section>

        <div className="mt-2 flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            학습 완료 후 모드를 선택하세요.
          </p>
          <Link
            href={ROUTES.simulationVoice(phishingCase.id)}
            className="rounded-xl bg-blue-600 py-4 text-center font-semibold text-white"
          >
            보이스 모드로 시작
          </Link>
          <Link
            href={ROUTES.simulationMessage(phishingCase.id)}
            className="rounded-xl border border-zinc-300 py-4 text-center font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            메시지 모드로 시작
          </Link>
        </div>
      </main>
    </div>
  );
}
