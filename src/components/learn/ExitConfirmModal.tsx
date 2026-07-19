export function ExitConfirmModal({
  open,
  onExit,
  onCancel,
}: {
  open: boolean;
  onExit: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{ padding: "clamp(20px, 8cqw, 40px)" }}
      onClick={onCancel}
    >
      <div
        className="flex w-full flex-col items-center justify-center rounded-xl bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)]"
        style={{
          maxWidth: "clamp(280px, 90cqw, 360px)",
          height: "clamp(160px, 60cqw, 206px)",
          padding: "clamp(18px, 7cqw, 26px) clamp(20px, 8cqw, 40px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-[#1a2332]" style={{ fontSize: "clamp(17px, 5.5cqw, 22px)" }}>
              학습을 종료하시겠습니까?
            </p>
            <p className="text-sm leading-relaxed text-gray-600">
              현재 진행 중인 시뮬레이션은 종료되며, 다음에 다시 시작할 경우 처음부터 진행됩니다.
            </p>
          </div>
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={onExit}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-50"
              style={{ height: "clamp(36px, 12cqw, 44px)" }}
            >
              종료하기
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-gray-700 text-sm font-bold text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800"
              style={{ height: "clamp(36px, 12cqw, 44px)" }}
            >
              계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
