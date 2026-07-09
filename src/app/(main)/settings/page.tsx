import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/lib/routes";

// US-10-01 ~ US-10-05 설정
export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="설정" usRange="US-10-01 ~ US-10-05">
      </PageHeader>
      <main className="flex flex-1 flex-col gap-3 px-5 pb-6">
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">글자 크기</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-10-01</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">TTS 속도 · 음성 설정</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">US-10-02</p>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">학습 알림 시간 · 앱 설치 안내</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            US-10-03 (알림 권한, 홈 화면 추가)
          </p>
        </section>

        <div className="mt-2 flex flex-col gap-3">
          <button className="rounded-xl border border-zinc-300 py-4 font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
            로그아웃 (US-10-04)
          </button>
          <Link
            href={ROUTES.settingsAccount}
            className="rounded-xl border border-red-300 py-4 text-center font-semibold text-red-600 dark:border-red-900"
          >
            회원탈퇴 (US-10-05)
          </Link>
        </div>
      </main>
    </div>
  );
}
