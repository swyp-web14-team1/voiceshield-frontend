import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/lib/routes";

// US-02-01 ~ US-02-09 메인 화면
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="보이스쉴드"
        description="오늘의 추천 학습으로 보이스피싱 대응력을 길러보세요."
        usRange="US-02-01 ~ US-02-09"
      />
      <main className="flex flex-1 flex-col gap-4 px-5 pb-6">
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">오늘의 추천 학습</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-02-02</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">최근 학습 이어하기 · 학습 진행률</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            US-02-03 ~ US-02-06
          </p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">취약 유형</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-02-07</p>
        </section>
        <Link
          href={ROUTES.cases}
          className="mt-2 rounded-xl bg-blue-600 py-4 text-center font-semibold text-white"
        >
          사례 목록 보러가기
        </Link>
        <Link
          href={ROUTES.report}
          className="rounded-xl border border-zinc-300 py-4 text-center font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          신고 안내 바로가기 (US-02-08)
        </Link>
      </main>
    </div>
  );
}
