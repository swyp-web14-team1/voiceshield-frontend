import type { Metadata, Viewport } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import "./globals.css";
import { FontScaleProvider } from "@/components/providers/FontScaleProvider";

const pretendard = localFont({
  variable: "--font-pretendard",
  src: [
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "보이스쉴드 | 피싱안전교실",
  description: "실제 보이스피싱 상황을 체험하며 대응 능력을 기르는 AI 기반 예방 학습 플랫폼",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s={"보통":1,"크게":${14 / 12},"아주크게":${16 / 12}};var v=localStorage.getItem("voiceshield-font-size");document.documentElement.style.setProperty("--font-scale",String(s[v]||1));}catch(e){}})();`,
          }}
        />
      </head>
      <body className="@container h-full" style={{ backgroundColor: "var(--surface)" }}>
        <FontScaleProvider>
          <div
            aria-hidden="true"
            className="fixed inset-0 hidden overflow-hidden bg-white min-[1400px]:block dark:bg-zinc-950"
          >
            <Image src="/bg.svg" alt="" fill priority sizes="100vw" className="object-cover" />
          </div>

          <aside
            className="@container fixed inset-y-0 left-0 hidden flex-col items-start justify-center overflow-hidden min-[1400px]:flex"
            style={{
              right: "calc(500px + clamp(160px, 14vw, 388px))",
              paddingLeft: "max(24px, 10cqw)",
              transform: "translateY(clamp(-56px,-4vh,-28px))",
            }}
          >
            <div className="relative flex flex-col items-start gap-1" style={{ paddingRight: "clamp(12px, 3cqw, 24px)" }}>
              <p
                className="font-normal text-gray-500 dark:text-[#7c7c7c]"
                style={{ fontSize: "clamp(13px, 2.4cqw, 19px)" }}
              >
                체험형 피싱 예방 학습
              </p>
              <div className="relative">
                <Image
                  src="/star.svg"
                  alt=""
                  aria-hidden="true"
                  width={104}
                  height={49}
                  className="pointer-events-none absolute top-2 -right-6"
                  style={{ width: "clamp(70px, 13.6cqw, 104px)", height: "auto" }}
                />
                <h1
                  className="relative break-keep font-extrabold text-[#3f3f3f] dark:text-white"
                  style={{ fontSize: "clamp(22px, 4.8cqw, 32px)", lineHeight: 1.35 }}
                >
                  읽는 교육이 아닌,
                  <br />
                  직접 대응하며 배우는 <span className="text-[#4376DB]">새로운 학습 경험</span>
                </h1>
              </div>
              <div className="flex items-center mt-2.5" style={{ gap: "clamp(10px, 2.2cqw, 16px)" }}>
                <Image
                  src="/logo-j.svg"
                  alt="피싱안전교실"
                  width={400}
                  height={64}
                  style={{ width: "clamp(220px, 29.3cqw, 400px)", height: "auto" }}
                />
              </div>
            </div>
          </aside>

          <div className="no-scrollbar relative mx-auto flex h-dvh w-full max-w-125 flex-col overflow-y-auto shadow-[0px_0px_16px_0px_rgba(0,0,0,0.1)] @max-[400px]:overflow-hidden bg-surface min-[1400px]:mr-[clamp(160px,14vw,388px)] min-[1400px]:ml-auto">
            {children}
          </div>
        </FontScaleProvider>
      </body>
    </html>
  );
}
