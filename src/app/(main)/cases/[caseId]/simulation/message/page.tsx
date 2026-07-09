import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-05-14 ~ US-05-21 대화 시뮬레이션(메시지)
export default async function MessageSimulationPage({
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
        title="메신저"
        description={phishingCase.title}
        usRange="US-05-14 ~ US-05-21"
      />
      <main className="flex flex-1 flex-col justify-between px-5 pb-6">
        <section className="flex flex-col gap-2">
          <div className="w-fit max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
            상대방 메시지 (US-05-16)
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            보낼 메시지 선택 (US-05-17, US-05-18)
          </p>
          <button className="rounded-xl border border-zinc-300 py-3 px-4 text-left dark:border-zinc-700">
            선택지 1
          </button>
          <button className="rounded-xl border border-zinc-300 py-3 px-4 text-left dark:border-zinc-700">
            선택지 2
          </button>
          <Link
            href={ROUTES.result(phishingCase.id)}
            className="mt-2 rounded-xl bg-blue-600 py-4 text-center font-semibold text-white"
          >
            시뮬레이션 종료 → 결과 보기
          </Link>
        </section>
      </main>
    </div>
  );
}
