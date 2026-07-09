import { PageHeader } from "@/components/layout/PageHeader";

// US-08-01 ~ US-08-04 학습 기록
export default function HistoryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="학습 기록"
        description="나의 학습 현황과 취약 유형을 확인해보세요."
        usRange="US-08-01 ~ US-08-04"
      />
      <main className="flex flex-1 flex-col gap-3 px-5 pb-6">
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">학습 진행률</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-08-01</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">완료한 학습</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-08-02</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">취약 유형</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-08-03</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">최근 학습</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-08-04</p>
        </section>
      </main>
    </div>
  );
}
