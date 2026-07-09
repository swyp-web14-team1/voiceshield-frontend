import { PageHeader } from "@/components/layout/PageHeader";

// US-01-01 ~ US-01-08 회원가입/로그인
export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="로그인"
        description="카카오 로그인 또는 게스트로 체험을 시작하세요."
        usRange="US-01-01 ~ US-01-08"
      />
      <main className="flex flex-1 flex-col justify-end gap-3 px-5 pb-10">
        <button className="w-full rounded-xl bg-yellow-300 py-4 font-semibold text-zinc-900">
          카카오 로그인
        </button>
        <button className="w-full rounded-xl border border-zinc-300 py-4 font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
          게스트로 체험하기
        </button>
      </main>
    </div>
  );
}
