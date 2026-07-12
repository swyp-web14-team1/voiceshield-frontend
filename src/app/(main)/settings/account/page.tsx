import { PageHeader } from "@/components/layout/PageHeader";

// US-10-05 회원탈퇴 (탈퇴 안내 → 탈퇴 사유 입력 → 탈퇴 완료)
export default function AccountDeletionPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="회원탈퇴"
        description="탈퇴 시 회원 정보와 학습 이력이 모두 삭제됩니다."
        usRange="US-10-05"
      />
      <main className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <section className="card border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold">탈퇴 사유 입력</h2>
        </section>
        <button className="btn mt-2 bg-red-600 text-white">
          위 내용을 확인했습니다. 동의하고 탈퇴하기
        </button>
      </main>
    </div>
  );
}
