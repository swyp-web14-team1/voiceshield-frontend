import { getCaseById } from "@/lib/mock-cases";
import {
  CategoryDeliveryIcon,
  CategoryFamilyIcon,
  CategoryGovernmentIcon,
  CategoryInvestIcon,
  CategoryMessengerIcon,
  ChevronIcon,
  ShieldIcon,
} from "@/components/icons/home-icons";

const CATEGORY_TILES = [
  { label: "기관사칭", Icon: CategoryGovernmentIcon, bg: "#2b7fff" },
  { label: "가족사기", Icon: CategoryFamilyIcon, bg: "#ff2056" },
  { label: "택배사기", Icon: CategoryDeliveryIcon, bg: "#fe9a00" },
  { label: "투자사기", Icon: CategoryInvestIcon, bg: "#00bc7d" },
  { label: "메신저사기", Icon: CategoryMessengerIcon, bg: "#8e51ff" },
];

// US-02-01 ~ US-02-09 메인 화면
export default function HomePage() {
  const continueCase = getCaseById("institution-01")!;

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 [@media(min-height:950px)_and_(hover:none)_and_(pointer:coarse)]:flex-none @max-[410px]:gap-3 overflow-y-auto bg-gray-100 px-4 py-8 @max-[410px]:py-4">
      <section className="flex flex-col gap-1 rounded-xl bg-white p-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
        <p className="text-xs font-medium text-[#64748B]">피싱안전지킴이</p>
        <h1 className="text-xl font-bold text-[#1a2332]">
          안녕하세요, <span className="text-blue-600">홍길동</span> 님!
        </h1>
        <p className="mt-1 text-sm text-slate-500">오늘의 학습 진도율</p>
        <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-[#e6eaf0]">
          <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-slate-500">오늘 완료: 68%</span>
          <span className="text-xs font-bold text-blue-600">68 / 100</span>
        </div>
      </section>

      <section className="flex gap-3">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-white p-4 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-xs font-semibold text-slate-500">오늘 학습 시간 (분)</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-white p-4 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
          <p className="text-3xl font-bold text-orange-500">3</p>
          <p className="text-xs font-semibold text-slate-500">오늘 완료 시나리오</p>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 pb-5 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
        <p className="text-base font-bold tracking-[0.3px] text-[#1a2035] uppercase">
          이어서 학습하기
        </p>
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(138,155,188,0.44)]">
            <ShieldIcon className="size-7 text-white" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <p className="text-sm font-bold text-[#1a2332]">{continueCase.title}</p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                중급
              </span>
              <span className="text-xs text-slate-500">진행 60%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(138,155,188,0.21)]">
              <div className="h-2 w-3/5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
            </div>
          </div>
          <ChevronIcon className="size-3.5 shrink-0 text-[#8a9bbc]" />
        </div>
      </div>

      <section
        className="flex flex-col gap-4 rounded-xl border border-black/8 p-4 pb-6 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)]"
        style={{ backgroundImage: "linear-gradient(147deg, #2849be 0%, #2d1f4e 100%)" }}
      >
        <p className="text-base font-bold tracking-[0.3px] text-white uppercase">
          카테고리별 학습
        </p>
        <div className="grid grid-cols-3 gap-3 cursor-pointer">
          {CATEGORY_TILES.map(({ label, Icon, bg }) => (
            <div
              key={label}
              className="relative flex flex-col items-center justify-center overflow-hidden rounded-[10px] bg-white/3 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1),inset_1px_1px_0_0_rgba(255,255,255,0.6),inset_-0.8px_-0.8px_0_0_rgba(255,255,255,0.4),inset_-0px_0px_1px_0_rgba(0,0,0,0.4),inset_5px_-0px_6px_0_rgba(0,0,0,0.1)] backdrop-blur-md"
              style={{
                padding: "clamp(8px, 3cqw, 19px)",
                gap: "clamp(4px, 2cqw, 6px)",
              }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  backgroundColor: bg,
                  width: "clamp(28px, 8cqw, 40px)",
                  height: "clamp(28px, 8cqw, 40px)",
                  borderRadius: "clamp(7px, 2cqw, 10px)",
                }}
              >
                <Icon
                  className="text-white"
                  style={{ width: "clamp(14px, 4cqw, 20px)", height: "clamp(14px, 4cqw, 20px)" }}
                />
              </div>
              <span className="relative text-xs font-medium text-white">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
