import { PageHeader } from "@/components/layout/PageHeader";

// US-09-01 ~ US-09-03 신고 안내
export default function ReportPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="신고 안내"
        description="보이스피싱이 의심된다면 아래 방법으로 즉시 대응하세요."
        usRange="US-09-01 ~ US-09-03"
      />
      <main className="flex flex-1 flex-col gap-3 px-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-xl bg-red-600 py-4 font-semibold text-white">
            112 신고 전화
          </button>
          <button className="rounded-xl bg-red-600 py-4 font-semibold text-white">
            1332 신고 전화
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          실제 전화 연결 전, 학습이 아닌 실제 상황임을 안내합니다.
        </p>

        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">긴급 연락처</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-09-02</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">실제 대처 방법 · 예방 수칙</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-09-03</p>
        </section>
      </main>
    </div>
  );
}
