import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { CASE_CATEGORY_LABEL, MOCK_CASES } from "@/lib/mock-cases";
import { ROUTES } from "@/lib/routes";

// US-03-01 ~ US-03-14 사례 선택
export default function CasesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="사례 목록"
        description="유형별 보이스피싱 사례를 학습해보세요."
        usRange="US-03-01 ~ US-03-14"
      />
      <main className="flex flex-1 flex-col gap-3 px-5 pb-6">
        {MOCK_CASES.map((c) => (
          <Link
            key={c.id}
            href={ROUTES.case(c.id)}
            className="flex flex-col gap-1 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {CASE_CATEGORY_LABEL[c.category]}
            </span>
            <h2 className="font-semibold">{c.title}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{c.summary}</p>
            <p className="text-xs text-zinc-400">
              난이도 {c.difficulty} · 예상 {c.estimatedMinutes}분
            </p>
          </Link>
        ))}
      </main>
    </div>
  );
}
