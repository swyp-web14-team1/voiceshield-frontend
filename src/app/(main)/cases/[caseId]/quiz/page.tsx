import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCaseById } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-07-01 ~ US-07-05 퀴즈
export default async function QuizPage({
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
        title="퀴즈"
        description={phishingCase.title}
        usRange="US-07-01 ~ US-07-05"
      />
      <main className="flex flex-1 flex-col gap-3 px-5 pb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">문제 1 / 3</p>
        <p className="font-medium">문제 텍스트가 여기에 표시됩니다.</p>
        <button className="rounded-xl border border-zinc-300 py-3 px-4 text-left dark:border-zinc-700">
          보기 1
        </button>
        <button className="rounded-xl border border-zinc-300 py-3 px-4 text-left dark:border-zinc-700">
          보기 2
        </button>
        <button className="rounded-xl border border-zinc-300 py-3 px-4 text-left dark:border-zinc-700">
          보기 3
        </button>

        <Link
          href={ROUTES.quizResult(phishingCase.id)}
          className="mt-4 rounded-xl bg-blue-600 py-4 text-center font-semibold text-white"
        >
          결과 보기
        </Link>
      </main>
    </div>
  );
}
