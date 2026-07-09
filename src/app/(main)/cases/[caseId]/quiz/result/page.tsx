import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-07-03 ~ US-07-05 퀴즈 결과 / 오답 복습 / 다시 풀기
export default async function QuizResultPage({
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
        title="퀴즈 결과"
        description={phishingCase.title}
        usRange="US-07-03 ~ US-07-05"
      />
      <main className="flex flex-1 flex-col gap-4 px-5 pb-6">
        <section className="rounded-2xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
          <p className="text-3xl font-bold">2 / 3</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">정답률</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">오답 복습</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-07-04</p>
        </section>

        <div className="mt-2 flex flex-col gap-3">
          <Link
            href={ROUTES.quiz(phishingCase.id)}
            className="rounded-xl bg-blue-600 py-4 text-center font-semibold text-white"
          >
            다시 풀기
          </Link>
          <Link
            href={ROUTES.home}
            className="rounded-xl border border-zinc-300 py-4 text-center font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            메인 화면으로 이동
          </Link>
        </div>
      </main>
    </div>
  );
}
