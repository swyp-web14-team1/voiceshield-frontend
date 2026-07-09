import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-06-01 ~ US-06-05 결과 및 피드백
export default async function ResultPage({
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
        title="학습 결과"
        description={phishingCase.title}
        usRange="US-06-01 ~ US-06-05"
      />
      <main className="flex flex-1 flex-col gap-4 px-5 pb-6">
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">정답 및 해설</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-06-02</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">AI 피드백</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-06-03</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">평가 기준</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            위험 신호 인식, 안전 대응 선택, 개인정보 보호, 송금 회피
          </p>
        </section>

        <Link
          href={ROUTES.quiz(phishingCase.id)}
          className="mt-2 rounded-xl bg-blue-600 py-4 text-center font-semibold text-white"
        >
          퀴즈로 복습하기
        </Link>
        <Link
          href={ROUTES.home}
          className="rounded-xl border border-zinc-300 py-4 text-center font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          메인 화면으로 이동 (US-06-05)
        </Link>
      </main>
    </div>
  );
}
