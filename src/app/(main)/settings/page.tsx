import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/lib/routes";

// US-10-01 ~ US-10-05 설정
export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="설정" usRange="US-10-01 ~ US-10-05">
      </PageHeader>
      <main className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <section className="card border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold">글자 크기</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">US-10-01</p>
        </section>
        <section className="card border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold">TTS 속도 · 음성 설정</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">US-10-02</p>
        </section>
        <section className="card border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold">학습 알림 시간 · 앱 설치 안내</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            US-10-03 (알림 권한, 홈 화면 추가)
          </p>
        </section>

        <div className="mt-2 flex flex-col gap-4">
          <Link
            href={ROUTES.login}
            className="btn border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200"
          >
            로그아웃 (US-10-04)
          </Link>
          <Link
            href={ROUTES.settingsAccount}
            className="btn border border-red-300 text-red-600 dark:border-red-900"
          >
            회원탈퇴 (US-10-05)
          </Link>
        </div>
      </main>
    </div>
  );
}
